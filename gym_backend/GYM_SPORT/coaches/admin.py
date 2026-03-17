from django.contrib import admin
from .models import CoachProfile, Availability


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'speciality', 'price_per_session', 'experience_years', 'is_available']
    list_filter = ['speciality', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['coach', 'day_of_week', 'start_time', 'end_time']
    list_filter = ['day_of_week']
