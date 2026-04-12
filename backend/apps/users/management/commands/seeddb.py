from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.users.models import User
from apps.bikes.models import Brand, BikeModel, BikeVariant, BikeSpecification
from apps.marketplace.models import UsedBikeListing, Shop
from apps.news.models import Article, NewsCategory

class Command(BaseCommand):
    help = "Seeds the database with demo data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting data seeding...")

        # 1. Create Users
        self.stdout.write("Creating admin and demo user...")
        admin, _ = User.objects.get_or_create(
            email="admin@mrbikebd.com",
            defaults={
                'username': 'admin_superuser',
                'is_staff': True, 
                'is_superuser': True, 
                'is_active': True, 
                'first_name': 'Super', 
                'last_name': 'Admin'
            }
        )
        if _: 
            admin.set_password('admin123')
            admin.save()

        demo_user, _ = User.objects.get_or_create(
            email="demo@mrbikebd.com",
            defaults={
                'username': 'demo_user',
                'is_active': True, 
                'first_name': 'Demo User', 
                'whatsapp_number': '01711223344'
            }
        )
        if _: 
            demo_user.set_password('demo123')
            demo_user.save()

        # 2. Create Brands
        self.stdout.write("Creating brands...")
        yamaha, _ = Brand.objects.get_or_create(name="Yamaha", defaults={'is_popular': True, 'origin_country': 'Japan', 'slug': 'yamaha'})
        honda, _ = Brand.objects.get_or_create(name="Honda", defaults={'is_popular': True, 'origin_country': 'Japan', 'slug': 'honda'})
        bajaj, _ = Brand.objects.get_or_create(name="Bajaj", defaults={'is_popular': True, 'origin_country': 'India', 'slug': 'bajaj'})

        # 3. Create Bikes
        self.stdout.write("Creating bikes...")
        r15, _ = BikeModel.objects.get_or_create(
            brand=yamaha,
            name="R15 V4",
            defaults={
                'slug': 'yamaha-r15-v4',
                'category': 'sports',
                'engine_capacity': 155,
                'max_power': '18.4 PS',
                'max_torque': '14.2 Nm',
                'gears': 6,
                'curb_weight': 142.0,
                'price': Decimal('540000.00'),
                'popularity_score': 100,
                'average_rating': 4.8
            }
        )

        cb_hornet, _ = BikeModel.objects.get_or_create(
            brand=honda,
            name="CB Hornet 160R",
            defaults={
                'slug': 'honda-cb-hornet-160r',
                'category': 'naked',
                'engine_capacity': 162,
                'max_power': '15.09 PS',
                'max_torque': '14.5 Nm',
                'gears': 5,
                'curb_weight': 140.0,
                'price': Decimal('169800.00'),
                'popularity_score': 85,
                'average_rating': 4.5
            }
        )

        pulsar, _ = BikeModel.objects.get_or_create(
            brand=bajaj,
            name="Pulsar 150",
            defaults={
                'slug': 'bajaj-pulsar-150',
                'category': 'commuter',
                'engine_capacity': 149,
                'max_power': '14 PS',
                'max_torque': '13.25 Nm',
                'gears': 5,
                'curb_weight': 144.0,
                'price': Decimal('183500.00'),
                'popularity_score': 95,
                'average_rating': 4.2
            }
        )

        # 4. Create Bike Variants & Specifications
        self.stdout.write("Creating variants & specs...")
        BikeVariant.objects.get_or_create(bike_model=r15, variant_key='std', defaults={'variant_name': 'Standard', 'price': Decimal('540000.00'), 'is_default': True})
        BikeVariant.objects.get_or_create(bike_model=r15, variant_key='m', defaults={'variant_name': 'M Version', 'price': Decimal('580000.00')})

        BikeSpecification.objects.get_or_create(
            bike_model=r15,
            defaults={
                'engine_type': 'Liquid-cooled, 4-stroke, SOHC, 4-valve',
                'top_speed': '140 kmph',
                'mileage_city': '40 kmpl',
                'brakes_front': 'Single disc, ABS',
            }
        )

        # 5. Create Marketplace Demo Shop
        self.stdout.write("Creating shop...")
        shop1, _ = Shop.objects.get_or_create(
            owner=admin,
            name="Dhaka Super Bikes",
            defaults={
                'slug': 'dhaka-super-bikes',
                'location_full': '123 Bike Road, Mirpur, Dhaka',
                'location_city': 'Dhaka',
                'contact_number': '01888997766',
                'is_verified': True
            }
        )

        # 6. Create Used Bikes
        self.stdout.write("Creating used bike listings...")
        UsedBikeListing.objects.get_or_create(
            seller=demo_user,
            bike_model=r15,
            defaults={
                'title': "Yamaha R15 V4 Excellent Condition",
                'slug': "yamaha-r15-v4-used-dhaka",
                'price': Decimal('480000.00'),
                'manufacturing_year': 2022,
                'mileage': 15000,
                'condition': 'excellent',
                'description': 'Used carefully for commuting inside Dhaka.',
                'location': 'Mirpur, Dhaka',
                'status': 'active',
                'is_featured': True,
                'is_verified': True,
                'shop': shop1
            }
        )

        UsedBikeListing.objects.get_or_create(
            seller=admin,
            bike_model=pulsar,
            defaults={
                'title': "Bajaj Pulsar 150 Twin Disc",
                'slug': "bajaj-pulsar-150-twin-disc-mirpur",
                'price': Decimal('135000.00'),
                'manufacturing_year': 2019,
                'mileage': 40000,
                'condition': 'fair',
                'description': 'Reliable everyday commuter.',
                'location': 'Uttara, Dhaka',
                'status': 'active',
                'is_featured': False,
                'is_verified': True
            }
        )

        # 7. Create News
        self.stdout.write("Creating news...")
        news_cat, _ = NewsCategory.objects.get_or_create(name="Launch", slug="launch")
        Article.objects.get_or_create(
            title="Yamaha R15 V4 Launched in Bangladesh",
            slug="yamaha-r15-v4-launched",
            defaults={
                'excerpt': 'Yamaha officially launched the R15 V4 today.',
                'content': '<p>Yamaha officially launched the much awaited R15 V4 today. It features a new aggressive look and advanced riding modes.</p>',
                'author': admin,
                'category': news_cat,
                'is_published': True
            }
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))

