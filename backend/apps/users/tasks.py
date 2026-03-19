from django_q.tasks import async_task
from .services.email_service import email_service
import logging

logger = logging.getLogger(__name__)

def send_async_email(method_name, *args, **kwargs):
    """
    Background task to send emails via BrevoEmailService.
    """
    try:
        method = getattr(email_service, method_name)
        return method(*args, **kwargs)
    except Exception as e:
        logger.error(f"Failed to send background email via {method_name}: {e}")
        return False
