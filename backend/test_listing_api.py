import requests
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

def test_create_listing():
    # Login first to get token
    login_url = f"{BASE_URL}/users/auth/login/"
    login_data = {
        "email": "mrbikecloude@gmail.com",
        "password": "mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202"
    }
    
    print(f"Testing login at {login_url}...")
    try:
        r = requests.post(login_url, json=login_data)
        print(f"Login status: {r.status_code}")
        res = r.json()
        
        # In this project, sometimes the token is in 'data' field or direct
        token = res.get('access') or res.get('data', {}).get('access')
        
        if not token:
            print("No access token found in response. Might need OTP.")
            print(json.dumps(res, indent=2))
            
            # If requires OTP, we might need to skip 2FA for this test user or mock it.
            # But let's see what the response is first.
            return

        print("Login successful. Received token.")
        headers = {
            "Authorization": f"Bearer {token}"
        }

        url = f"{BASE_URL}/marketplace/listings/"
        
        # Create dummy image
        img_path = "test_bike_api.png"
        with open(img_path, "wb") as f:
            f.write(b"fake image data")

        data = {
            "title": "API Test Bike - Yamaha R15",
            "price": "150000",
            "mileage": "5000",
            "manufacturing_year": "2022",
            "registration_year": "2022",
            "condition": "good",
            "description": "This is a test listing to debug why postings aren't appearing.",
            "location": "Dhaka",
            "location_city": "Dhaka",
            "contact_number": "01712345678",
            "whatsapp_number": "01812345678",
            "custom_brand": "Yamaha",
            "custom_model": "R15 V3",
        }

        with open(img_path, 'rb') as f:
            files = [
                ('uploaded_images', ('test_bike.png', f, 'image/png'))
            ]

            print(f"Posting to {url}...")
            r = requests.post(url, data=data, files=files, headers=headers)
            print(f"Post status: {r.status_code}")
            try:
                print(json.dumps(r.json(), indent=2))
            except:
                print(r.text)
                
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    test_create_listing()
