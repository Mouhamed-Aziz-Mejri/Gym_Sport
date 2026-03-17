from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from users.permissions import IsClient, IsAdmin


class CreateReviewView(generics.CreateAPIView):
    """Client: laisser un avis sur un coach"""
    serializer_class = ReviewSerializer
    permission_classes = [IsClient]


class CoachReviewsView(generics.ListAPIView):
    """Voir tous les avis d'un coach"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            coach_id=self.kwargs['coach_id']
        ).select_related('client')


class MyReviewsView(generics.ListAPIView):
    """Client: voir ses avis donnés"""
    serializer_class = ReviewSerializer
    permission_classes = [IsClient]

    def get_queryset(self):
        return Review.objects.filter(client=self.request.user)


class DeleteReviewView(generics.DestroyAPIView):
    """Admin: supprimer un avis"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin]
    queryset = Review.objects.all()
