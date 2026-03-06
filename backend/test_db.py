import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.marketplace.models import UsedBikeListing
from apps.interactions.models import Review, Wishlist
from apps.bikes.models import BikeModel

def test_connections():
    print("--- Testing Database Connectivity ---")
    
    try:
        bike_count = BikeModel.objects.count()
        print(f"[OK] Postgres (Bikes): {bike_count} bikes found.")
    except Exception as e:
        print(f"[FAIL] Postgres error: {e}")

    try:
        listing_count = UsedBikeListing.objects.count()
        print(f"[OK] MongoDB (Marketplace): {listing_count} listings found.")
    except Exception as e:
        print(f"[FAIL] MongoDB Marketplace error: {e}")

    try:
        review_count = Review.objects.count()
        print(f"[OK] MongoDB (Interactions): {review_count} reviews found.")
    except Exception as e:
        print(f"[FAIL] MongoDB Interactions error: {e}")

    print("--- Testing List Request ---")
    try:
        listings = UsedBikeListing.objects.all()[:5]
        for l in listings:
            print(f"Listing: {l.title}, Price: {l.price}, Model ID: {l.bike_model_id}")
    except Exception as e:
        print(f"[FAIL] List request failed: {e}")

if __name__ == "__main__":
    test_connections()
