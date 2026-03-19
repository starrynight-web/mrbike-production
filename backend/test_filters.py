
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel
from apps.bikes.filters import BikeModelFilter
from django.test import RequestFactory

def test_filters():
    rf = RequestFactory()
    
    # Test price filter
    request = rf.get('/api/bikes/', {'priceMin': '1000000'})
    f = BikeModelFilter(request.GET, queryset=BikeModel.objects.all())
    print(f"Bikes with priceMin=1000000: {f.qs.count()}")
    for bike in f.qs:
        print(f" - {bike.brand.name} {bike.name}: {bike.price}")

    # Test search
    from apps.bikes.views import BikeModelViewSet
    view = BikeModelViewSet()
    view.request = request
    search_request = rf.get('/api/bikes/', {'search': 'Yamaha'})
    view.request = search_request
    qs = view.get_queryset()
    print(f"Bikes with search='Yamaha': {qs.count()}")
    for bike in qs:
        print(f" - {bike.brand.name} {bike.name}")

if __name__ == "__main__":
    test_filters()
