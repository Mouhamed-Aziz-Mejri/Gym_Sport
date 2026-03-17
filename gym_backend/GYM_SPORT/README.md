# 🏋️ Smart Gym Management — Django Backend

## Stack
- **Backend**: Django 4.2 + Django REST Framework
- **Auth**: JWT (SimpleJWT)
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **CORS**: django-cors-headers

---

## ⚡ Installation rapide

```bash
# 1. Activer le venv
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Migrations
python manage.py makemigrations users coaches courses reservations notifications reviews
python manage.py migrate

# 4. Seed data (comptes de test)
python seed_data.py

# 5. Lancer le serveur
python manage.py runserver
```

---

## 👤 Comptes de test

| Rôle   | Email                | Mot de passe |
|--------|----------------------|--------------|
| Admin  | admin@gym.com        | admin123     |
| Coach  | karim@gym.com        | coach123     |
| Coach  | sarra@gym.com        | coach123     |
| Coach  | ahmed@gym.com        | coach123     |
| Client | client1@gym.com      | client123    |
| Client | client2@gym.com      | client123    |

---

## 🔌 API Endpoints

### Auth
| Method | URL                        | Description              | Access  |
|--------|----------------------------|--------------------------|---------|
| POST   | /api/auth/register/        | Inscription client       | Public  |
| POST   | /api/auth/login/           | Login → JWT tokens       | Public  |
| POST   | /api/auth/token/refresh/   | Rafraîchir le token      | Public  |
| GET    | /api/auth/me/              | Mon profil               | Auth    |
| PUT    | /api/auth/me/              | Modifier mon profil      | Auth    |
| POST   | /api/auth/change-password/ | Changer mot de passe     | Auth    |
| GET    | /api/auth/users/           | Liste utilisateurs       | Admin   |
| POST   | /api/auth/users/create-coach/ | Créer un coach        | Admin   |

### Coaches
| Method | URL                              | Description                  | Access       |
|--------|----------------------------------|------------------------------|--------------|
| GET    | /api/coaches/                    | Liste coachs (filtres dispo) | Auth         |
| GET    | /api/coaches/{id}/               | Profil complet coach         | Auth         |
| GET    | /api/coaches/me/profile/         | Mon profil coach             | Coach        |
| PUT    | /api/coaches/me/profile/         | Modifier mon profil          | Coach        |
| GET    | /api/coaches/me/availabilities/  | Mes disponibilités           | Coach        |
| POST   | /api/coaches/me/availabilities/  | Ajouter disponibilité        | Coach        |
| DELETE | /api/coaches/me/availabilities/{id}/ | Supprimer dispo          | Coach        |
| PUT    | /api/coaches/{id}/profile/       | Modifier profil coach        | Admin        |

### Courses
| Method | URL                                   | Description            | Access  |
|--------|---------------------------------------|------------------------|---------|
| GET    | /api/courses/                         | Liste cours            | Auth    |
| POST   | /api/courses/create/                  | Créer un cours         | Admin   |
| GET    | /api/courses/{id}/                    | Détail cours           | Auth    |
| PUT    | /api/courses/{id}/                    | Modifier cours         | Admin   |
| DELETE | /api/courses/{id}/                    | Supprimer cours        | Admin   |
| POST   | /api/courses/{id}/enroll/             | S'inscrire             | Client  |
| DELETE | /api/courses/{id}/unenroll/           | Se désinscrire         | Client  |
| GET    | /api/courses/my-enrollments/          | Mes inscriptions       | Client  |
| GET    | /api/courses/{id}/enrollments/        | Inscrits d'un cours    | Admin   |

### Reservations
| Method | URL                                      | Description              | Access  |
|--------|------------------------------------------|--------------------------|---------|
| GET    | /api/reservations/                       | Mes réservations         | Client  |
| POST   | /api/reservations/create/                | Créer réservation        | Client  |
| PATCH  | /api/reservations/{id}/cancel/           | Annuler ma réservation   | Client  |
| GET    | /api/reservations/coach/                 | Réservations reçues      | Coach   |
| PATCH  | /api/reservations/coach/{id}/respond/    | Accepter / Refuser       | Coach   |
| GET    | /api/reservations/admin/all/             | Toutes les réservations  | Admin   |
| PATCH  | /api/reservations/admin/{id}/cancel/     | Annuler (admin)          | Admin   |

### Notifications
| Method | URL                                  | Description              | Access |
|--------|--------------------------------------|--------------------------|--------|
| GET    | /api/notifications/                  | Mes notifications        | Auth   |
| GET    | /api/notifications/unread-count/     | Nombre non lues          | Auth   |
| POST   | /api/notifications/mark-all-read/    | Tout marquer comme lu    | Auth   |
| PATCH  | /api/notifications/{id}/read/        | Marquer une comme lue    | Auth   |

### Reviews
| Method | URL                              | Description          | Access  |
|--------|----------------------------------|----------------------|---------|
| POST   | /api/reviews/create/             | Laisser un avis      | Client  |
| GET    | /api/reviews/coach/{id}/         | Avis d'un coach      | Auth    |
| GET    | /api/reviews/mine/               | Mes avis donnés      | Client  |
| DELETE | /api/reviews/{id}/delete/        | Supprimer avis       | Admin   |

### Dashboard
| Method | URL                      | Description              | Access |
|--------|--------------------------|--------------------------|--------|
| GET    | /api/dashboard/admin/    | Statistiques globales    | Admin  |
| GET    | /api/dashboard/coach/    | Mes statistiques         | Coach  |

---

## 🔐 Authentification

Toutes les requêtes protégées nécessitent le header:
```
Authorization: Bearer <access_token>
```

### Exemple login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "client1@gym.com", "password": "client123"}'
```

### Exemple réservation
```bash
curl -X POST http://localhost:8000/api/reservations/create/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"coach": 2, "date": "2025-04-10", "start_time": "10:00", "end_time": "11:00", "notes": "Prise de masse"}'
```

---

## 🗂️ Structure du projet

```
GYM_SPORT/
├── Gym_App/          → Settings, URLs, WSGI
├── users/            → CustomUser model, Auth JWT
├── coaches/          → CoachProfile, Availability
├── courses/          → Course, Enrollment
├── reservations/     → Reservation (séances privées)
├── notifications/    → Notification in-app
├── reviews/          → Avis clients sur coachs
├── dashboard/        → Stats Admin & Coach
├── manage.py
├── seed_data.py      → Données de test
└── requirements.txt
```

---

## 🚦 Flux de réservation

```
Client POST /reservations/create/
    ↓ status = pending
Coach GET /reservations/coach/   ← voit la demande
    ↓
Coach PATCH /reservations/coach/{id}/respond/
    ↓ {"status": "confirmed"} ou {"status": "refused", "refusal_reason": "..."}
Client reçoit une notification automatique
```
