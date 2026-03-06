import os
import django
import sys

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection, connections
from apps.bikes.models import BikeModel, Brand

def debug_db():
    print(f"PYTHONPATH: {sys.path[0]}")
    print(f"DATABASE_URL env: {os.environ.get('DATABASE_URL')}")
    
    for alias in connections:
        db = connections[alias]
        print(f"\n--- Database: {alias} ---")
        print(f"Engine: {db.settings_dict['ENGINE']}")
        print(f"Name: {db.settings_dict['NAME']}")
        try:
            print(f"Bike count: {BikeModel.objects.using(alias).count()}")
            print(f"Brand count: {Brand.objects.using(alias).count()}")
        except Exception as e:
            print(f"Error checking count for {alias}: {e}")

    # Try to find where the slugs are
    print("\n--- Listing current bike slugs in 'default' ---")
    for bike in BikeModel.objects.all():
        print(f"- {bike.slug}")

if __name__ == '__main__':
    debug_db()
