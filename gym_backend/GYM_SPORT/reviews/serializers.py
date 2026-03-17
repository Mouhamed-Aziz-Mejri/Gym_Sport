from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'client', 'client_name', 'coach', 'coach_name',
                  'rating', 'comment', 'created_at']
        read_only_fields = ['client', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        coach = data.get('coach')

        if coach and coach.role != 'coach':
            raise serializers.ValidationError('L\'utilisateur sélectionné n\'est pas un coach.')

        if coach and request:
            # Check if client had at least one confirmed session with this coach
            from reservations.models import Reservation
            had_session = Reservation.objects.filter(
                client=request.user,
                coach=coach,
                status='confirmed'
            ).exists()
            if not had_session:
                raise serializers.ValidationError(
                    'Vous ne pouvez noter un coach qu\'après une séance confirmée.'
                )

            # Check duplicate
            if Review.objects.filter(client=request.user, coach=coach).exists():
                raise serializers.ValidationError('Vous avez déjà noté ce coach.')

        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)
