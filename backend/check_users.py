import os
import django
from django.conf import settings

# Point to base settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
from dotenv import load_dotenv
load_dotenv()
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("Listing all users with potential admin patterns:")
try:
    users = User.objects.all()
    for u in users:
        # Check for admin-like patterns in email or role
        email_lower = u.email.lower() if u.email else ""
        if 'super' in email_lower or 'admin' in email_lower or 'demo' in email_lower or u.is_staff or u.is_superuser:
            print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Staff: {u.is_staff} | Superuser: {u.is_superuser}")
except Exception as e:
    print(f"Error: {e}")
