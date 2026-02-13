import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_auth_flow():
    print("Testing Auth Flow...")
    
    # 1. Register
    reg_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "01700000000"
    }
    print(f"Registering: {reg_data['email']}")
    res = requests.post(f"{BASE_URL}/users/auth/register/", json=reg_data)
    if res.status_code in [201, 400]: # 400 if already exists
        print(f"Register result: {res.status_code}")
    else:
        print(f"Register FAILED: {res.status_code} {res.text}")
        return

    # 2. Login
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    print(f"Logging in: {login_data['email']}")
    res = requests.post(f"{BASE_URL}/users/auth/login/", json=login_data)
    if res.status_code == 200:
        tokens = res.json()
        print("Login SUCCESS!")
        access_token = tokens['access']
    else:
        print(f"Login FAILED: {res.status_code} {res.text}")
        return

    # 3. Get User Stats (Admin)
    admin_login_data = {
        "email": "admin@example.com",
        "password": "adminpassword123"
    }
    print(f"Admin Logging in: {admin_login_data['email']}")
    res = requests.post(f"{BASE_URL}/users/auth/login/", json=admin_login_data)
    if res.status_code == 200:
        admin_tokens = res.json()
        admin_access = admin_tokens['access']
        
        print("Fetching Admin Stats...")
        headers = {"Authorization": f"Bearer {admin_access}"}
        res = requests.get(f"{BASE_URL}/admin/stats/", headers=headers)
        if res.status_code == 200:
            print(f"Admin Stats: {json.dumps(res.json(), indent=2)}")
        else:
            print(f"Stats FAILED: {res.status_code} {res.text}")
    else:
        print(f"Admin Login FAILED: {res.status_code} {res.text}")

if __name__ == "__main__":
    test_auth_flow()
