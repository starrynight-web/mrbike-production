import os
import sys
import django

# Add current directory to path so 'core' can be found
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

TARGET_EMAIL = settings.SUPER_ADMIN_EMAIL
TARGET_PASS = os.getenv('SUPER_ADMIN_PASSWORD', 'change-me-in-production')

print(f"--- Admin Consolidation Starting ---")

# 1. Delete legacy superusers
deleted_super = User.objects.filter(is_superuser=True).exclude(email=TARGET_EMAIL).delete()
print(f"Deleted legacy superusers: {deleted_super[0]}")

# 2. Delete legacy staff
deleted_staff = User.objects.filter(is_staff=True).exclude(email=TARGET_EMAIL).delete()
print(f"Deleted legacy staff: {deleted_staff[0]}")

# 3. Create or Update Target Admin
user, created = User.objects.get_or_create(email=TARGET_EMAIL, defaults={
    'username': 'mrbikecloude',
    'is_superuser': True,
    'is_staff': True,
    'is_email_verified': True,
    'role': 'admin',
})
user.set_password(TARGET_PASS)
user.save()

status = "Created" if created else "Updated"
print(f"Target Admin Account '{TARGET_EMAIL}': {status}")

# 4. Final Audit
print("--- Final Audit ---")
admins = User.objects.filter(is_superuser=True)
print(f"Total Superadmins: {admins.count()}")
for u in admins:
    print(f" - {u.email} (Staff={u.is_staff})")

staff = User.objects.filter(is_staff=True).exclude(is_superuser=True)
print(f"Total Staff (non-super): {staff.count()}")
for u in staff:
    print(f" - {u.email}")

print("--- Done ---")
