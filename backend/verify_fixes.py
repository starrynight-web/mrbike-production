import os
import django
import sys

# Setup Django
sys.path.append('e:/mr/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.marketplace.models import UsedBikeListing
from apps.news.models import Article, NewsCategory
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.marketplace.views import UsedBikeListingViewSet
from apps.news.views import ArticleListCreateView

User = get_user_model()

def verify_flows():
    # 1. Setup users
    # Use existing admin if possible, or create test one
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser(
            email='admin_verify@mrbikebd.com',
            username='admin_verify',
            password='password123'
        )
    
    regular_user, _ = User.objects.get_or_create(
        email='user_verify@mrbikebd.com',
        defaults={'username': 'user_verify'}
    )

    factory = APIRequestFactory()

    print("\n--- Verifying Marketplace Visibility ---")
    # Clean up old test listings
    UsedBikeListing.objects.filter(title="Test Bike Pending").delete()
    
    # Create a pending listing with ALL mandatory fields
    listing = UsedBikeListing.objects.create(
        seller=regular_user,
        title="Test Bike Pending",
        price=50000,
        mileage=5000,
        manufacturing_year=2020,
        condition='good',
        description="This is a test description for a pending bike listing.",
        location='Dhaka',
        status='pending'
    )
    
    # Verify regular user list view (should be empty if only one bike and it's pending)
    view = UsedBikeListingViewSet.as_view({'get': 'list'})
    request = factory.get('/api/used-bikes/')
    response = view(request)
    results = response.data.get('results', [])
    print(f"Public user view count (excluding test listing): {len([r for r in results if r['id'] == listing.id])}")
    
    # Verify Admin list view in public area (should NOT see pending)
    request = factory.get('/api/used-bikes/')
    force_authenticate(request, user=admin_user)
    response = view(request)
    results = response.data.get('results', [])
    found_in_public = any(item['id'] == listing.id for item in results)
    print(f"Admin public view sees pending: {'FAILURE' if found_in_public else 'SUCCESS (Hidden)'}")

    # Verify Admin Panel view (using ?status=pending)
    request = factory.get('/api/used-bikes/', {'status': 'pending'})
    force_authenticate(request, user=admin_user)
    response = view(request)
    results = response.data.get('results', [])
    found_in_mod = any(item['id'] == listing.id for item in results)
    print(f"Admin moderation view finds pending: {'SUCCESS' if found_in_mod else 'FAILURE'}")

    print("\n--- Verifying Article Permission ---")
    cat, _ = NewsCategory.objects.get_or_create(name="News")
    # Clean up old test articles
    Article.objects.filter(title='Test Article Verification').delete()
    
    view_news = ArticleListCreateView.as_view()
    # Article creation requires MultiPart data usually, but DRF test factory handles it
    request_news = factory.post('/api/news/', {
        'title': 'Test Article Verification',
        'content': 'This is the content for the test article verification flow.',
        'excerpt': 'Excerpt for the test article.',
        'category': cat.slug,
        'is_published': False
    })
    force_authenticate(request_news, user=admin_user)
    response_news = view_news(request_news)
    print(f"Article creation status (expect 201): {response_news.status_code}")
    if response_news.status_code == 201:
        print("SUCCESS: Superuser can create article")
    else:
        print(f"FAILURE: {response_news.data}")

if __name__ == "__main__":
    verify_flows()
