from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from users.permissions import IsAdmin, IsClient, IsAdminOrReadOnly


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Course.objects.filter(is_active=True).select_related('coach')
        date        = self.request.query_params.get('date')
        course_type = self.request.query_params.get('type')
        level       = self.request.query_params.get('level')
        coach_id    = self.request.query_params.get('coach')
        upcoming    = self.request.query_params.get('upcoming')
        if date:        qs = qs.filter(date=date)
        if course_type: qs = qs.filter(course_type=course_type)
        if level:       qs = qs.filter(level=level)
        if coach_id:    qs = qs.filter(coach_id=coach_id)
        if upcoming == 'true':
            qs = qs.filter(date__gte=timezone.now().date())
        return qs


class CourseCreateView(generics.CreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Course.objects.all()


class EnrollView(APIView):
    """Client: s'inscrire à un cours.
    Handles re-enrollment after cancellation (unique_together fix).
    """
    permission_classes = [IsClient]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if course.is_full:
            return Response({'error': 'Ce cours est complet.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already confirmed
        existing = Enrollment.objects.filter(client=request.user, course=course).first()

        if existing:
            if existing.status == 'confirmed':
                return Response({'error': 'Vous êtes déjà inscrit à ce cours.'}, status=status.HTTP_400_BAD_REQUEST)
            # Re-activate a cancelled/waiting enrollment
            existing.status = 'confirmed'
            existing.save()
            enrollment = existing
        else:
            # Fresh enrollment
            enrollment = Enrollment.objects.create(
                client=request.user,
                course=course,
                status='confirmed'
            )

        from notifications.utils import send_notification
        send_notification(
            user=request.user,
            message=f'Inscription confirmée au cours "{course.name}" le {course.date} à {course.start_time}.'
        )
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


class UnenrollView(APIView):
    """Client: se désinscrire d'un cours"""
    permission_classes = [IsClient]

    def delete(self, request, course_id):
        try:
            enrollment = Enrollment.objects.get(
                client=request.user,
                course_id=course_id,
                status='confirmed'
            )
        except Enrollment.DoesNotExist:
            return Response({'error': 'Inscription introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        enrollment.status = 'cancelled'
        enrollment.save()
        return Response({'message': 'Désinscription effectuée.'})


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsClient]

    def get_queryset(self):
        return Enrollment.objects.filter(
            client=self.request.user
        ).select_related('course').order_by('-enrolled_at')


class CourseEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Enrollment.objects.filter(
            course_id=self.kwargs['course_id'],
            status='confirmed'
        ).select_related('client')