import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.news.models import Article
from apps.bikes.serializers import BikeModelSerializer
from apps.marketplace.serializers import UsedBikeListingSerializer
from apps.news.serializers import ArticleSerializer

def test_image_urls():
    print("--- Testing New Bike Image URL ---")
    bike = BikeModel.objects.first()
    if bike:
        print(f"Bike: {bike.name}")
        print(f"Raw image field: {bike.image1}")
        if hasattr(bike.image1, 'url'):
            print(f"Raw image1.url: {bike.image1.url}")
        serializer = BikeModelSerializer(bike)
        print(f"Serialized image_url: {serializer.data.get('image_url')}")
    else:
        print("No new bikes found.")

    print("\n--- Testing Used Bike Image URL ---")
    used_bike = UsedBikeListing.objects.first()
    if used_bike:
        print(f"Used Bike: {used_bike.title}")
        serializer = UsedBikeListingSerializer(used_bike)
        images = serializer.data.get('images', [])
        print(f"Serialized images count: {len(images)}")
        if images:
            print(f"First image URL: {images[0].get('url')}")
            
            # Print raw for debugging
            first_img_obj = used_bike.images.first()
            if first_img_obj:
                print(f"Raw original_image: {first_img_obj.original_image}")
                print(f"Raw webp_image: {first_img_obj.webp_image}")
        print(f"Serialized image_url (thumbnail): {serializer.data.get('image_url')}")
    else:
        print("No used bikes found.")

    print("\n--- Testing News Article Image URL ---")
    article = Article.objects.first()
    if article:
        print(f"Article: {article.title}")
        print(f"Raw image field: {article.image}")
        if hasattr(article.image, 'url'):
            print(f"Raw image.url: {article.image.url}")
        serializer = ArticleSerializer(article)
        print(f"Serialized image_url: {serializer.data.get('image_url')}")
    else:
        print("No articles found.")

if __name__ == "__main__":
    test_image_urls()
