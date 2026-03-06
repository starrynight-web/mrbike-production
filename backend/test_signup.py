import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

def test_signup():
    print("--- Testing User Signup ---")
    data = {
        "email": "testuser_new@example.com",
        "username": "testuser_new",
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "01700000000"
    }
    
    # Check if user already exists and delete to ensure clean test
    User.objects.filter(email=data["email"]).delete()
    
    try:
        response = client.post("/api/users/auth/register/", data, format='json')
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.data}")
    except Exception as e:
        print(f"Signup crashed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_signup()
