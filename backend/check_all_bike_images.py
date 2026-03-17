import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel
from django.forms.models import model_to_dict

def check_all_images():
    bikes = BikeModel.objects.all()
    print(f"Total bikes: {bikes.count()}")
    count_with_images = 0
    for b in bikes:
        # Check primary_image, image1-5
        images = []
        for field in ['primary_image', 'image1', 'image2', 'image3', 'image4', 'image5']:
            val = getattr(b, field, None)
            if val and str(val) != 'None':
                images.append(f"{field}: {str(val)}")
        
        if images:
            count_with_images += 1
            print(f"Bike [{b.id}] {b.name}:")
            for img in images:
                print(f"  - {img}")
    
    print(f"\nTotal bikes with at least one image: {count_with_images}")

if __name__ == "__main__":
    check_all_images()
