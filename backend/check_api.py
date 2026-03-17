import requests
import json
try:
    response = requests.get("http://localhost:8000/api/v1/bikes/")
    data = response.json()
    with open("api_response.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    
    if data and isinstance(data, dict):
        results = data.get('results', data.get('data', getattr(data, 'results', [])))
        if results and isinstance(results, list):
            b = results[0]
            print(f"First Bike: {b.get('name')}")
            print(f"Primary Image: {b.get('primary_image')}")
            print(f"Image URL: {b.get('image_url')}")
            print(f"Thumbnail URL: {b.get('thumbnailUrl')}")
            print("Successfully saved api_response.json")
except Exception as e:
    print(f"Error: {e}")
