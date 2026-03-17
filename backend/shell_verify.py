
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.users.models import User
from apps.news.models import Article
from apps.bikes.serializers import BikeModelSerializer
from django.conf import settings
from apps.core.sitemap import sitemap_view
from django.test import RequestFactory

print("\n" + "="*40)
print("--- MRBIKEBD PRODUCTION VERIFICATION ---")
print("="*40)

# 1. Cloudinary
bike = BikeModel.objects.first()
if bike:
    serializer = BikeModelSerializer(bike)
    url = serializer.data.get('primary_image')
    print(f"Primary Image URL: {url}")
    if url and 'https://res.cloudinary.com' in url:
        print("[OK] Cloudinary HTTPS resolution verified.")

# 2. Sorting
print(f"Default Ordering: {BikeModel._meta.ordering}")

# 3. Admin Account
admin = User.objects.filter(email='mrbikecloude@gmail.com').first()
if admin:
    print(f"Superadmin: {admin.email} | Staff: {admin.is_staff} | Super: {admin.is_superuser}")
    otp = hasattr(admin, 'totp_secret') and bool(admin.totp_secret)
    print(f"2FA Configured (TOTP): {otp}")
else:
    print("[FAIL] Superadmin 'mrbikecloude@gmail.com' not found.")

# 4. Sitemap
factory = RequestFactory()
request = factory.get('/sitemap.xml')
response = sitemap_view(request)
if response.status_code == 200:
    print(f"[OK] Sitemap generator active (Length: {len(response.content)})")

print("="*40 + "\n")
