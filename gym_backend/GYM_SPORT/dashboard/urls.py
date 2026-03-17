from django.urls import path
from . import views

urlpatterns = [
    path('admin/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('coach/', views.CoachDashboardView.as_view(), name='coach-dashboard'),
]
