from apps.bikes.models import Brand, BikeModel
from django.utils.text import slugify

b = Brand.objects.get(name='Royal Enfield')
bikes = BikeModel.objects.filter(brand=b)
updated = []
for bike in bikes:
    bike.slug = slugify(f"{bike.brand.name}-{bike.name}")
    bike.save()
    updated.append(bike.slug)

print("Updated slugs:", updated)
