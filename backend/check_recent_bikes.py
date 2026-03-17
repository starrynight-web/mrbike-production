import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.bikes.models import BikeModel

recent_bikes = BikeModel.objects.all().order_by('-created_at')[:5]

print(f"Total bikes in DB: {BikeModel.objects.count()}")
print("\nRecent Bikes:")
for bike in recent_bikes:
    print(f"ID: {bike.id}, Name: {bike.name}, Brand: {bike.brand.name}, Slug: {bike.slug}, Available: {bike.is_available}, Created: {bike.created_at}")
