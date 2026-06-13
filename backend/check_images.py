import urllib.request
import json

req = urllib.request.Request("http://127.0.0.1:8000/api/v1/bikes/")
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        bikes = data.get('results', data) if isinstance(data, dict) else data
        for b in bikes[:3]:
            print(f"Bike: {b.get('name')}")
            print(f"Primary Image: {b.get('primary_image')}")
except Exception as e:
    print(f"Error: {e}")
