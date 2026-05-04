import requests
import json

def test_api():
    urls = [
        "http://localhost:8000/api/v1/bikes/",
        "http://localhost:8000/api/v1/marketplace/listings/",
        "http://localhost:8000/api/v1/news/"
    ]
    
    headers = {
        "Authorization": "Bearer invalid_token_here"
    }
    
    for url in urls:
        print(f"Testing {url} with invalid token...")
        try:
            response = requests.get(url, headers=headers, timeout=5)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("Lenient Auth Working: Returned 200 for public view despite invalid token.")
            else:
                print(f"Error: {response.text[:200]}")
        except Exception as e:
            print(f"Connection failed: {e}")
        print("-" * 30)

if __name__ == "__main__":
    test_api()
