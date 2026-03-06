import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import UserProfile

def audit_profiles():
    for db in ['default', 'mongodb']:
        print(f"\n--- Checking {db} ---")
        try:
            profiles = list(UserProfile.objects.using(db).values('id', 'user_id'))
            print(f"Profiles: {profiles}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    audit_profiles()
