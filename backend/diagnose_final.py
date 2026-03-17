import os
import django
from bson import ObjectId

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from apps.marketplace.models import UsedBikeListing

print("--- STAFF USERS ---")
staff = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
for u in staff:
    print(f"ID: {u.id}, Email: {u.email}, Staff: {u.is_staff}, Super: {u.is_superuser}")

print("\n--- RECENT LISTINGS ---")
listings = UsedBikeListing.objects.all().order_by('-created_at')[:5]
for l in listings:
    print(f"ID: {l.id} (Type: {type(l.id)}), Title: {l.title}, Status: {l.status}")

print("\n--- ENVIRONMENT ---")
print(f"SUPER_ADMIN_EMAIL (env): {os.getenv('SUPER_ADMIN_EMAIL')}")
print(f"BREVO_API_KEY (env): {'Set' if os.getenv('BREVO_API_KEY') else 'Not Set'}")
