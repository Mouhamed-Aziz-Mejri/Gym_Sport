from django.contrib import admin
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'course_type', 'coach', 'date', 'start_time', 'max_capacity', 'enrolled_count', 'is_active']
    list_filter = ['course_type', 'level', 'is_active', 'date']
    search_fields = ['name', 'coach__first_name', 'coach__last_name']
    ordering = ['date', 'start_time']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'course', 'status', 'enrolled_at']
    list_filter = ['status']
