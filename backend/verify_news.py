import requests
import json

BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin_gr_s_n_r_t_e@unleft.space"
ADMIN_PASS = "admin_gr_s_n_r_t_e@27-07-16-20"

def test_news_crud_as_superadmin():
    print(f"Testing News CRUD as {ADMIN_EMAIL}...")
    
    # 1. Login
    login_data = {"email": ADMIN_EMAIL, "password": ADMIN_PASS}
    res = requests.post(f"{BASE_URL}/users/auth/login/", json=login_data)
    if res.status_code != 200:
        print(f"Login FAILED: {res.status_code} {res.text}")
        return
    
    token = res.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Categories (to get a valid ID)
    # I'll create one if it doesn't exist via shell or assume 'launch' exists
    # Actually, I'll just check if I can list articles first
    res = requests.get(f"{BASE_URL}/news/", headers=headers)
    print(f"List Articles: {res.status_code}")
    
    # 3. Create Article (draft)
    # Need a category name from backend. I'll search for NewsCategory.
    # In useNews hook, it defaults to 'launch'.
    article_data = {
        "title": "Test Article Pro",
        "excerpt": "This is a test excerpt",
        "content": "Full content here",
        "category": "Bangladesh", # Assuming this exists or using a known one
        "is_published": False,
        "meta_title": "SEO Title",
        "meta_description": "SEO Description"
    }
    
    # Try to create
    res = requests.post(f"{BASE_URL}/news/", data=article_data, headers=headers)
    print(f"Create Article (Draft): {res.status_code}")
    if res.status_code != 201:
        print(f"Create FAILED: {res.text}")
        return
    
    article_id = res.json()['id']
    
    # 4. Update Article (Publish)
    update_data = {"is_published": True}
    res = requests.patch(f"{BASE_URL}/news/{article_id}/", data=update_data, headers=headers)
    print(f"Publish Article: {res.status_code}")
    if res.status_code == 200:
        print("Article Published Successfully")
    
    # 5. Delete Article
    res = requests.delete(f"{BASE_URL}/news/{article_id}/", headers=headers)
    print(f"Delete Article: {res.status_code}")
    if res.status_code == 204:
        print("Article Deleted Successfully")

if __name__ == "__main__":
    try:
        test_news_crud_as_superadmin()
    except Exception as e:
        print(f"Error: {e}")
