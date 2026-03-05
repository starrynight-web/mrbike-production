import os
import sys
import json
import django
from pathlib import Path
from pymongo import MongoClient
from django.utils.text import slugify
from django.utils import timezone
import logging

# Setup Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from apps.bikes.models import BikeModel, Brand
from apps.marketplace.models import UsedBikeListing

logger = logging.getLogger(__name__)

def migrate_db_json():
    print("[START] Starting Complete Bike Data Migration from db.json...")
    
    # Path to db.json
    json_path = BASE_DIR.parent / "db.json"
    
    if not json_path.exists():
        print(f"[ERROR] Error: {json_path} not found!")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        bikes_list = json.load(f)

    print(f"[INFO] Found {len(bikes_list)} bikes in db.json.")

    # MongoDB Setup
    mongo_collection = None
    try:
        mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        mongo_db = mongo_client[settings.MONGODB_DATABASE]
        mongo_collection = mongo_db['bike_details_v2']
        mongo_client.server_info()
        print("[OK] Connected to MongoDB.")
    except Exception as e:
        print(f"[WARN] MongoDB Connection Error (Skipping MongoDB details): {e}")

    migrated_count = 0
    for bike_data in bikes_list:
        try:
            core = bike_data.get('core_identity', {})
            brand_name = core.get('brand')
            if not brand_name:
                continue

            brand, _ = Brand.objects.get_or_create(
                name=brand_name,
                defaults={'slug': slugify(brand_name)}
            )

            slug = core.get('slug')
            name = core.get('bike_name')
            category = core.get('category', 'commuter').lower()
            
            # Specs
            specs = bike_data.get('quick_specs', {})
            engine_cc_str = specs.get('engine_capacity', '0')
            engine_cc = 0
            try:
                engine_cc = int(''.join(filter(str.isdigit, engine_cc_str.split('.')[0])))
            except:
                pass

            price = 0
            variants = bike_data.get('variants', [])
            if variants:
                price = variants[0].get('price', 0)
            
            # Update or create core bike in PostgreSQL
            # We map the complex JSON to the simplified BikeModel
            bike, created = BikeModel.objects.update_or_create(
                slug=slug,
                defaults={
                    'brand': brand,
                    'name': name,
                    'category': category if category in ['sports', 'naked', 'commuter', 'scooter', 'cruiser', 'adventure', 'cafe_racer', 'offroad'] else 'commuter',
                    'engine_capacity': engine_cc,
                    'price': price,
                    'max_power': specs.get('max_power', 'N/A'),
                    'max_torque': specs.get('max_torque', 'N/A'),
                    'is_available': core.get('status') == 'active',
                    'popularity_score': bike_data.get('metadata', {}).get('popularity_score', 50),
                }
            )

            # Handle primary image from visual_assets
            gallery = bike_data.get('visual_assets', {}).get('gallery', [])
            primary_img_url = None
            for img in gallery:
                if img.get('is_primary'):
                    primary_img_url = img.get('url')
                    break
            
            # Note: We can't easily download and re-upload to Cloudinary here without overhead,
            # but we can store the public_id or URL if the model supports it.
            # For now, let's keep the core metadata.

            if mongo_collection:
                # Store the ENTIRE object in MongoDB for full spec details
                mongo_detail = bike_data
                mongo_detail['postgres_id'] = bike.id
                mongo_detail['updated_at'] = timezone.now().isoformat()

                mongo_collection.update_one(
                    {'core_identity.slug': slug},
                    {'$set': mongo_detail},
                    upsert=True
                )

            migrated_count += 1
            status = "Created" if created else "Updated"
            print(f"[OK] [{status}] {name}")

        except Exception as e:
            print(f"[WARN] Error migrating {bike_data.get('core_identity', {}).get('bike_name')}: {e}")

    print(f"\n[DONE] Migration Finished! Migrated {migrated_count} bikes.")

if __name__ == "__main__":
    migrate_db_json()
