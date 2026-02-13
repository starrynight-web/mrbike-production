import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_news_api():
    print("Testing News API...")
    
    # Login as admin
    admin_login_data = {
        "email": "admin@example.com",
        "password": "adminpassword123"
    }
    res = requests.post(f"{BASE_URL}/users/auth/login/", json=admin_login_data)
    if res.status_code != 200:
        print("Admin Login FAILED")
        return
    
    admin_access = res.json()['access']
    headers = {"Authorization": f"Bearer {admin_access}"}

    # 1. Create Category
    # First, check if categories endpoint exists (usually part of news admin)
    # Based on models, we need a category to create an article.
    # I'll check if I can create an article directly if the serializer handles category slug.
    
    # Since I don't see a category CRUD in urls.py, I'll assume one exists or create it via shell
    # Actually, ArticleSerializer uses SlugRelatedField for category.
    
    # I'll just check if I can list news for now.
    res = requests.get(f"{BASE_URL}/news/")
    print(f"News List Result: {res.status_code}")
    if res.status_code == 200:
        print(f"News: {res.json()}")

if __name__ == "__main__":
    test_news_api()
