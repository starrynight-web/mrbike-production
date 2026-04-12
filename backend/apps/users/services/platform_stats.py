from django.utils import timezone
from apps.marketplace.models import UsedBikeListing
from apps.news.models import Article
from django.db.models import Count
from django.contrib.auth import get_user_model

User = get_user_model()

def get_global_admin_stats():
    total_users = User.objects.count()
    verified_users = User.objects.filter(is_email_verified=True).count()

    active_listings = UsedBikeListing.objects.filter(status='active').count()
    pending_listings = UsedBikeListing.objects.filter(status='pending').count()
    total_listings = UsedBikeListing.objects.count()

    published_news = Article.objects.filter(is_published=True).count()
    draft_news = Article.objects.filter(is_published=False).count()

    location_stats = list(
        UsedBikeListing.objects.values('location').annotate(count=Count('id')).order_by('-count')[:5]
    )

    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
        },
        "marketplace": {
            "total": total_listings,
            "active": active_listings,
            "pending": pending_listings,
            "locations": location_stats,
        },
        "content": {
            "published_articles": published_news,
            "draft_articles": draft_news,
        },
        "last_updated": timezone.now().isoformat()
    }
