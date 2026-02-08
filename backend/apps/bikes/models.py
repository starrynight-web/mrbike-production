from django.db import models
from django.utils.text import slugify

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    origin_country = models.CharField(max_length=100, blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
    
    # Engine & Performance (Basic)
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

class BikeVariant(models.Model):
    bike_model = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='variants')
    variant_name = models.CharField(max_length=200)
    variant_key = models.CharField(max_length=50) # e.g. 'std', 'abs'
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_default = models.BooleanField(default=False)
    
    # Features as a list or specific fields
    color_options = models.JSONField(default=list)
    features = models.JSONField(default=list)
    
    # Specifics that might differ between variants
    braking_system = models.CharField(max_length=100, blank=True, null=True)
    tire_type = models.CharField(max_length=100, blank=True, null=True)
    mileage_company = models.CharField(max_length=50, blank=True, null=True)
    mileage_user = models.CharField(max_length=50, blank=True, null=True)
    topspeed_company = models.CharField(max_length=50, blank=True, null=True)
    topspeed_user = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bike_model.name} - {self.variant_name}"

class BikeSpecification(models.Model):
    bike_model = models.OneToOneField(BikeModel, on_delete=models.CASCADE, related_name='detailed_specs')
    
    # Engine Detailed
    engine_type = models.CharField(max_length=255, blank=True, null=True)
    displacement = models.CharField(max_length=100, blank=True, null=True)
    max_power = models.CharField(max_length=100, blank=True, null=True)
    max_torque = models.CharField(max_length=100, blank=True, null=True)
    bore_stroke = models.CharField(max_length=100, blank=True, null=True)
    compression_ratio = models.CharField(max_length=100, blank=True, null=True)
    fuel_system = models.CharField(max_length=100, blank=True, null=True)
    starting = models.CharField(max_length=100, blank=True, null=True)
    cooling_system = models.CharField(max_length=100, blank=True, null=True)
    valve_train = models.CharField(max_length=100, blank=True, null=True)
    emission_standard = models.CharField(max_length=100, blank=True, null=True)
    
    # Performance
    acceleration_0_60 = models.CharField(max_length=100, blank=True, null=True)
    acceleration_0_100 = models.CharField(max_length=100, blank=True, null=True)
    fuel_type = models.CharField(max_length=100, blank=True, null=True)
    fuel_tank_capacity = models.CharField(max_length=100, blank=True, null=True)
    reserve_fuel = models.CharField(max_length=100, blank=True, null=True)
    range_per_tank = models.CharField(max_length=100, blank=True, null=True)
    
    # Transmission
    clutch = models.CharField(max_length=255, blank=True, null=True)
    gearbox = models.CharField(max_length=100, blank=True, null=True)
    gear_pattern = models.CharField(max_length=100, blank=True, null=True)
    final_drive = models.CharField(max_length=100, blank=True, null=True)
    
    # Brakes
    brakes_front = models.CharField(max_length=255, blank=True, null=True)
    brakes_rear = models.CharField(max_length=255, blank=True, null=True)
    braking_system = models.CharField(max_length=255, blank=True, null=True)
    
    # Dimensions
    length = models.CharField(max_length=100, blank=True, null=True)
    width = models.CharField(max_length=100, blank=True, null=True)
    height = models.CharField(max_length=100, blank=True, null=True)
    wheelbase = models.CharField(max_length=100, blank=True, null=True)
    ground_clearance = models.CharField(max_length=100, blank=True, null=True)
    seat_height = models.CharField(max_length=100, blank=True, null=True)
    
    # Chassis
    frame_type = models.CharField(max_length=255, blank=True, null=True)
    suspension_front = models.CharField(max_length=255, blank=True, null=True)
    suspension_rear = models.CharField(max_length=255, blank=True, null=True)
    
    # Weight
    kerb_weight = models.CharField(max_length=100, blank=True, null=True)
    dry_weight = models.CharField(max_length=100, blank=True, null=True)
    payload_capacity = models.CharField(max_length=100, blank=True, null=True)
    
    # Wheels/Tyres
    tyres_front = models.CharField(max_length=100, blank=True, null=True)
    tyres_rear = models.CharField(max_length=100, blank=True, null=True)
    tyres_type = models.CharField(max_length=100, blank=True, null=True)
    wheels_front = models.CharField(max_length=100, blank=True, null=True)
    wheels_rear = models.CharField(max_length=100, blank=True, null=True)
    
    # Electrical
    lighting = models.JSONField(default=dict)
    instrument_cluster = models.JSONField(default=dict)
    battery = models.JSONField(default=dict)
    additional_features = models.JSONField(default=list)
    
    def __str__(self):
        return f"Specs for {self.bike_model.name}"
