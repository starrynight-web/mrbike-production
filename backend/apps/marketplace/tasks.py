from django.utils import timezone
from .models import UsedBikeListing
from apps.users.services.email_service import email_service
from apps.users.models import Notification
import logging

logger = logging.getLogger(__name__)

def check_listing_expiry():
    """
    Task to be run by Django-Q daily.
    Marks listings as 'expired' if they passed their expiry date.
    Sends notification to sellers.
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
        # Email could be added here if needed
        logger.info(f"Listing {listing.id} marked as expired.")
        
    return f"Processed {count} expired listings."

def notify_approaching_expiry():
    """
    Notifies users whose listings expire in 3 days.
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
