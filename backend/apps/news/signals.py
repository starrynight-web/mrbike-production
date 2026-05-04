from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Article
from apps.core.webhooks import trigger_revalidation

@receiver([post_save, post_delete], sender=Article)
def revalidate_news(sender, instance, **kwargs):
    """
    Purge cache for specific News detail and the news list.
    """
    if instance.is_published:
        trigger_revalidation(f"/news/{instance.slug}")
        trigger_revalidation("/news")
        
        # Also revalidate homepage for news feed
        trigger_revalidation("/")
