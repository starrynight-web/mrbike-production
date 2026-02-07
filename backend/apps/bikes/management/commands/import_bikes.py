import json
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.bikes.models import Brand, BikeModel, BikeVariant, BikeSpecification

class Command(BaseCommand):
    help = 'Import bike data from JSON'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file')

    def handle(self, *args, **options):
        file_path = options['json_file']
        if not os.path.exists(file_path):
            self.stderr.write(f"File {file_path} not found")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        bikes_data = data.get('bikes', [])
        for bike_data in bikes_data:
            brand_name = bike_data.get('brand')
            brand, _ = Brand.objects.get_or_create(name=brand_name)

            bike_id = bike_data.get('id')
            name = bike_data.get('name')
            category = bike_data.get('category', 'sports')
            # Extract basic engine size from specsSummary if possible
            specs_summary = bike_data.get('specsSummary', '')
            engine_cc = 0
            if 'cc' in specs_summary.lower():
                try:
                    engine_cc = int(specs_summary.lower().split('cc')[0].split()[-1])
                except:
                    pass

            # Main BikeModel
            bike, created = BikeModel.objects.update_or_create(
                slug=bike_id,
                defaults={
                    'brand': brand,
                    'name': name,
                    'category': category,
                    'engine_capacity': engine_cc,
                    'price': bike_data.get('price') or 0,
                    'popularity_score': int(float(bike_data.get('rating') or 0) * 20),
                    'primary_image': bike_data.get('image') if bike_data.get('image') != 'default' else 'https://images.unsplash.com/photo-1558981806-ec527fa84c39',
                }
            )

            # Variants
            variants_data = bike_data.get('variants', {})
            if variants_data:
                for v_key, v_val in variants_data.items():
                    BikeVariant.objects.update_or_create(
                        bike_model=bike,
                        variant_key=v_key,
                        defaults={
                            'variant_name': v_val.get('label', v_key),
                            'price': v_val.get('price', bike.price),
                            'is_default': v_key == 'std',
                            'features': v_val.get('features', []),
                            'braking_system': v_val.get('brakingSystem'),
                            'tire_type': f"{v_val.get('frontTire')} / {v_val.get('rearTire')}",
                            'mileage_company': v_val.get('quickSpecs', {}).get('mileageCompany'),
                            'mileage_user': v_val.get('quickSpecs', {}).get('mileageUser'),
                            'topspeed_company': v_val.get('quickSpecs', {}).get('topspeedCompany'),
                            'topspeed_user': v_val.get('quickSpecs', {}).get('topspeedUser'),
                        }
                    )
            
            # Detailed Specs
            if variants_data and 'std' in variants_data:
                std_variant = variants_data['std']
                qs = std_variant.get('quickSpecs', {})
                BikeSpecification.objects.update_or_create(
                    bike_model=bike,
                    defaults={
                        'engine_type': std_variant.get('engineType'),
                        'displacement': qs.get('engineCapacity'),
                        'max_power': qs.get('maxPower'),
                        'max_torque': qs.get('maxTorque'),
                        'fuel_tank_capacity': qs.get('fuelTank'),
                        'kerb_weight': qs.get('kerbWeight'),
                        'gearbox': qs.get('transmission'),
                    }
                )

            self.stdout.write(self.style.SUCCESS(f"Successfully imported {bike.name}"))

            # Used Bikes nested in the bike JSON
            used_bikes = bike_data.get('used', [])
            if used_bikes:
                # Get or create a mock seller if not exists
                from django.contrib.auth import get_user_model
                User = get_user_model()
                mock_seller, _ = User.objects.get_or_create(
                    username='mock_seller',
                    defaults={'email': 'seller@example.com', 'is_staff': False}
                )

                for used_data in used_bikes:
                    # Parse condition from string if possible
                    cond_str = used_data.get('condition', '').lower()
                    condition = 'good'
                    if 'excellent' in cond_str: condition = 'excellent'
                    elif 'fair' in cond_str: condition = 'fair'
                    
                    # Parse mileage and year
                    import re
                    mileage = 0
                    year = 2020
                    mileage_match = re.search(r'([\d,]+)\s*km', cond_str)
                    if mileage_match:
                        mileage = int(mileage_match.group(1).replace(',', ''))
                    
                    year_match = re.search(r'\(20\d{2}\)', used_data.get('name', ''))
                    if year_match:
                        year = int(year_match.group(0).strip('()'))

                    from apps.marketplace.models import UsedBikeListing
                    UsedBikeListing.objects.update_or_create(
                        title=used_data.get('name'),
                        seller=mock_seller,
                        defaults={
                            'bike_model': bike,
                            'price': used_data.get('price', 0),
                            'mileage': mileage,
                            'manufacturing_year': year,
                            'condition': condition,
                            'location': 'Dhaka',
                            'status': 'active',
                            'description': f"Mock listing for {used_data.get('name')}. Condition: {used_data.get('condition')}",
                        }
                    )
