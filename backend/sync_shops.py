import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.marketplace.models import UsedBikeListing, Shop

def sync_shops():
    listings = UsedBikeListing.objects.filter(shop__isnull=True)
    count = 0
    for listing in listings:
        if hasattr(listing.seller, 'shop'):
            listing.shop = listing.seller.shop
            listing.save()
            count += 1
    print(f"Synced {count} listings with their shops.")

if __name__ == '__main__':
    sync_shops()
