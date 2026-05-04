from django.db.models import Count, F, Sum
from .models import BikeModel
from apps.interactions.models import UserViewHistory
from apps.marketplace.models import UsedBikeListing
import logging

logger = logging.getLogger(__name__)

def calculate_bike_popularity():
    """
    Recalculates popularity scores for all bike models.
    Formula: (Official Views * 1) + (Used Listing Views * 0.5) + (Review Count * 5)
    """
    logger.info("Starting bike popularity recalculation...")
    
    bikes = BikeModel.objects.all()
    for bike in bikes:
        # 1. Base views from official details page
        official_views = bike.popularity_score # This is currently acting as a counter
        
        # 2. Views from all associated used listings
        used_views = UsedBikeListing.objects.filter(bike_model=bike).aggregate(total=Sum('views_count'))['total'] or 0
        
        # 3. Engagement (Reviews)
        # Note: interactions.Review is not imported here to avoid circularity if it happens
        from apps.interactions.models import Review
        review_count = Review.objects.filter(bike=bike).count()
        
        # Calculate new score
        # We keep a portion of the old score to account for historical data not in logs
        new_score = (official_views * 0.8) + (used_views * 0.5) + (review_count * 10)
        
        # Update without signals to avoid recursion
        BikeModel.objects.filter(pk=bike.pk).update(popularity_score=new_score)
    
    logger.info("Bike popularity recalculation complete.")

def cleanup_old_behavior_logs(days=30):
    """
    Deletes UserBehaviorLog entries older than X days to prevent DB bloat.
    """
    from apps.recommendations.models import UserBehaviorLog
    from django.utils import timezone
    cutoff = timezone.now() - timezone.timedelta(days=days)
    deleted, _ = UserBehaviorLog.objects.filter(created_at__lt=cutoff).delete()
    logger.info(f"Cleaned up {deleted} old behavior logs.")
