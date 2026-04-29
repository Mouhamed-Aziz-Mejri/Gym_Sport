"""
Seed script - run with:
    python manage.py shell < seed_data.py
    OR
    python seed_data.py   (from project root with venv active)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Gym_App.settings')
django.setup()

from django.contrib.auth import get_user_model
from coaches.models import CoachProfile, Availability
from courses.models import Course
from reservations.models import Reservation
from datetime import date, time, timedelta

User = get_user_model()

print("🌱 Seeding database...")

# ── Admin ─────────────────────────────────────────────────────────────────────
admin, _ = User.objects.get_or_create(
    email='admin@gym.com',
    defaults={
        'first_name': 'Super',
        'last_name': 'Admin',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    }
)
admin.set_password('HK@dm!n#2026$Gym')
admin.save()
print(f"  ✅ Admin: {admin.email} / HK@dm!n#2026$Gym")

# ── Coaches ───────────────────────────────────────────────────────────────────
coaches_data = [
    {
        'email': 'karim@gym.com', 'first_name': 'Karim', 'last_name': 'Mansour',
        'phone': '+21620000001',
        'profile': {
            'speciality': 'musculation', 'price_per_session': 60,
            'experience_years': 5, 'bio': 'Coach certifié en musculation et fitness.'
        }
    },
    {
        'email': 'sarra@gym.com', 'first_name': 'Sarra', 'last_name': 'Belhadj',
        'phone': '+21620000002',
        'profile': {
            'speciality': 'yoga', 'price_per_session': 45,
            'experience_years': 7, 'bio': 'Spécialiste yoga & pilates, méditation.'
        }
    },
    {
        'email': 'ahmed@gym.com', 'first_name': 'Ahmed', 'last_name': 'Trabelsi',
        'phone': '+21620000003',
        'profile': {
            'speciality': 'crossfit', 'price_per_session': 70,
            'experience_years': 4, 'bio': 'Expert CrossFit et HIIT. Résultats garantis!'
        }
    },
]

coach_objects = []
for c in coaches_data:
    profile_data = c.pop('profile')
    user, _ = User.objects.get_or_create(
        email=c['email'],
        defaults={**c, 'role': 'coach'}
    )
    user.set_password('C0@ch!Gym#2026$K')
    user.save()
    CoachProfile.objects.get_or_create(user=user, defaults=profile_data)

    # Availabilities
    for day in [0, 1, 2, 3, 4]:  # Mon-Fri
        Availability.objects.get_or_create(
            coach=user, day_of_week=day,
            defaults={'start_time': time(8, 0), 'end_time': time(18, 0)}
        )
    coach_objects.append(user)
    print(f"  ✅ Coach: {user.email} / C0@ch!Gym#2026$K")

# ── Clients ───────────────────────────────────────────────────────────────────
clients_data = [
    {'email': 'client1@gym.com', 'first_name': 'Mohamed', 'last_name': 'Ben Ali'},
    {'email': 'client2@gym.com', 'first_name': 'Yasmine', 'last_name': 'Chaouachi'},
    {'email': 'client3@gym.com', 'first_name': 'Nour', 'last_name': 'Hamdi'},
]

client_objects = []
for c in clients_data:
    user, _ = User.objects.get_or_create(
        email=c['email'],
        defaults={**c, 'role': 'client'}
    )
    user.set_password('C0@cl1!Gym#2026$K')
    user.save()
    client_objects.append(user)
    print(f"  ✅ Client: {user.email} / C0@cl1!Gym#2026$K")

# ── Courses ───────────────────────────────────────────────────────────────────
today = date.today()
courses_data = [
    {
        'name': 'Yoga Matinal', 'course_type': 'yoga', 'level': 'tous',
        'coach': coach_objects[1], 'date': today + timedelta(days=1),
        'start_time': time(8, 0), 'end_time': time(9, 0),
        'max_capacity': 12, 'price': 20, 'location': 'Salle Zen'
    },
    {
        'name': 'HIIT Intensif', 'course_type': 'hiit', 'level': 'intermediaire',
        'coach': coach_objects[2], 'date': today + timedelta(days=2),
        'start_time': time(10, 0), 'end_time': time(11, 0),
        'max_capacity': 15, 'price': 25, 'location': 'Salle principale'
    },
    {
        'name': 'Musculation Débutant', 'course_type': 'musculation', 'level': 'debutant',
        'coach': coach_objects[0], 'date': today + timedelta(days=3),
        'start_time': time(16, 0), 'end_time': time(17, 30),
        'max_capacity': 10, 'price': 30, 'location': 'Salle de poids'
    },
]

for cd in courses_data:
    Course.objects.get_or_create(
        name=cd['name'], date=cd['date'],
        defaults=cd
    )
    print(f"  ✅ Course: {cd['name']} le {cd['date']}")

# ── Sample Reservations ───────────────────────────────────────────────────────
reservations_data = [
    {
        'client': client_objects[0], 'coach': coach_objects[0],
        'date': today + timedelta(days=1), 'start_time': time(9, 0), 'end_time': time(10, 0),
        'status': 'confirmed', 'notes': 'Objectif: prise de masse'
    },
    {
        'client': client_objects[1], 'coach': coach_objects[1],
        'date': today + timedelta(days=2), 'start_time': time(11, 0), 'end_time': time(12, 0),
        'status': 'pending', 'notes': 'Première séance yoga'
    },
    {
        'client': client_objects[2], 'coach': coach_objects[2],
        'date': today + timedelta(days=3), 'start_time': time(14, 0), 'end_time': time(15, 0),
        'status': 'confirmed', 'notes': 'Programme CrossFit avancé'
    },
]

for rd in reservations_data:
    Reservation.objects.get_or_create(
        client=rd['client'], coach=rd['coach'], date=rd['date'], start_time=rd['start_time'],
        defaults=rd
    )
    print(f"  ✅ Reservation: {rd['client'].first_name} → {rd['coach'].first_name} le {rd['date']}")

print("\n🎉 Seeding terminé!")
print("\n📋 Comptes de test:")
print("  Admin  → admin@gym.com     / HK@dm!n#2026$Gym")
print("  Coach  → karim@gym.com     / C0@chK!Gym#2026$K")
print("  Coach  → sarra@gym.com     / C0@chS!Gym#2026$K")
print("  Coach  → ahmed@gym.com     / C0@chA!Gym#2026$K")
print("  Client → client1@gym.com   / C0@cl1!Gym#2026$K")
print("  Client → client2@gym.com   / C0@cl2!Gym#2026$K")
