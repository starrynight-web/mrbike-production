import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.marketplace.models import UsedBikeListing

def update_all_slugs():
    listings = UsedBikeListing.objects.all()
    print(f"Updating slugs for {listings.count()} listings...")
    
    updated_count = 0
    for listing in listings:
        old_slug = listing.slug
        # Force slug update using the new logic
        listing.save(force_slug_update=True)
        print(f"ID: {listing.id} | Old: {old_slug} | New: {listing.slug}")
        updated_count += 1
        
    print(f"Finished! Updated {updated_count} listings.")

if __name__ == "__main__":
    update_all_slugs()
