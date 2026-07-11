import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django
django.setup()

from django.test import Client
from apps.users.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def run():
    client = Client()
    
    # Create or get user
    user, _ = User.objects.get_or_create(username="testuser", email="test@example.com")
    if not user.check_password("password"):
        user.set_password("password")
        user.save()
        
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print("Testing /api/v1/bikes/ without auth...")
    res = client.get("/api/v1/bikes/")
    print("Status:", res.status_code)
    
    print("\nTesting /api/v1/bikes/ with auth...")
    res_auth = client.get("/api/v1/bikes/", HTTP_AUTHORIZATION=f"Bearer {access_token}")
    print("Status:", res_auth.status_code)
    if res_auth.status_code != 200:
        print("Response:", res_auth.content)
        
    # Also test /api/v1/users/profile/ or something just to make sure token is valid
    res_prof = client.get("/api/v1/users/profile/", HTTP_AUTHORIZATION=f"Bearer {access_token}")
    print("\nProfile status:", res_prof.status_code)

if __name__ == "__main__":
    run()
