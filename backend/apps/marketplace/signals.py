from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import UsedBikeListing
from apps.core.webhooks import trigger_revalidation

@receiver([post_save, post_delete], sender=UsedBikeListing)
def revalidate_marketplace(sender, instance, **kwargs):
    """
    Purge cache for specific Used Bike detail and the marketplace list.
    """
    # Only revalidate if active or if it just became inactive
    trigger_revalidation(f"/used-bike/{instance.slug or instance.id}")
    trigger_revalidation("/used-bikes")
    
    # Also revalidate homepage since it might have featured bikes
    trigger_revalidation("/")
