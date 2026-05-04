import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
sys.path.append(os.getcwd())
django.setup()

from apps.bikes.models import Brand, BikeModel

BRAND_TRUST_SCORES = {
    "yamaha": 95,
    "suzuki": 92,
    "honda": 90,
    "bajaj": 82,
    "tvs": 78,
    "hero": 75,
    "royal-enfield": 72,
    "ktm": 70,
    "cfmoto": 65,
    "aprilia": 58,
    "lifan": 45,
    "runner": 42,
    "vespa": 40,
    "yadea": 55,
}

def run():
    print("Initializing Brand Trust Scores...")
    for slug, score in BRAND_TRUST_SCORES.items():
        try:
            brand = Brand.objects.get(slug=slug)
            brand.trust_score = score
            if slug == 'yadea':
                brand.is_electric_focused = True
            brand.save()
            print(f"Updated {brand.name}: {score}")
        except Brand.DoesNotExist:
            print(f"Brand {slug} not found.")

    print("\nInitializing Bike Segments (Categorization)...")
    for bike in BikeModel.objects.all():
        if not bike.segment:
            bike.segment = bike.category
            # Set default price ranges if missing
            if not bike.price_min:
                bike.price_min = bike.price
            if not bike.price_max:
                bike.price_max = bike.price
            bike.save()
    print("Done.")

if __name__ == '__main__':
    run()
