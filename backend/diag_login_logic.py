import os
import django
import sys
import json
import secrets

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.serializers import UserSerializer

def test_login_logic():
    User = get_user_model()
    email = 'mrbikecloude@gmail.com'
    password = 'mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202'
    
    u = User.objects.filter(email=email).first()
    if not u:
        print(f"User {email} not found")
        return

    print(f"Testing login for {u.email}...")
    
    # 1. Check password
    is_correct = u.check_password(password)
    print(f"Password correct: {is_correct}")
    
    # 2. Check verification
    print(f"Is Email Verified: {u.is_email_verified}")
    
    # 3. Check Cache
    try:
        cache.set('diag_test', 'ok', 30)
        val = cache.get('diag_test')
        print(f"Cache Test: {val}")
    except Exception as e:
        print(f"Cache Error: {e}")

    # 4. Check 2FA Logic
    if u.is_staff:
        print("User is staff, checking 2FA...")
        if not u.totp_secret:
            print("No totp_secret found, should trigger 2FA setup.")
            session_id = secrets.token_urlsafe(32)
            try:
                cache.set(f"totp_session_{session_id}", u.id, timeout=600)
                print(f"TOTP Session created: {session_id}")
            except Exception as e:
                print(f"Failed to set TOTP session in cache: {e}")
        else:
            print("TOTP secret exists, should trigger 2FA challenge.")

if __name__ == "__main__":
    test_login_logic()
