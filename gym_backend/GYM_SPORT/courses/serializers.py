from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Enrollment

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.full_name', read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'course_type', 'level',
            'coach', 'coach_name', 'date', 'start_time', 'end_time',
            'max_capacity', 'price', 'location', 'is_active',
            'enrolled_count', 'available_spots', 'is_full', 'is_enrolled',
            'created_at'
        ]
        read_only_fields = ['created_at']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(client=request.user, status='confirmed').exists()
        return False

    def validate(self, data):
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError('L\'heure de début doit être avant l\'heure de fin.')
        return data


class EnrollmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_date = serializers.DateField(source='course.date', read_only=True)
    course_time = serializers.TimeField(source='course.start_time', read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'client', 'client_name', 'course', 'course_name',
            'course_date', 'course_time', 'status', 'enrolled_at'
        ]
        read_only_fields = ['client', 'enrolled_at']

    def validate(self, data):
        course = data.get('course')
        request = self.context.get('request')

        if course and course.is_full:
            raise serializers.ValidationError('Ce cours est complet.')

        if course and Enrollment.objects.filter(
            client=request.user, course=course, status='confirmed'
        ).exists():
            raise serializers.ValidationError('Vous êtes déjà inscrit à ce cours.')

        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)
