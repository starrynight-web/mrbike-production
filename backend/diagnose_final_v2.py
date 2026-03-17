import os
import django
import sys

# Add the current directory to sys.path to ensure 'apps' is found
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
try:
    django.setup()
except Exception:
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings.base'
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
print(f"FRONTEND_URL (env): {os.getenv('FRONTEND_URL')}")
