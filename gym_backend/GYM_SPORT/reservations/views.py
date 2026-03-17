from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Reservation
from .serializers import ReservationSerializer, ReservationStatusSerializer
from users.permissions import IsAdmin, IsCoach, IsClient


class CreateReservationView(generics.CreateAPIView):
    """Client: créer une réservation"""
    serializer_class = ReservationSerializer
    permission_classes = [IsClient]

    def perform_create(self, serializer):
        reservation = serializer.save()
        from notifications.utils import send_notification
        # Notify coach
        send_notification(
            user=reservation.coach,
            message=f'Nouvelle réservation de {reservation.client.full_name} le {reservation.date} à {reservation.start_time}.'
        )
        # Notify client
        send_notification(
            user=reservation.client,
            message=f'Réservation envoyée à {reservation.coach.full_name}. En attente de confirmation.'
        )


class MyReservationsView(generics.ListAPIView):
    """Client: ses réservations"""
    serializer_class = ReservationSerializer
    permission_classes = [IsClient]

    def get_queryset(self):
        qs = Reservation.objects.filter(client=self.request.user).select_related('coach')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class ClientCancelReservationView(APIView):
    """Client: annuler sa réservation"""
    permission_classes = [IsClient]

    def patch(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk, client=request.user)
        if reservation.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Cette réservation ne peut pas être annulée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reservation.status = 'cancelled'
        reservation.save()

        from notifications.utils import send_notification
        send_notification(
            user=reservation.coach,
            message=f'{reservation.client.full_name} a annulé sa réservation du {reservation.date}.'
        )
        return Response({'message': 'Réservation annulée.'})


class CoachReservationsView(generics.ListAPIView):
    """Coach: ses réservations reçues"""
    serializer_class = ReservationSerializer
    permission_classes = [IsCoach]

    def get_queryset(self):
        qs = Reservation.objects.filter(coach=self.request.user).select_related('client')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class CoachRespondReservationView(APIView):
    """Coach: accepter ou refuser une réservation"""
    permission_classes = [IsCoach]

    def patch(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk, coach=request.user)

        if reservation.status != 'pending':
            return Response(
                {'error': 'Cette réservation a déjà été traitée.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReservationStatusSerializer(reservation, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            from notifications.utils import send_notification
            if updated.status == 'confirmed':
                send_notification(
                    user=reservation.client,
                    message=f'✅ {reservation.coach.full_name} a confirmé votre réservation du {reservation.date} à {reservation.start_time}.'
                )
            else:
                send_notification(
                    user=reservation.client,
                    message=f'❌ {reservation.coach.full_name} a refusé votre réservation du {reservation.date}. Raison: {updated.refusal_reason}'
                )
            return Response(ReservationSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminReservationListView(generics.ListAPIView):
    """Admin: toutes les réservations"""
    serializer_class = ReservationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Reservation.objects.all().select_related('client', 'coach')
        status_filter = self.request.query_params.get('status')
        coach_id = self.request.query_params.get('coach')
        date = self.request.query_params.get('date')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if coach_id:
            qs = qs.filter(coach_id=coach_id)
        if date:
            qs = qs.filter(date=date)
        return qs


class AdminCancelReservationView(APIView):
    """Admin: annuler n'importe quelle réservation"""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk)
        reservation.status = 'cancelled'
        reservation.save()
        from notifications.utils import send_notification
        send_notification(
            user=reservation.client,
            message=f'Votre réservation du {reservation.date} a été annulée par l\'administration.'
        )
        send_notification(
            user=reservation.coach,
            message=f'La réservation de {reservation.client.full_name} du {reservation.date} a été annulée par l\'administration.'
        )
        return Response({'message': 'Réservation annulée.'})
