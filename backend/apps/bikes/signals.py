from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.db import transaction
from .models import Brand, BikeModel
from apps.core.services import revalidate_tags

@receiver([post_save, post_delete], sender=Brand)
def clear_brand_cache(sender, instance, **kwargs):
    """Clear brand-related caches when a brand is modified"""
    cache.delete_pattern("brand_*")
    cache.delete_pattern("bike_list_*")
    
    tags = ["brands-list", f"brand-{instance.slug}"]
    transaction.on_commit(lambda: revalidate_tags(tags))

@receiver([post_save, post_delete], sender=BikeModel)
def clear_bike_cache(sender, instance, **kwargs):
    """Clear bike-related caches when a bike is modified"""
    cache.delete_pattern("bike_*")
    cache.delete_pattern("brand_bikes_*")
    
    tags = ["bikes-list", f"bike-{instance.slug}"]
    transaction.on_commit(lambda: revalidate_tags(tags))
