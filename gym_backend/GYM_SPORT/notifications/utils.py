from .models import Notification


def send_notification(user, message):
    """Create an in-app notification for a user."""
    Notification.objects.create(user=user, message=message)
