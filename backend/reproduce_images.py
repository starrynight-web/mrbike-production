
import os
import django
import sys
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django
sys.path.append('e:/mr/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.marketplace.serializers import UsedBikeListingCreateSerializer
import inspect

def reproduce():
    print(f"DEBUG: Serializer file: {inspect.getfile(UsedBikeListingCreateSerializer)}")
    
    # 1. Get or create a test user
    from apps.users.models import User
    from apps.bikes.models import BikeModel
    user, _ = User.objects.get_or_create(username='testuser', email='test@example.com')
    
    # 2. Get a bike model
    bike_model = BikeModel.objects.first()
    
    # 3. Create a dummy image
    image = Image.new('RGB', (100, 100), color='red')
    buf = BytesIO()
    image.save(buf, format='JPEG')
    image_file = SimpleUploadedFile("test.jpg", buf.getvalue(), content_type="image/jpeg")
    
    # 4. Prepare data
    data = {
        'bike_model': bike_model.id if bike_model else None,
        'title': f'Test Bike Image {os.urandom(4).hex()}',
        'price': 100000,
        'mileage': 5000,
        'manufacturing_year': 2024,
        'condition': 'excellent',
        'description': 'Test description',
        'location': 'Dhaka',
        'location_city': 'Dhaka',
        'contact_number': '01700000000',
        'ownership_count': 1,
        'category': 'commuter'
    }
    
    # 5. Initialize serializer
    serializer = UsedBikeListingCreateSerializer(data=data)
    
    print("Validating serializer...")
    if serializer.is_valid():
        print("Serializer is valid.")
        # Simulate perform_create passing images
        print("Calling serializer.save()...")
        listing = serializer.save(seller=user, status='pending', uploaded_images=[image_file])
        print(f"Created listing ID: {listing.id}")
        print(f"Listing images count: {listing.images.count()}")
    else:
        print(f"Serializer errors: {serializer.errors}")

if __name__ == "__main__":
    reproduce()
