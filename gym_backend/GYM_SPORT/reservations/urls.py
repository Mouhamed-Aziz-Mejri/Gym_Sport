from django.urls import path
from . import views

urlpatterns = [
    # Client
    path('', views.MyReservationsView.as_view(), name='my-reservations'),
    path('create/', views.CreateReservationView.as_view(), name='reservation-create'),
    path('<int:pk>/cancel/', views.ClientCancelReservationView.as_view(), name='reservation-cancel'),

    # Coach
    path('coach/', views.CoachReservationsView.as_view(), name='coach-reservations'),
    path('coach/<int:pk>/respond/', views.CoachRespondReservationView.as_view(), name='coach-respond'),

    # Admin
    path('admin/all/', views.AdminReservationListView.as_view(), name='admin-reservations'),
    path('admin/<int:pk>/cancel/', views.AdminCancelReservationView.as_view(), name='admin-cancel'),
]
