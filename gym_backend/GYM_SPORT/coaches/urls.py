from django.urls import path
from . import views

urlpatterns = [
    # Public / clients
    path('', views.CoachListView.as_view(), name='coach-list'),
    path('<int:pk>/', views.CoachDetailView.as_view(), name='coach-detail'),

    # Coach: own profile
    path('me/profile/', views.CoachProfileUpdateView.as_view(), name='coach-profile-me'),
    path('me/availabilities/', views.AvailabilityListCreateView.as_view(), name='availability-list'),
    path('me/availabilities/<int:pk>/', views.AvailabilityDetailView.as_view(), name='availability-detail'),

    # Admin
    path('<int:pk>/profile/', views.AdminCoachProfileView.as_view(), name='admin-coach-profile'),
]
