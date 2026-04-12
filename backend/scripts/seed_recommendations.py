import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel, MarketCompetitorMapping

def add_example_mappings():
    # Example: CFMoto 300SR -> Yamaha R15 V4, Suzuki GSX-R150
    try:
        cfmoto = BikeModel.objects.get(slug='cfmoto-300sr')
        r15 = BikeModel.objects.get(slug='yamaha-r15-v4')
        gsxr = BikeModel.objects.get(slug='suzuki-gsx-r150')
        
        MarketCompetitorMapping.objects.get_or_create(
            source_bike=cfmoto,
            competitor_bike=r15,
            is_aspirational=True
        )
        MarketCompetitorMapping.objects.get_or_create(
            source_bike=cfmoto,
            competitor_bike=gsxr,
            is_aspirational=True
        )
        print("Successfully added example mappings for CFMoto 300SR")
    except BikeModel.DoesNotExist as e:
        print(f"Could not find one of the bikes: {e}")

if __name__ == "__main__":
    add_example_mappings()
