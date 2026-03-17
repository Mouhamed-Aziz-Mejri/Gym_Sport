from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CoachProfile, Availability

User = get_user_model()


class AvailabilitySerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'day_label', 'start_time', 'end_time']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError('L\'heure de début doit être avant l\'heure de fin.')
        return data


class CoachProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachProfile
        fields = [
            'id', 'speciality', 'bio', 'price_per_session',
            'experience_years', 'is_available', 'photo', 'created_at'
        ]


class CoachListSerializer(serializers.ModelSerializer):
    """Serializer léger pour liste de coachs"""
    profile = CoachProfileSerializer(source='coach_profile', read_only=True)
    full_name = serializers.CharField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'avatar', 'profile', 'average_rating', 'total_reviews']

    def get_average_rating(self, obj):
        try:
            return obj.coach_profile.average_rating
        except CoachProfile.DoesNotExist:
            return None

    def get_total_reviews(self, obj):
        return obj.reviews_received.count()


class CoachDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour profil coach"""
    profile = CoachProfileSerializer(source='coach_profile', read_only=True)
    availabilities = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.CharField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    total_sessions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone', 'avatar',
            'profile', 'availabilities',
            'average_rating', 'total_reviews', 'total_sessions'
        ]

    def get_average_rating(self, obj):
        try:
            return obj.coach_profile.average_rating
        except CoachProfile.DoesNotExist:
            return None

    def get_total_reviews(self, obj):
        return obj.reviews_received.count()

    def get_total_sessions(self, obj):
        return obj.coach_reservations.filter(status='confirmed').count()
