from django.db import models
from django.conf import settings


class Course(models.Model):
    TYPE_CHOICES = [
        ('yoga', 'Yoga'),
        ('hiit', 'HIIT'),
        ('pilates', 'Pilates'),
        ('zumba', 'Zumba'),
        ('crossfit', 'CrossFit'),
        ('cardio', 'Cardio'),
        ('musculation', 'Musculation'),
        ('boxe', 'Boxe'),
        ('autre', 'Autre'),
    ]

    LEVEL_CHOICES = [
        ('debutant', 'Débutant'),
        ('intermediaire', 'Intermédiaire'),
        ('avance', 'Avancé'),
        ('tous', 'Tous niveaux'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    course_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='autre')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='tous')
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_capacity = models.PositiveIntegerField(default=15)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    location = models.CharField(max_length=100, default='Salle principale')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Cours'
        verbose_name_plural = 'Cours'
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.name} - {self.date} {self.start_time}'

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status='confirmed').count()

    @property
    def available_spots(self):
        return self.max_capacity - self.enrolled_count

    @property
    def is_full(self):
        return self.available_spots <= 0


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('waiting', 'Liste d\'attente'),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='confirmed')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Inscription'
        verbose_name_plural = 'Inscriptions'
        unique_together = ['client', 'course']

    def __str__(self):
        return f'{self.client.full_name} → {self.course.name}'
