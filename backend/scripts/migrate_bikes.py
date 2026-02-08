import os
import sys
import json
import django
from pathlib import Path
from pymongo import MongoClient
from django.utils.text import slugify
import logging

# Setup Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from apps.bikes.models import BikeModel, Brand
from django.utils import timezone

logger = logging.getLogger(__name__)

def migrate_bikes():
    print("[START] Starting Bike Data Migration...")
    
    # Path to bikes.json
    json_path = BASE_DIR.parent / "frontend" / "src" / "app" / "mock" / "bikes.json"
    
    if not json_path.exists():
        print(f"[ERROR] Error: {json_path} not found!")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    bikes_list = data.get('bikes', [])
    print(f"[INFO] Found {len(bikes_list)} bikes in JSON.")

    # MongoDB Setup
    mongo_collection = None
    try:
        mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        mongo_collection = mongo_db['bike_details']
        # Trigger connection check
        mongo_client.server_info()
        print("[OK] Connected to MongoDB.")
    except Exception as e:
        print(f"[WARN] MongoDB Connection Error (Skipping MongoDB): {e}")

    migrated_count = 0
    for bike_data in bikes_list:
        try:
            brand_name = bike_data.get('brand')
            brand, _ = Brand.objects.get_or_create(
                name=brand_name,
                defaults={'slug': slugify(brand_name)}
            )

            # Core fields for PostgreSQL
            bike_slug = bike_data.get('id') # Using the ID from JSON as slug
            name = bike_data.get('name')
            price = bike_data.get('price') or 0
            
            # Extract basic CC from specsSummary if possible
            specs_summary = bike_data.get('specsSummary', '')
            engine_cc = 0
            if specs_summary and 'cc' in specs_summary.lower():
                try:
                    engine_cc = int(''.join(filter(str.isdigit, specs_summary.split('cc')[0])))
                except (ValueError, TypeError) as e:
                    logger.debug(f"Failed to parse engine_cc from specs_summary='{specs_summary}': {e}")

            # Update or create core bike in PostgreSQL
            bike, created = BikeModel.objects.update_or_create(
                slug=bike_slug,
                defaults={
                    'brand': brand,
                    'name': name,
                    'category': bike_data.get('categories', ['commuter'])[0] if isinstance(bike_data.get('categories'), list) else 'commuter',
                    'engine_capacity': engine_cc,
                    'price': price,
                    'is_available': bike_data.get('price') is not None,
                    'popularity_score': int((float(bike_data.get('rating') or 0) * 20)),
                }
            )

            if mongo_collection:
                # Detail fields for MongoDB
                mongo_detail = {
                    'bike_id': bike.id,
                    'slug': bike.slug,
                    'full_name': bike_data.get('name'),
                    'rating': bike_data.get('rating'),
                    'categories': bike_data.get('categories'),
                    'specs_summary': bike_data.get('specsSummary'),
                    'variants': bike_data.get('variants'),
                    'similar': bike_data.get('similar'),
                    'used': bike_data.get('used'),
                    'updated_at': timezone.now().isoformat()
                }

                mongo_collection.update_one(
                    {'slug': bike.slug},
                    {'$set': mongo_detail},
                    upsert=True
                )

            migrated_count += 1
            status = "Created" if created else "Updated"
            print(f"[OK] [{status}] {bike.name}")

        except Exception as e:
            print(f"[WARN] Error migrating {bike_data.get('name')}: {e}")

    print(f"\n[DONE] Migration Finished! Migrated {migrated_count} bikes.")

if __name__ == "__main__":
    migrate_bikes()
