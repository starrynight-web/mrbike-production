import os
import json
import django
import sys
from decimal import Decimal

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.bikes.models import Brand, BikeModel, BikeVariant, BikeSpecification

def clean_decimal(value):
    if value is None:
        return Decimal('0.00')
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    # Remove currency, commas, and non-numeric chars except decimal point
    clean_val = str(value).replace(',', '').replace('BDT', '').strip()
    try:
        return Decimal(clean_val)
    except:
        return Decimal('0.00')

def clean_int(value, default=0):
    if value is None:
        return default
    try:
        # Extract first number from string like "249.0 cc" or "164 kg"
        val_str = str(value).split()[0]
        return int(float(val_str))
    except:
        return default

def clean_float(value, default=0.0):
    if value is None:
        return default
    try:
        val_str = str(value).split()[0]
        return float(val_str)
    except:
        return default

def sync_bikes():
    db_path = os.path.join(os.path.dirname(BASE_DIR), 'db.json')
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {db_path} not found.")
        return

    print(f"Starting sync of {len(data)} items...")

    for item in data:
        core = item.get('core_identity', {})
        if not core:
            continue
            
        brand_name = core.get('brand')
        bike_name = core.get('bike_name')
        slug = core.get('slug')

        if not brand_name or not bike_name or not slug:
            continue

        # Get or create brand
        brand, _ = Brand.objects.get_or_create(
            name=brand_name,
            defaults={'slug': brand_name.lower().replace(' ', '-')}
        )

        # Basic fields from core and quick_specs
        qs = item.get('quick_specs', {})
        engine_cap = clean_int(qs.get('engine_capacity'), 150)
        
        # Primary price usually comes from the default variant
        variants_data = item.get('variants', [])
        default_variant = next((v for v in variants_data if v.get('is_default')), variants_data[0] if variants_data else {})
        price = clean_decimal(default_variant.get('price'))

        category = core.get('category', 'commuter').lower()
        category_map = {
            'naked': 'naked', 'sports': 'sports', 'cruiser': 'cruiser', 
            'commuter': 'commuter', 'scooter': 'scooter', 'adventure': 'adventure',
            'cafe racer': 'cafe_racer', 'off-road': 'offroad'
        }
        category = category_map.get(category, 'commuter')

        # Primary Image from gallery
        gallery = item.get('visual_assets', {}).get('gallery', [])
        primary_img_url = next((img.get('url') for img in gallery if img.get('is_primary')), None)
        if not primary_img_url and gallery:
            primary_img_url = gallery[0].get('url')

        # Update or create bike model
        bike, created = BikeModel.objects.update_or_create(
            slug=slug,
            defaults={
                'name': bike_name,
                'brand': brand,
                'category': category,
                'engine_capacity': engine_cap,
                'engine_type': qs.get('engine_type'),
                'max_power': qs.get('max_power'),
                'max_torque': qs.get('max_torque'),
                'transmission': qs.get('transmission'),
                'curb_weight': clean_float(qs.get('kerb_weight')),
                'fuel_capacity': clean_float(qs.get('fuel_tank')),
                'price': price,
                'is_available': True,
                'popularity_score': item.get('metadata', {}).get('popularity_score') or 0
            }
        )

        # Sync Variants
        for v_data in variants_data:
            BikeVariant.objects.update_or_create(
                bike_model=bike,
                variant_key=v_data.get('variant_key', 'std'),
                defaults={
                    'variant_name': v_data.get('variant_name', 'Standard'),
                    'price': clean_decimal(v_data.get('price')),
                    'is_default': v_data.get('is_default', False),
                    'color_options': v_data.get('color_options', []),
                    'features': v_data.get('features', []),
                    'braking_system': v_data.get('braking_system'),
                    'tire_type': v_data.get('tire_type'),
                    'mileage_company': v_data.get('mileage_company'),
                    'mileage_user': v_data.get('mileage_user'),
                    'topspeed_company': v_data.get('topspeed_company'),
                    'topspeed_user': v_data.get('topspeed_user'),
                }
            )

        # Sync Detailed Specs
        ds = item.get('detailed_specs', {})
        if ds:
            engine_perf = ds.get('engine_performance', {})
            engine = engine_perf.get('engine', {})
            perf = engine_perf.get('performance', {})
            trans_brake = ds.get('transmission_braking', {})
            trans = trans_brake.get('transmission', {})
            brakes = trans_brake.get('brakes', {})
            dim_chassis = ds.get('dimensions_chassis', {})
            dims = dim_chassis.get('dimensions', {})
            chassis = dim_chassis.get('chassis', {})
            weight = dim_chassis.get('weight', {})
            wheels_tyres = ds.get('wheels_tyres', {})
            tyres = wheels_tyres.get('tyres', {})
            wheels = wheels_tyres.get('wheels', {})
            electrical = ds.get('electrical_features', {})

            BikeSpecification.objects.update_or_create(
                bike_model=bike,
                defaults={
                    'engine_type': engine.get('engine_type'),
                    'displacement': engine.get('displacement'),
                    'max_power': engine.get('max_power'),
                    'max_torque': engine.get('max_torque'),
                    'bore_stroke': engine.get('bore_stroke'),
                    'compression_ratio': engine.get('compression_ratio'),
                    'fuel_system': engine.get('fuel_system'),
                    'starting': engine.get('starting'),
                    'cooling_system': engine.get('cooling_system'),
                    'valve_train': engine.get('valve_train'),
                    'emission_standard': engine.get('emission_standard'),
                    
                    'acceleration_0_60': perf.get('acceleration_0_60'),
                    'acceleration_0_100': perf.get('acceleration_0_100'),
                    'fuel_type': perf.get('fuel_type'),
                    'fuel_tank_capacity': perf.get('fuel_tank_capacity'),
                    'reserve_fuel': perf.get('reserve_fuel'),
                    'range_per_tank': perf.get('range_per_tank'),
                    
                    'clutch': trans.get('clutch'),
                    'gearbox': trans.get('gearbox'),
                    'gear_pattern': trans.get('gear_pattern'),
                    'final_drive': trans.get('final_drive'),
                    
                    'brakes_front': brakes.get('front'),
                    'brakes_rear': brakes.get('rear'),
                    'braking_system': brakes.get('abs_type') or brakes.get('system'),
                    
                    'length': dims.get('length'),
                    'width': dims.get('width'),
                    'height': dims.get('height'),
                    'wheelbase': dims.get('wheelbase'),
                    'ground_clearance': dims.get('ground_clearance'),
                    'seat_height': dims.get('seat_height'),
                    
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
                    
                    'lighting': electrical.get('lighting', {}),
                    'instrument_cluster': electrical.get('instrument_cluster', {}),
                    'battery': electrical.get('battery', {}),
                    'additional_features': electrical.get('additional_features', []),
                }
            )

        status = "Created" if created else "Updated"
        print(f"{status}: {bike.name} ({bike.slug})")

    print("Sync complete.")

if __name__ == '__main__':
    sync_bikes()
