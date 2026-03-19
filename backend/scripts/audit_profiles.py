import os
import django  # type: ignore
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.users.models import UserProfile  # type: ignore

def audit_profiles():
    print(f"\n--- Checking default ---")
    try:
        profiles = list(UserProfile.objects.all().values('id', 'user_id'))
        print(f"Profiles: {profiles}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    audit_profiles()
