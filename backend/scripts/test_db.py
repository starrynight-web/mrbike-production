import os
import sys
import django
import traceback

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from apps.interactions.models import Review

print("--- Diagnostic Start ---")

try:
    print(f"Vendor: {connection.vendor}")
    User = get_user_model()
    target_email = 'mrbikecloude@gmail.com'
    
    users_to_del = User.objects.exclude(email=target_email)
    print(f"Users to delete: {users_to_del.count()}")
    
    if users_to_del.exists():
        first_user = users_to_del.first()
        print(f"Attempting to delete first user's reviews: {first_user.email}")
        revs = Review.objects.filter(user=first_user)
        print(f"Review count for user: {revs.count()}")
        if revs.exists():
            print("Deleting reviews...")
            revs.delete()
            print("Deleted reviews.")
    
    print("--- Diagnostic End ---")
except Exception:
    traceback.print_exc()
    print("--- Diagnostic Failed ---")
