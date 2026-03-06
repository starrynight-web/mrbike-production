import sys
import os
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from django.utils import timezone

def seed_used_bikes():
    # Get or create a seller
    seller, _ = User.objects.get_or_create(
        email='seller@example.com',
        defaults={'username': 'test-seller', 'is_email_verified': True}
    )
    if not seller.password:
        seller.set_password('password123')
        seller.save()

    # Get some bike models
    bikes = list(BikeModel.objects.all()[:5])
    if not bikes:
        print("[ERR] No official bikes found. Run sync_bikes.py first.")
        return

    # Create mixed status listings
    listings_to_create = [
        {
            'title': f'Used {bikes[0].brand.name} {bikes[0].name} - Excellent',
            'bike_model_id': bikes[0].id,
            'price': float(bikes[0].price) * 0.8,
            'mileage': 5000,
            'manufacturing_year': 2022,
            'condition': 'excellent',
            'status': 'pending',
            'location': 'Dhaka',
            'category': bikes[0].category,
            'description': 'Very well maintained bike, like new.'
        },
        {
            'title': f'Used {bikes[1].brand.name} {bikes[1].name} - Daily Commute',
            'bike_model_id': bikes[1].id,
            'price': float(bikes[1].price) * 0.6,
            'mileage': 15000,
            'manufacturing_year': 2020,
            'condition': 'good',
            'status': 'pending',
            'location': 'Chittagong',
            'category': bikes[1].category,
            'description': 'Regularly serviced, minor scratches.'
        },
        {
            'title': f'Used {bikes[2].brand.name} {bikes[2].name} - Urgent Sale',
            'bike_model_id': bikes[2].id,
            'price': float(bikes[2].price) * 0.5,
            'mileage': 25000,
            'manufacturing_year': 2018,
            'condition': 'fair',
            'status': 'active',
            'is_verified': True,
            'location': 'Sylhet',
            'is_urgent': True,
            'category': bikes[2].category,
            'description': 'Engine in good condition, body needs some work.'
        }
    ]

    print(f"DEBUG: UsedBikeListing writing to: {UsedBikeListing.objects.db}")
    for data in listings_to_create:
        # Router will handle database selection
        listing, created = UsedBikeListing.objects.get_or_create(
            title=data['title'],
            seller=seller,
            defaults=data
        )
        if created:
            print(f"[OK] Created listing: {listing.title} ({listing.status})")
        else:
            print(f"[SKIP] Listing already exists: {listing.title}")

if __name__ == '__main__':
    import traceback
    try:
        seed_used_bikes()
    except Exception:
        traceback.print_exc()
