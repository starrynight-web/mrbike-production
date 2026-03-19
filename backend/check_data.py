import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel, BikeSpecification
from apps.marketplace.models import UsedBikeListing

print("\n=== BIKE MODEL CHECK ===")
b = BikeModel.objects.filter(name__icontains='300 SR').first()
if b:
    print(f"Bike: {b.name}")
    print(f"Engine Capacity: {b.engine_capacity}")
    s = getattr(b, 'detailed_specs', None)
    if s:
        print(f"Spec Displacement: {s.displacement}")
        print(f"Spec Kerb Weight: {s.kerb_weight}")
        print(f"Spec Top Speed: {s.top_speed}")
    else:
        print("No detailed specs found.")
else:
    print("CFMOTO 300 SR not found.")

print("\n=== USED BIKE LISTING CHECK ===")
ub = UsedBikeListing.objects.filter(slug__icontains='meteor-350').first()
if ub:
    print(f"Listing: {ub.title}")
    print(f"Slug: {ub.slug}")
    print(f"Status: {ub.status}")
    print(f"Image URL (deprecated field): {ub.image_url if hasattr(ub, 'image_url') else 'N/A'}")
    imgs = ub.images.all()
    print(f"Images count: {len(imgs)}")
    for i, img in enumerate(imgs):
        print(f"Image {i+1}:")
        print(f"  Primary: {img.is_primary}")
        print(f"  Cloudinary ID (Original): {img.original_image}")
        print(f"  Best URL: {img.get_best_url}")
else:
    print("Royal Enfield Meteor 350 listing not found.")
