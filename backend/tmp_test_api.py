import requests

url = "http://127.0.0.1:8000/api/v1/news/"
files = {
    'featured_image': ('test.png', b'dummy_image_data', 'image/png')
}
data = {
    'title': 'Test Article',
    'excerpt': 'Test Excerpt',
    'content': 'Test Content',
    'category': 'news',
    'is_published': 'false'
}

try:
    # We expect 401 because we're not authenticated, 
    # but we want to see if it's NOT a 415.
    response = requests.post(url, data=data, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
