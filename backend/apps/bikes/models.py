from django.db import models
from django.utils.text import slugify

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    origin_country = models.CharField(max_length=100, blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class BikeModel(models.Model):
    CATEGORY_CHOICES = [
        ('sports', 'Sports'),
        ('naked', 'Naked Sport'),
        ('cruiser', 'Cruiser'),
        ('commuter', 'Commuter'),
        ('scooter', 'Scooter'),
        ('adventure', 'Adventure'),
        ('cafe_racer', 'Cafe Racer'),
        ('offroad', 'Off-Road'),
    ]

    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='bikes')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Engine & Performance
    engine_capacity = models.IntegerField(help_text="Engine capacity in CC")
    engine_type = models.CharField(max_length=200, blank=True, null=True)
    max_power = models.CharField(max_length=100, blank=True, null=True)
    max_torque = models.CharField(max_length=100, blank=True, null=True)
    fuel_system = models.CharField(max_length=100, blank=True, null=True)
    cooling_system = models.CharField(max_length=100, blank=True, null=True)
    
    # Transmission
    gears = models.IntegerField(default=5)
    clutch_type = models.CharField(max_length=100, blank=True, null=True)
    
    # Dimensions & Chassis
    curb_weight = models.FloatField(help_text="Weight in KG", null=True, blank=True)
    fuel_capacity = models.FloatField(help_text="Capacity in Liters", null=True, blank=True)
    seat_height = models.FloatField(help_text="Height in mm", null=True, blank=True)
    tyre_type = models.CharField(max_length=100, default="Tubeless")
    
    # Price
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Current official price in BDT")
    is_available = models.BooleanField(default=True)
    
    # Media & Social
    primary_image = models.URLField(max_length=500, blank=True, null=True)
    popularity_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.brand.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand.name} {self.name}"

    class Meta:
        ordering = ['-popularity_score', 'name']
