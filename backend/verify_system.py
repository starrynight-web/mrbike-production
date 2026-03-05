import os
import django
import sys
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.db import connections
from django.db.utils import OperationalError
from apps.users.services.email_service import email_service
import cloudinary

def check_databases():
    print("--- Database Connectivity ---")
    databases = ['default', 'mongodb']
    for db in databases:
        conn = connections[db]
        try:
            conn.ensure_connection()
            print(f"[OK] Database '{db}' connected successfully.")
        except OperationalError as e:
            print(f"[FAIL] Database '{db}' connection failed: {e}")
        except Exception as e:
            print(f"[FAIL] Database '{db}' encountered an error: {e}")

def check_email_service():
    print("\n--- Email Service (Brevo) ---")
    if email_service.api_key:
        print(f"[OK] Brevo API Key is set.")
    else:
        print(f"[FAIL] Brevo API Key is missing.")

def check_cloudinary():
    print("\n--- Cloudinary ---")
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    if cloud_name:
        print(f"[OK] Cloudinary Cloud Name: {cloud_name}")
    else:
        print(f"[FAIL] Cloudinary configuration is incomplete.")

def check_installed_apps():
    print("\n--- Installed Apps Audit ---")
    required_apps = ['apps.core', 'apps.users', 'apps.bikes', 'apps.marketplace', 'apps.news']
    for app in required_apps:
        if app in settings.INSTALLED_APPS:
            print(f"[OK] App '{app}' is correctly registered.")
        else:
            print(f"[FAIL] App '{app}' is NOT in INSTALLED_APPS.")

if __name__ == "__main__":
    print("MrBikeBD System Verification Utility\n" + "="*40)
    check_installed_apps()
    check_databases()
    check_email_service()
    check_cloudinary()
    print("="*40 + "\nVerification Complete.")
