from apps.bikes.models import BikeModel

b = BikeModel.objects.filter(name='Suzuki Gixxer 250').first()
if b:
    variant = b.variants.first()
    if variant and variant.image_url:
        print(f"Old primary: {b.primary_image}")
        # CloudinaryField can take the public_id or the full url. Since we just fixed the serializer, passing the full URL here might still be parsed by CloudinaryField. 
        # But we know that if we pass `mrbikebd/uploads/lnhouruvvyn8cl87mw1i`, it will work.
        # Let's extract the public id from the variant's image_url
        url = variant.image_url
        if "image/upload/" in url:
            public_id = url.split("image/upload/")[-1]
            import re
            public_id = re.sub(r'^v\d+/', '', public_id)
            if '.' in public_id:
                public_id = public_id.rsplit('.', 1)[0]
            
            b.primary_image = public_id
            b.image1 = public_id
            b.save()
            print(f"Successfully updated Suzuki Gixxer 250 images to {public_id}")
        else:
            print("Variant image URL format unexpected.")
    else:
        print("No variant image found.")
else:
    print("Bike not found.")
