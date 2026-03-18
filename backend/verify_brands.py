import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Fixed path
django.setup()

from apps.bikes.views import BikeModelViewSet
from rest_framework.test import APIRequestFactory
from apps.bikes.serializers import BrandSerializer
from apps.bikes.models import Brand

factory = APIRequestFactory()
view = BikeModelViewSet.as_view({'get': 'list'})

print("--- Testing Brand Filtering (yamaha,suzuki) ---")
request = factory.get('/api/bikes/', {'brand': 'yamaha,suzuki'})
response = view(request)
results = response.data.get('results', [])
print(f"Results Count: {len(results)}")
for b in results:
    print(f"- {b['name']} ({b['brand']['name']})")

print("\n--- Testing Brand Listing with Counts ---")
yamaha = Brand.objects.get(slug='yamaha')
suzuki = Brand.objects.get(slug='suzuki')

y_serializer = BrandSerializer(yamaha)
s_serializer = BrandSerializer(suzuki)

print(f"Yamaha: Official={y_serializer.data['bikeCount']}, Used={y_serializer.data['usedBikeCount']}")
print(f"Suzuki: Official={s_serializer.data['bikeCount']}, Used={s_serializer.data['usedBikeCount']}")
