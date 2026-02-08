import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from django.conf import settings
from apps.bikes.models import Brand, BikeModel, BikeVariant, BikeSpecification
from apps.marketplace.models import UsedBikeListing
from django.contrib.auth import get_user_model
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import bike data from nested db.json structure and sync to MongoDB'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file')
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the script without committing changes to the database',
        )
        parser.add_argument(
            '--skip-mongo',
            action='store_true',
            help='Skip syncing data to MongoDB Atlas',
        )

    def handle(self, *args, **options):
        file_path = options['json_file']
        dry_run = options['dry_run']
        skip_mongo = options['skip_mongo']

        self.stdout.write(f"Loading JSON from: {os.path.abspath(file_path)}")

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File {file_path} not found"))
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            self.stderr.write(self.style.ERROR("Expected a list of bike objects in JSON"))
            self.stdout.write(f"Found type: {type(data)}")
            return

        # MongoDB Setup
        mongo_collection = None
        if not dry_run and not skip_mongo:
            try:
                if not settings.MONGODB_URI:
                    raise Exception("MONGODB_URI not set in settings")
                
                mongo_client = MongoClient(
                    settings.MONGODB_URI, 
                    serverSelectionTimeoutMS=2000,
                    connectTimeoutMS=2000
                )
                mongo_db = mongo_client[settings.MONGODB_DB_NAME]
                mongo_collection = mongo_db['bike_details']
                mongo_client.server_info()
                self.stdout.write(self.style.SUCCESS("Connected to MongoDB Atlas"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"MongoDB connection failed, skipping Mongo sync: {e}"))

        self.stdout.write(f"Found {len(data)} entries. Starting import...")

        try:
            with transaction.atomic():
                for i, entry in enumerate(data):
                    core = entry.get('core_identity', {})
                    slug = core.get('slug')
                    if not slug:
                        self.stdout.write(self.style.WARNING(f"  Entry {i} missing slug, skipping..."))
                        continue

                    self.stdout.write(f"  Processing {slug}...")

                    brand_name = core.get('brand')
                    brand, _ = Brand.objects.get_or_create(
                        name=brand_name,
                        defaults={'slug': slugify(brand_name)}
                    )

                    quick_specs = entry.get('quick_specs', {})
                    raw_cc = quick_specs.get('engine_capacity', '0')
                    engine_cc = None
                    try:
                        # Handle cases like "249 cc" or "249.0"
                        engine_cc = int(float(raw_cc.split()[0]))
                    except (ValueError, TypeError) as e:
                        logger.warning("Failed to parse engine_capacity '%s' for slug=%s: %s", raw_cc, slug, e)
                        self.stderr.write(self.style.WARNING(f"    [WARN] Failed to parse engine_capacity for {slug}: {e}"))

                    visuals = entry.get('visual_assets', {})
                    gallery = visuals.get('gallery', [])
                    primary_image = ""
                    for img in gallery:
                        if img.get('is_primary'):
                            primary_image = img.get('url')
                            break
                    if not primary_image and gallery:
                        primary_image = gallery[0].get('url')

                    # Main BikeModel
                    pricing = entry.get('pricing_financial', {})
                    on_road = pricing.get('on_road_breakdown', {})
                    price = on_road.get('ex_showroom', 0)
                    if not price:
                        price = entry.get('variants', [{}])[0].get('price', 0)

                    defaults = {
                        'brand': brand,
                        'name': core.get('bike_name'),
                        'category': core.get('category', 'commuter'),
                        'engine_capacity': engine_cc,
                        'price': price,
                        'popularity_score': entry.get('metadata', {}).get('popularity_score', 0),
                        'primary_image': primary_image,
                    }

                    if not dry_run:
                        bike, created = BikeModel.objects.update_or_create(
                            slug=slug,
                            defaults=defaults
                        )
                        verb = "Created" if created else "Updated"
                        self.stdout.write(f"    [{verb}] Bike in PG")
                        
                        # Sync to MongoDB (full catalog entry)
                        if mongo_collection is not None:
                            try:
                                mongo_entry = entry.copy()
                                mongo_entry['bike_id'] = bike.id
                                mongo_collection.update_one(
                                    {'core_identity.slug': slug},
                                    {'$set': mongo_entry},
                                    upsert=True
                                )
                                self.stdout.write("    [OK] Synced to Mongo")
                            except Exception as me:
                                self.stdout.write(self.style.WARNING(f"    [WARN] Mongo sync failed for {slug}: {me}"))
                    else:
                        self.stdout.write(f"    [Dry-Run] Would migrate {core.get('bike_name')}")
                        continue

                    # Variants
                    variants_data = entry.get('variants', [])
                    for v in variants_data:
                        v_key = v.get('variant_key', 'std')
                        BikeVariant.objects.update_or_create(
                            bike_model=bike,
                            variant_key=v_key,
                            defaults={
                                'variant_name': v.get('variant_name', 'Standard'),
                                'price': v.get('price', bike.price),
                                'is_default': v.get('is_default', False),
                                'color_options': v.get('color_options', []),
                                'features': v.get('features', []),
                                'braking_system': v.get('braking_system'),
                                'tire_type': v.get('tire_type'),
                                'mileage_company': v.get('mileage_company'),
                                'mileage_user': v.get('mileage_user'),
                                'topspeed_company': v.get('topspeed_company'),
                                'topspeed_user': v.get('topspeed_user'),
                            }
                        )
                    self.stdout.write(f"    [OK] {len(variants_data)} variants added")

                    # Detailed Specs mapping
                    detailed = entry.get('detailed_specs', {})
                    engine_perf = detailed.get('engine_performance', {})
                    engine_details = engine_perf.get('engine', {})
                    perf_details = engine_perf.get('performance', {})
                    trans_braking = detailed.get('transmission_braking', {})
                    dim_chassis = detailed.get('dimensions_chassis', {})
                    dimensions = dim_chassis.get('dimensions', {})
                    chassis = dim_chassis.get('chassis', {})
                    weight = dim_chassis.get('weight', {})
                    wheels_tyres = detailed.get('wheels_tyres', {})
                    tyres = wheels_tyres.get('tyres', {})
                    wheels = wheels_tyres.get('wheels', {})
                    elec = detailed.get('electrical_features', {})

                    BikeSpecification.objects.update_or_create(
                        bike_model=bike,
                        defaults={
                            'engine_type': engine_details.get('engine_type'),
                            'displacement': engine_details.get('displacement'),
                            'max_power': engine_details.get('max_power'),
                            'max_torque': engine_details.get('max_torque'),
                            'bore_stroke': engine_details.get('bore_stroke'),
                            'compression_ratio': engine_details.get('compression_ratio'),
                            'fuel_system': engine_details.get('fuel_system'),
                            'starting': engine_details.get('starting'),
                            'cooling_system': engine_details.get('cooling_system'),
                            'valve_train': engine_details.get('valve_train'),
                            'emission_standard': engine_details.get('emission_standard'),
                            'acceleration_0_60': perf_details.get('acceleration_0_60'),
                            'acceleration_0_100': perf_details.get('acceleration_0_100'),
                            'fuel_type': perf_details.get('fuel_type'),
                            'fuel_tank_capacity': perf_details.get('fuel_tank_capacity'),
                            'reserve_fuel': perf_details.get('reserve_fuel'),
                            'range_per_tank': perf_details.get('range_per_tank'),
                            'clutch': trans_braking.get('transmission', {}).get('clutch'),
                            'gearbox': trans_braking.get('transmission', {}).get('gearbox'),
                            'gear_pattern': trans_braking.get('transmission', {}).get('gear_pattern'),
                            'final_drive': trans_braking.get('transmission', {}).get('final_drive'),
                            'brakes_front': trans_braking.get('brakes', {}).get('front'),
                            'brakes_rear': trans_braking.get('brakes', {}).get('rear'),
                            'braking_system': trans_braking.get('brakes', {}).get('system'),
                            'length': dimensions.get('length'),
                            'width': dimensions.get('width'),
                            'height': dimensions.get('height'),
                            'wheelbase': dimensions.get('wheelbase'),
                            'ground_clearance': dimensions.get('ground_clearance'),
                            'seat_height': dimensions.get('seat_height'),
                            'frame_type': chassis.get('frame_type'),
                            'suspension_front': chassis.get('suspension_front'),
                            'suspension_rear': chassis.get('suspension_rear'),
                            'kerb_weight': weight.get('kerb_weight'),
                            'dry_weight': weight.get('dry_weight'),
                            'payload_capacity': weight.get('payload_capacity'),
                            'tyres_front': tyres.get('front'),
                            'tyres_rear': tyres.get('rear'),
                            'tyres_type': tyres.get('type'),
                            'wheels_front': wheels.get('front'),
                            'wheels_rear': wheels.get('rear'),
                            'lighting': elec.get('lighting', {}),
                            'instrument_cluster': elec.get('instrument_cluster', {}),
                            'battery': elec.get('battery', {}),
                            'additional_features': elec.get('additional_features', []),
                        }
                    )
                    self.stdout.write("    [OK] Detailed specs synced")

                if dry_run:
                    self.stdout.write(self.style.WARNING("\nDry-run complete. No changes were saved."))
                    raise Exception("Rollback")

            self.stdout.write(self.style.SUCCESS("\nImport finished successfully!"))

        except Exception as e:
            if str(e) != "Rollback":
                self.stderr.write(self.style.ERROR(f"Error during import: {str(e)}"))
                import traceback
                self.stderr.write(traceback.format_exc())
