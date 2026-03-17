from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import CoachProfile, Availability
from .serializers import (
    CoachListSerializer, CoachDetailSerializer,
    CoachProfileSerializer, AvailabilitySerializer
)
from users.permissions import IsAdmin, IsCoach, IsAdminOrReadOnly

User = get_user_model()


class CoachListView(generics.ListAPIView):
    """Liste publique des coachs avec filtres"""
    serializer_class = CoachListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.filter(role='coach', is_active=True).select_related('coach_profile')
        speciality = self.request.query_params.get('speciality')
        available = self.request.query_params.get('available')
        if speciality:
            qs = qs.filter(coach_profile__speciality=speciality)
        if available == 'true':
            qs = qs.filter(coach_profile__is_available=True)
        return qs


class CoachDetailView(generics.RetrieveAPIView):
    """Profil complet d'un coach"""
    serializer_class = CoachDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='coach').prefetch_related('availabilities')

    def get_object(self):
        return get_object_or_404(User, pk=self.kwargs['pk'], role='coach')


class CoachProfileUpdateView(generics.RetrieveUpdateAPIView):
    """Coach: modifier son propre profil"""
    serializer_class = CoachProfileSerializer
    permission_classes = [IsCoach]

    def get_object(self):
        profile, _ = CoachProfile.objects.get_or_create(user=self.request.user)
        return profile


class AvailabilityListCreateView(generics.ListCreateAPIView):
    """Coach: voir et ajouter ses disponibilités"""
    serializer_class = AvailabilitySerializer
    permission_classes = [IsCoach]

    def get_queryset(self):
        return Availability.objects.filter(coach=self.request.user)

    def perform_create(self, serializer):
        serializer.save(coach=self.request.user)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Coach: modifier/supprimer une disponibilité"""
    serializer_class = AvailabilitySerializer
    permission_classes = [IsCoach]

    def get_queryset(self):
        return Availability.objects.filter(coach=self.request.user)


class AdminCoachProfileView(generics.RetrieveUpdateAPIView):
    """Admin: modifier le profil d'un coach"""
    serializer_class = CoachProfileSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        coach = get_object_or_404(User, pk=self.kwargs['pk'], role='coach')
        profile, _ = CoachProfile.objects.get_or_create(user=coach)
        return profile
