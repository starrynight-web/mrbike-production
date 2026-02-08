#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

try:
    from apps.users.views import GoogleAuthView, generate_unique_username
    print("[OK] GoogleAuthView imported successfully")
    print("[OK] generate_unique_username imported successfully")
except Exception as e:
    print(f"[ERROR] Import failed: {e}")
    sys.exit(1)

try:
    from apps.users.models import User
    print("[OK] User model imported successfully")
except Exception as e:
    print(f"[ERROR] User model import failed: {e}")
    sys.exit(1)

print("\n[PASS] All imports successful!")
