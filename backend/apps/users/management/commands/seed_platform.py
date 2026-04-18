from django.core.management.base import BaseCommand
from apps.core.models import SiteConfig
from apps.marketplace.models import MembershipPlan
import json

class Command(BaseCommand):
    help = 'Seeds initial platform configuration and membership plans'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding site configuration...')
        
        # Default site configs
        configs = [
            {'key': 'hero_title', 'value': 'Find Your Dream Bike in Bangladesh'},
            {'key': 'hero_subtitle', 'value': 'Buy, Sell, and Enjoy the best biking experience'},
            {'key': 'hero_image', 'value': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39'},
            {'key': 'contact_phone', 'value': '+880 1XXX XXXXXX'},
            {'key': 'contact_email', 'value': 'info@mrbikebd.com'},
            {'key': 'maintenance_mode', 'value': 'false'},
            {'key': 'allowed_brands', 'value': json.dumps([
                "Yamaha", "Honda", "Suzuki", "Bajaj", "TVS", "Hero", 
                "Royal Enfield", "KTM", "Kawasaki", "Lifan", "Zontes"
            ])},
            {'key': 'listing_limit_free', 'value': '3'},
        ]

        for cfg in configs:
            SiteConfig.objects.get_or_create(
                key=cfg['key'],
                defaults={'value': cfg['value']}
            )

        self.stdout.write('Seeding membership plans...')
        
        # Default membership plans
        plans = [
            {
                'name': 'normal',
                'price': 350.00,
                'boost_price': 40.00,
                'max_bikes': 15,
                'badge_label': 'Verified Seller'
            },
            {
                'name': 'vip',
                'price': 650.00,
                'boost_price': 20.00,
                'max_bikes': 25,
                'badge_label': 'VIP Dealer'
            }
        ]

        for p in plans:
            MembershipPlan.objects.update_or_create(
                name=p['name'],
                defaults={
                    'price': p['price'],
                    'boost_price': p['boost_price'],
                    'max_bikes': p['max_bikes'],
                    'badge_label': p['badge_label']
                }
            )

        self.stdout.write(self.style.SUCCESS('Platform seeding completed!'))
