import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.bikes.models import Brand, BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.news.models import Article
from apps.interactions.models import Review
from apps.users.models import UserProfile

User = get_user_model()

def check_model(name, model):
    try:
        count = model.objects.count()
        print(f"[OK] {name}: {count}")
        if count > 0:
            try:
                # Try to fetch one to see if data is actually there
                item = model.objects.first()
                print(f"     Sample: {item}")
            except Exception as e:
                print(f"     [ERROR] Fetching sample: {e}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")

print("--- Database Model Audit ---")
check_model("Users (Postgres)", User)
check_model("UserProfiles (Postgres/Mongo?)", UserProfile)
check_model("Brands (Postgres)", Brand)
check_model("BikeModels (Postgres)", BikeModel)
check_model("Articles (Postgres)", Article)
check_model("UsedBikeListings (Mongo)", UsedBikeListing)
check_model("Reviews (Mongo)", Review)

print("\n--- Connection Check ---")
from django.db import connections
for alias in connections:
    try:
        connections[alias].cursor()
        print(f"[OK] Connection '{alias}' is alive")
    except Exception as e:
        print(f"[ERROR] Connection '{alias}' failed: {e}")
