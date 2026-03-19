from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.db import transaction
from .models import UsedBikeListing
from apps.core.services import revalidate_tags

@receiver(post_save, sender=UsedBikeListing)
@receiver(post_delete, sender=UsedBikeListing)
def invalidate_marketplace_cache(sender, instance, **kwargs):
    """
    Invalidates marketplace list cache and triggers Next.js revalidation.
    """
    # 1. Clear backend Redis cache
    cache.clear()
    
    # 2. Trigger Next.js revalidation in a transaction.on_commit block
    tags = ["marketplace-list", f"used-bike-{instance.slug or instance.id}"]
    transaction.on_commit(lambda: revalidate_tags(tags))
