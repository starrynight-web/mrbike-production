import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.interactions.models import Review
from apps.news.models import Article

def get_count(model):
    try:
        return model.objects.count()
    except Exception as e:
        return f"ERROR: {e}"

def main():
    print(f"Active Default DB Engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"Active MongoDB DB Engine: {settings.DATABASES['mongodb']['ENGINE']}")
    
    print(f"Bikes (Postgres): {get_count(BikeModel)}")
    print(f"Used Bikes (Mongo): {get_count(UsedBikeListing)}")
    print(f"Reviews (Mongo): {get_count(Review)}")
    print(f"News (Postgres): {get_count(Article)}")

if __name__ == "__main__":
    main()
