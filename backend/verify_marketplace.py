import requests
import json

BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin_gr_s_n_r_t_e@unleft.space"
PASSWORD = "admin_gr_s_n_r_t_e@27-07-16-20" # Correct password for super admin

def test_marketplace_moderation():
    print(f"Testing Marketplace Moderation flow as {ADMIN_EMAIL}...")
    session = requests.Session()
    
    # 1. Login
    login_data = {"email": ADMIN_EMAIL, "password": PASSWORD}
    response = session.post(f"{BASE_URL}/users/auth/login/", json=login_data)
    if response.status_code != 200:
        print(f"Login Failed: {response.status_code}")
        print(response.text)
        return
    
    # Extract JWT
    data = response.json()
    token = data.get('access') or data.get('token')
    if token:
        session.headers.update({"Authorization": f"Bearer {token}"})
        print("JWT Token acquired and added to headers.")
    else:
        print("Warning: JWT token not found in login response.")
    
    # 2. Create a Used Bike Listing (should be pending)
    # Note: We skip image upload for this script's simplicity or use a dummy if needed
    listing_data = {
        "title": "Verification Test Bike",
        "custom_brand": "Yamaha",
        "custom_model": "R15 V3",
        "manufacturing_year": 2022,
        "mileage": 45,
        "price": 350000,
        "condition": "excellent",
        "location": "Dhaka",
        "contact_number": "01711111111",
        "description": "Verification test listing content."
    }
    
    response = session.post(f"{BASE_URL}/marketplace/listings/", json=listing_data)
    if response.status_code != 201:
        print(f"Create Listing Failed: {response.status_code}")
        print(response.text)
        return
    
    res_data = response.json()
    print(f"Create Response: {json.dumps(res_data, indent=2)}")
    status = res_data.get('status')
    listing_id = res_data.get('id')
    print(f"Listing Created. ID: {listing_id}, Initial Status: {status}")
    
    if status != 'pending':
        print(f"FAILED: Initial status should be 'pending', but got '{status}'")
    else:
        print("SUCCESS: Forced pending status verified.")

    # 3. Verify Admin Visibility (Filter status=pending)
    response = session.get(f"{BASE_URL}/marketplace/listings/?status=pending")
    if response.status_code == 200:
        results = response.json().get('results', [])
        found = any(l['id'] == listing_id for l in results)
        if found:
            print("SUCCESS: Listing visible in pending filter.")
        else:
            print("FAILED: Listing not found in pending results.")
    
    # 4. cleanup
    session.delete(f"{BASE_URL}/marketplace/listings/{listing_id}/")
    print("Cleanup: Listing deleted.")

if __name__ == "__main__":
    test_marketplace_moderation()
