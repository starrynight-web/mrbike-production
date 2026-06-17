"""
4.10 — Background Tasks (Celery-Ready Stubs)
============================================
Tasks are currently called synchronously (e.g., via management commands or
a cron job). To activate Celery:

  1. pip install celery==5.3.6 django-celery-beat==2.6.0
  2. Add to settings/base.py:
       CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
       CELERY_RESULT_BACKEND = CELERY_BROKER_URL
       INSTALLED_APPS += ['django_celery_beat']
  3. Create core/celery.py (see CELERY_APP_CONFIG below)
  4. Add to core/__init__.py: from .celery import app as celery_app
  5. Run worker: celery -A core worker --loglevel=info
  6. Run scheduler: celery -A core beat --loglevel=info

NOTE: Redis is already in the stack (redis==5.0.8 in requirements.txt).
"""

from django.utils import timezone
from .models import UsedBikeListing
from apps.users.services.email_service import email_service
from apps.users.models import Notification
import logging

logger = logging.getLogger(__name__)


def log_listing_view(listing_id: int, user_id, session_id: str):
    """
    M4 FIX: Async task (via Django-Q) for logging listing view behavior.
    Called from UsedBikeListingViewSet.retrieve() to avoid blocking the HTTP response.
    Offloads the DB write that was previously blocking ~5-20ms per page view.
    """
    try:
        from apps.recommendations.models import UserBehaviorLog
        from apps.marketplace.models import UsedBikeListing
        from django.contrib.auth import get_user_model

        User = get_user_model()
        listing = UsedBikeListing.objects.select_related('bike_model').filter(pk=listing_id).first()
        if not listing:
            return

        user = None
        if user_id:
            user = User.objects.filter(pk=user_id).first()

        UserBehaviorLog.objects.create(
            user=user,
            session_id=session_id or 'anonymous',
            behavior_type='listing_view',
            used_listing=listing,
            bike_model=listing.bike_model
        )
    except Exception as e:
        logger.error(f"[log_listing_view] Failed to log behavior for listing {listing_id}: {e}")




# @shared_task(bind=True, max_retries=3)
def process_listing_images_async(listing_id: int):
    """
    4.10: Async image processing task.
    Currently image compression blocks POST /marketplace/listings/ for 3-10s.
    Activating this task will reduce that to <500ms.
    """
    try:
        from apps.marketplace.models import ListingImage
        images = ListingImage.objects.filter(listing_id=listing_id, webp_image__isnull=True)
        for img in images:
            # from apps.marketplace.image_processor import ImageProcessingService
            # ImageProcessingService.process_and_upload(img)
            # Backend processing is skipped; Cloudinary handles dynamic optimization
            logger.info(f"[Task] Processed image {img.id} for listing {listing_id} (Skipped, using Cloudinary)")
    except Exception as exc:
        logger.error(f"[Task] Image processing failed for listing {listing_id}: {exc}")
        # self.retry(exc=exc)  # Uncomment with Celery


# @shared_task
def check_listing_expiry():
    """
    Task to be run daily (via cron or Celery Beat).
    Marks listings as 'expired' if they passed their expiry date.
    Sends in-app notification to sellers.
    """
    now = timezone.now()
    expired_listings = UsedBikeListing.objects.filter(
        status='active',
        expires_at__lte=now
    )
    
    count = expired_listings.count()
    for listing in expired_listings:
        listing.status = 'expired'
        listing.save()
        
        # Notify seller
        seller = listing.seller
        Notification.objects.create(
            user=seller,
            title="Listing Expired",
            message=f'Your listing "{listing.title}" has expired and is no longer public.'
        )
        logger.info(f"Listing {listing.id} marked as expired.")
        
    return f"Processed {count} expired listings."


# @shared_task
def notify_approaching_expiry():
    """
    Notifies users whose listings expire in 3 days.
    Schedule (Beat): Daily at 10:00 AM BD time → 04:00 UTC
    crontab(hour=4, minute=0)
    """
    three_days_from_now = timezone.now() + timezone.timedelta(days=3)
    target_date = three_days_from_now.date()
    
    approaching = UsedBikeListing.objects.filter(
        status='active',
        expires_at__date=target_date
    )
    
    for listing in approaching:
        Notification.objects.create(
            user=listing.seller,
            title="Listing Expiring Soon",
            message=f'Your listing "{listing.title}" will expire in 3 days. Renew it now to keep it public.'
        )
    
    return f"Notified {approaching.count()} sellers about approaching expiry."


# ─────────────────────────────────────────────────────────────
# CELERY_APP_CONFIG (copy to core/celery.py when activating)
# ─────────────────────────────────────────────────────────────
CELERY_APP_CONFIG = """
# core/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')
app = Celery('mrbikebd')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'check-listing-expiry': {
        'task': 'apps.marketplace.tasks.check_listing_expiry',
        'schedule': 86400,  # daily
    },
    'notify-expiry-warnings': {
        'task': 'apps.marketplace.tasks.notify_approaching_expiry',
        'schedule': 86400,  # daily
    },
}
"""
