from django.db import models
from django.conf import settings


class CoachProfile(models.Model):
    SPECIALITY_CHOICES = [
        ('musculation', 'Musculation'),
        ('cardio', 'Cardio'),
        ('crossfit', 'CrossFit'),
        ('yoga', 'Yoga'),
        ('pilates', 'Pilates'),
        ('boxe', 'Boxe'),
        ('natation', 'Natation'),
        ('nutrition', 'Nutrition'),
        ('autre', 'Autre'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coach_profile'
    )
    speciality = models.CharField(max_length=50, choices=SPECIALITY_CHOICES)
    bio = models.TextField(blank=True, null=True)
    price_per_session = models.DecimalField(max_digits=8, decimal_places=2)
    experience_years = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    photo = models.ImageField(upload_to='coaches/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Profil Coach'

    def __str__(self):
        return f'Coach {self.user.full_name} - {self.speciality}'

    @property
    def average_rating(self):
        reviews = self.user.reviews_received.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None


class Availability(models.Model):
    DAY_CHOICES = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]

    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name = 'Disponibilité'
        verbose_name_plural = 'Disponibilités'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['coach', 'day_of_week', 'start_time']

    def __str__(self):
        return f'{self.coach.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}'
