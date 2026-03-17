from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import timedelta

from reservations.models import Reservation
from courses.models import Course, Enrollment
from reviews.models import Review
from users.permissions import IsAdmin, IsCoach

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        total_clients  = User.objects.filter(role='client').count()
        total_coaches  = User.objects.filter(role='coach').count()
        new_clients    = User.objects.filter(role='client', date_joined__date__gte=month_start).count()

        total_res      = Reservation.objects.count()
        pending_res    = Reservation.objects.filter(status='pending').count()
        confirmed_res  = Reservation.objects.filter(status='confirmed').count()
        cancelled_res  = Reservation.objects.filter(status='cancelled').count()
        month_res      = Reservation.objects.filter(date__gte=month_start).count()
        today_res      = Reservation.objects.filter(date=today).count()

        total_courses  = Course.objects.filter(is_active=True).count()
        upcoming       = Course.objects.filter(date__gte=today, is_active=True).count()
        total_enroll   = Enrollment.objects.filter(status='confirmed').count()

        # Top coaches — round avg_rating cleanly
        raw_coaches = (
            User.objects.filter(role='coach')
            .annotate(
                total_sessions=Count(
                    'coach_reservations',
                    filter=Q(coach_reservations__status='confirmed')
                ),
                avg_rating=Avg('reviews_received__rating')
            )
            .order_by('-total_sessions')[:5]
            .values('id', 'first_name', 'last_name', 'total_sessions', 'avg_rating')
        )

        top_coaches = []
        for c in raw_coaches:
            top_coaches.append({
                'id':             c['id'],
                'first_name':     c['first_name'],
                'last_name':      c['last_name'],
                'total_sessions': c['total_sessions'],
                'avg_rating':     round(float(c['avg_rating']), 1) if c['avg_rating'] is not None else None,
            })

        # Daily stats last 7 days
        daily_stats = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Reservation.objects.filter(date=day).count()
            daily_stats.append({'date': str(day), 'count': count})

        status_breakdown = (
            Reservation.objects
            .values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        return Response({
            'users': {
                'total_clients': total_clients,
                'total_coaches': total_coaches,
                'new_clients_this_month': new_clients,
            },
            'reservations': {
                'total':     total_res,
                'pending':   pending_res,
                'confirmed': confirmed_res,
                'cancelled': cancelled_res,
                'this_month': month_res,
                'today':     today_res,
                'by_status': list(status_breakdown),
            },
            'courses': {
                'total_active':      total_courses,
                'upcoming':          upcoming,
                'total_enrollments': total_enroll,
            },
            'top_coaches':              top_coaches,
            'daily_stats_last_7_days':  daily_stats,
        })


class CoachDashboardView(APIView):
    permission_classes = [IsCoach]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)
        coach = request.user

        total_sessions = Reservation.objects.filter(coach=coach, status='confirmed').count()
        pending        = Reservation.objects.filter(coach=coach, status='pending').count()
        cancelled      = Reservation.objects.filter(coach=coach, status='cancelled').count()
        this_month     = Reservation.objects.filter(coach=coach, date__gte=month_start).count()
        today_sessions = Reservation.objects.filter(coach=coach, date=today, status='confirmed').count()

        upcoming = Reservation.objects.filter(
            coach=coach, date__gte=today, status='confirmed'
        ).select_related('client').order_by('date', 'start_time')[:5]

        upcoming_data = [
            {
                'id':         r.id,
                'client':     r.client.full_name,
                'date':       str(r.date),
                'start_time': str(r.start_time),
                'end_time':   str(r.end_time),
            }
            for r in upcoming
        ]

        avg_raw    = Review.objects.filter(coach=coach).aggregate(avg=Avg('rating'))['avg']
        avg_rating = round(float(avg_raw), 1) if avg_raw is not None else None
        total_rev  = Review.objects.filter(coach=coach).count()

        return Response({
            'sessions': {
                'total_confirmed': total_sessions,
                'pending':         pending,
                'cancelled':       cancelled,
                'this_month':      this_month,
                'today':           today_sessions,
            },
            'upcoming_sessions': upcoming_data,
            'reviews': {
                'average_rating': avg_rating,
                'total_reviews':  total_rev,
            },
        })