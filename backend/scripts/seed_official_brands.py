"""
Seed script to populate the Brand model with official official brands.
Usage: python manage.py shell < scripts/seed_official_brands.py
  OR: python scripts/seed_official_brands.py (if run from backend dir with Django configured)
"""

import os
import sys
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

django.setup()

from apps.bikes.models import Brand

BRANDS = [
    {"name": "Yamaha", "origin_country": "Japan", "is_popular": True},
    {"name": "Suzuki", "origin_country": "Japan", "is_popular": True},
    {"name": "Honda", "origin_country": "Japan", "is_popular": True},
    {"name": "Bajaj", "origin_country": "India", "is_popular": True},
    {"name": "TVS", "origin_country": "India", "is_popular": True},
    {"name": "Hero", "origin_country": "India", "is_popular": True},
    {"name": "CFMoto", "origin_country": "China", "is_popular": True},
    {"name": "Royal Enfield", "origin_country": "India", "is_popular": True},
    {"name": "GPX Demon", "origin_country": "Thailand", "is_popular": False},
    {"name": "KTM", "origin_country": "Austria", "is_popular": True},
    {"name": "Akij Motors", "origin_country": "Bangladesh", "is_popular": False},
    {"name": "Lifan", "origin_country": "China", "is_popular": False},
    {"name": "Hyosung", "origin_country": "South Korea", "is_popular": False},
    {"name": "QJ Motor", "origin_country": "China", "is_popular": False},
    {"name": "Yadea", "origin_country": "China", "is_popular": False},
    {"name": "Aprilia", "origin_country": "Italy", "is_popular": True},
    {"name": "Runner", "origin_country": "Bangladesh", "is_popular": False},
    {"name": "Taro", "origin_country": "China", "is_popular": False},
    {"name": "Revoo", "origin_country": "Bangladesh", "is_popular": False},
    {"name": "Vespa", "origin_country": "Italy", "is_popular": True},
    {"name": "Jedi Motors", "origin_country": "Bangladesh", "is_popular": False},
    {"name": "Zenson", "origin_country": "Bangladesh", "is_popular": False},
]

created_count = 0
updated_count = 0

for brand_data in BRANDS:
    brand, created = Brand.objects.update_or_create(
        name=brand_data["name"],
        defaults={
            "origin_country": brand_data["origin_country"],
            "is_popular": brand_data["is_popular"],
        }
    )
    if created:
        created_count += 1
        print(f"[CREATED] {brand.name}")
    else:
        updated_count += 1
        print(f"[UPDATED] {brand.name}")

print(f"\n✅ Done! Created: {created_count}, Updated: {updated_count}")
print(f"Total brands in DB: {Brand.objects.count()}")
