from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import BikeModel, Brand
from apps.core.webhooks import trigger_revalidation
from apps.core.cache_utils import invalidate_model_cache

@receiver([post_save, post_delete], sender=BikeModel)
def revalidate_bike_detail(sender, instance, **kwargs):
    """
    Purge cache for the specific bike detail page and the bikes list.
    """
    # 1. Revalidate specific bike
    trigger_revalidation(f"/bike/{instance.slug}")
    
    # 2. Revalidate main listing page
    trigger_revalidation("/bikes")
    
    # 3. Revalidate his brand page
    if instance.brand:
        trigger_revalidation(f"/brands/{instance.brand.slug}")
        
    # Backend Cache invalidation
    invalidate_model_cache('bikes')

@receiver([post_save, post_delete], sender=Brand)
def revalidate_brands(sender, instance, **kwargs):
    """
    Purge cache for brands listing and the specific brand.
    """
    trigger_revalidation("/brands")
    trigger_revalidation(f"/brands/{instance.slug}")
    
    # Backend Cache invalidation
    invalidate_model_cache('brands')
