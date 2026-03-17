from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['client', 'coach', 'date', 'start_time', 'end_time', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['client__first_name', 'client__last_name', 'coach__first_name', 'coach__last_name']
    ordering = ['-date', '-start_time']
    readonly_fields = ['created_at', 'updated_at']
