from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateReviewView.as_view(), name='review-create'),
    path('coach/<int:coach_id>/', views.CoachReviewsView.as_view(), name='coach-reviews'),
    path('mine/', views.MyReviewsView.as_view(), name='my-reviews'),
    path('<int:pk>/delete/', views.DeleteReviewView.as_view(), name='review-delete'),
]
