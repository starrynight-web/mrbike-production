import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("--- Users in Default Database (PostgreSQL) ---")
for u in User.objects.all():
    print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Staff: {u.is_staff}, Role: {u.role}")
