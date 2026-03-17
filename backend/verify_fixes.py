
import os
import django
import sys

# Set up Django environment
sys.path.append('E:/mr/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# IMPORT MODELS AFTER SETUP
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.users.models import User
from apps.bikes.serializers import BikeModelSerializer

def verify_fixes():
    print("--- Verifying Phase 1-3 Fixes ---")
    
    # 1. Verify Cloudinary URL Resolution
    bike = BikeModel.objects.first()
    if bike:
        serializer = BikeModelSerializer(bike)
        image_url = serializer.data.get('primary_image')
        print(f"Cloudinary URL Resolution (Primary Image): {image_url}")
        if image_url and image_url.startswith('https:'):
            print("[OK] Cloudinary URL is HTTPS.")
            if 'q_auto' in image_url and 'f_auto' in image_url:
                print("[OK] Quality and Format auto-transformations applied.")
        else:
            print("[FAIL] Cloudinary URL issues.")

    # 2. Verify Sorting
    # We standardizing to 'name' in views, but default model ordering is [-popularity_score, name]
    # Let's check if ordering exists in Meta
    print(f"BikeModel Meta Ordering: {BikeModel._meta.ordering}")
    if 'name' in BikeModel._meta.ordering or 'name' in BikeModel._meta.ordering[0]:
        print("[OK] Meta ordering includes name.")

    # 3. Verify Admin Account
    admin = User.objects.filter(email='mrbikecloude@gmail.com').first()
    if admin:
        print(f"Admin Account: {admin.email} (Is Staff: {admin.is_staff}, Is Superuser: {admin.is_superuser})")
        print(f"OTP Verified: {hasattr(admin, 'totp_secret') and bool(admin.totp_secret)}")
        print("[OK] Admin account verified.")
    else:
        # Check all staff users
        staff = User.objects.filter(is_staff=True)
        print(f"Current Staff Users: {[u.email for u in staff]}")
        print("[FAIL] Admin account 'mrbikecloude@gmail.com' not found as staff.")

    # 4. Verify Sitemap
    from apps.core.sitemap import sitemap_view
    from django.test import RequestFactory
    factory = RequestFactory()
    request = factory.get('/sitemap.xml')
    response = sitemap_view(request)
    print(f"Sitemap Response Status Code: {response.status_code}")
    if response.status_code == 200 and b'xml' in response['Content-Type'].lower():
        print("[OK] Sitemap generation verified.")
        if b'mrbikebd.com/bike/' in response.content:
            print("[OK] Sitemap contains dynamic bike URLs.")
    else:
        print("[FAIL] Sitemap generation issues.")

if __name__ == "__main__":
    verify_fixes()
