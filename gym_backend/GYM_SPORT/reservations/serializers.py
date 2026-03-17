from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Reservation

User = get_user_model()


class ReservationSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.full_name', read_only=True)
    coach_speciality = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'client', 'client_name', 'coach', 'coach_name',
            'coach_speciality', 'date', 'start_time', 'end_time',
            'status', 'status_label', 'notes', 'refusal_reason',
            'duration_minutes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['client', 'status', 'refusal_reason', 'created_at', 'updated_at']

    def get_coach_speciality(self, obj):
        try:
            return obj.coach.coach_profile.speciality
        except Exception:
            return None

    def validate(self, data):
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        coach = data.get('coach')

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError('L\'heure de début doit être avant l\'heure de fin.')

        if date and date < timezone.now().date():
            raise serializers.ValidationError('Impossible de réserver dans le passé.')

        if coach and coach.role != 'coach':
            raise serializers.ValidationError('L\'utilisateur sélectionné n\'est pas un coach.')

        # Check coach availability conflict
        if coach and date and start_time and end_time:
            conflict = Reservation.objects.filter(
                coach=coach,
                date=date,
                status__in=['pending', 'confirmed'],
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            if self.instance:
                conflict = conflict.exclude(pk=self.instance.pk)
            if conflict.exists():
                raise serializers.ValidationError('Le coach n\'est pas disponible sur ce créneau.')

        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class ReservationStatusSerializer(serializers.ModelSerializer):
    """Used by coach to accept/refuse"""
    class Meta:
        model = Reservation
        fields = ['status', 'refusal_reason']

    def validate(self, data):
        status = data.get('status')
        if status not in ['confirmed', 'refused']:
            raise serializers.ValidationError('Action invalide. Utilisez "confirmed" ou "refused".')
        if status == 'refused' and not data.get('refusal_reason'):
            raise serializers.ValidationError('Une raison de refus est requise.')
        return data
