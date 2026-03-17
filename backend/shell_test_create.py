from django.contrib.auth import get_user_model
from apps.marketplace.models import UsedBikeListing
from apps.marketplace.serializers import UsedBikeListingCreateSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
import json

User = get_user_model()

def test_shell_create():
    try:
        user = User.objects.get(email='mrbikecloude@gmail.com')
        print(f"Testing as user: {user.email}")
        
        # Prepare data
        data = {
            "title": "Shell Test Bike R15",
            "price": 120000,
            "mileage": 3000,
            "manufacturing_year": 2021,
            "registration_year": 2021,
            "condition": "good",
            "description": "Shell test description for debugging.",
            "location": "Dhaka",
            "location_city": "Dhaka",
            "contact_number": "01712345678",
            "whatsapp_number": "01812345678",
            "custom_brand": "Yamaha",
            "custom_model": "R15",
        }
        
        # Mock image
        avatar_content = b'test content'
        avatar_file = SimpleUploadedFile('test.png', avatar_content, content_type='image/png')
        
        # Serializer with data and files
        serializer = UsedBikeListingCreateSerializer(data=data)
        
        if serializer.is_valid():
            print("Serializer IS valid.")
            # Mock the file list that would come from request.FILES.getlist('uploaded_images')
            listing = serializer.save(seller=user, status='pending')
            print(f"Success! Created listing ID: {listing.id}, Status: {listing.status}")
        else:
            print("Serializer INVALID:")
            print(json.dumps(serializer.errors, indent=2))
            
    except Exception as e:
        print(f"Error during shell test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_shell_create()
