import logging
import os
from django.utils import timezone
from django.db import transaction
from .models import UsedBikeListing
from apps.users.models import Notification
from apps.users.services.email_service import email_service
from apps.core.services import revalidate_tags

logger = logging.getLogger(__name__)

class UsedBikeListingService:
    @staticmethod
    def approve_listing(listing_id, reviewer, category=None):
        """
        Approves a used bike listing and notifies the seller.
        """
        with transaction.atomic():
            listing = UsedBikeListing.objects.select_for_update().get(id=listing_id)
            
            if category:
                listing.category = category
                
            listing.status = 'active'
            listing.is_verified = True
            listing.reviewed_by = reviewer
            listing.reviewed_at = timezone.now()
            listing.save()
            
            # Post-save logic (notifications)
            transaction.on_commit(lambda: UsedBikeListingService._notify_approval(listing))
            
            return listing

    @staticmethod
    def reject_listing(listing_id, reviewer, reason):
        """
        Rejects a used bike listing and notifies the seller.
        """
        with transaction.atomic():
            listing = UsedBikeListing.objects.select_for_update().get(id=listing_id)
            
            listing.status = 'rejected'
            listing.rejection_reason = reason
            listing.reviewed_by = reviewer
            listing.reviewed_at = timezone.now()
            listing.save()
            
            # Post-save logic (notifications)
            transaction.on_commit(lambda: UsedBikeListingService._notify_rejection(listing, reason))
            
            return listing

    @staticmethod
    def _notify_approval(listing):
        """Internal helper for notifications"""
        seller = listing.seller
        if seller.email:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
            listing_url = f"{frontend_url}/used-bike/{listing.slug or str(listing.id)}"
            
            email_service.send_approval_email(
                to_email=seller.email,
                listing_title=listing.title,
                listing_url=listing_url,
                to_name=seller.first_name or seller.username
            )
        
        Notification.objects.create(
            user=seller,
            title="Listing Approved!",
            message=f'Your listing "{listing.title}" has been approved and is now live!'
        )

    @staticmethod
    def _notify_rejection(listing, reason):
        """Internal helper for notifications"""
        seller = listing.seller
        if seller.email:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
            dashboard_url = f"{frontend_url}/dashboard/my-listings"
            
            email_service.send_rejection_email(
                to_email=seller.email,
                listing_title=listing.title,
                reason=reason,
                listing_url=dashboard_url,
                to_name=seller.first_name or seller.username
            )
        
        Notification.objects.create(
            user=seller,
            title="Listing Not Approved",
            message=f'Your listing "{listing.title}" was not approved. Reason: {reason}'
        )
