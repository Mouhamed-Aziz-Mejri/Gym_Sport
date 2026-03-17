from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course-list'),
    path('create/', views.CourseCreateView.as_view(), name='course-create'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),

    # Enrollment
    path('<int:course_id>/enroll/', views.EnrollView.as_view(), name='course-enroll'),
    path('<int:course_id>/unenroll/', views.UnenrollView.as_view(), name='course-unenroll'),
    path('<int:course_id>/enrollments/', views.CourseEnrollmentsView.as_view(), name='course-enrollments'),

    # My enrollments
    path('my-enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
]
