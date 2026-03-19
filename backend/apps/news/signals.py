from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import Article
from apps.core.services import revalidate_tags

@receiver(post_save, sender=Article)
@receiver(post_delete, sender=Article)
def invalidate_news_cache(sender, instance, **kwargs):
    """
    Triggers Next.js revalidation for news articles.
    """
    tags = ["news-list", f"news-{instance.slug}"]
    transaction.on_commit(lambda: revalidate_tags(tags))
