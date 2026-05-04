from django.db import models
from django.utils.text import slugify
from cloudinary.models import CloudinaryField
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField

class Brand(models.Model):
# ... Brand remains same ...
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = CloudinaryField('image', folder='mrbikebd/brands/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    origin_country = models.CharField(max_length=100, blank=True, null=True)
    trust_score = models.IntegerField(default=50, help_text="0-100 score for recommendation weight")
    is_electric_focused = models.BooleanField(default=False)
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
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_popular']),
        ]

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
    slug = models.SlugField(max_length=250, unique=True, blank=True, db_index=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    segment = models.CharField(max_length=30, blank=True, null=True, db_index=True) # Normalized segment for recommendation
    is_current = models.BooleanField(default=True, db_index=True)
    
    # Engine & Performance (Basic)
    engine_capacity = models.IntegerField(help_text="Engine capacity in CC", db_index=True)
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
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Current official price in BDT", db_index=True)
    price_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    avg_used_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    depreciation_rate = models.FloatField(default=0.20)
    is_available = models.BooleanField(default=True)
    
    # Media & Social
    primary_image = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    image1 = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    image2 = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    image3 = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    image4 = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    image5 = CloudinaryField('image', folder='mrbikebd/official-bikes/', blank=True, null=True)
    
    # SEO & Metadata
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    
    popularity_score = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    search_vector = SearchVectorField(null=True)
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
        indexes = [
            models.Index(fields=['-popularity_score', 'name']),
            models.Index(fields=['brand', 'category', 'is_available']),
            models.Index(fields=['price', 'engine_capacity']),
            GinIndex(fields=['search_vector']),
        ]

class BikeVariant(models.Model):
    bike_model = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='variants')
    variant_name = models.CharField(max_length=200)
    variant_key = models.CharField(max_length=50) # e.g. 'std', 'abs'
    price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    is_default = models.BooleanField(default=False)
    
    # Features as a list or specific fields
    color_options = models.JSONField(default=list)
    features = models.JSONField(default=list)
    
    # Specifics that might differ between variants
    braking_system = models.CharField(max_length=100, blank=True, null=True)
    rear_brake_type = models.CharField(max_length=100, blank=True, null=True)
    tire_type = models.CharField(max_length=100, blank=True, null=True)
    mileage_company = models.CharField(max_length=50, blank=True, null=True)
    mileage_user = models.CharField(max_length=50, blank=True, null=True)
    topspeed_company = models.CharField(max_length=50, blank=True, null=True)
    topspeed_user = models.CharField(max_length=50, blank=True, null=True)
    
    # Feature Additions
    headlight_type = models.CharField(max_length=100, blank=True, null=True)
    kerb_weight = models.CharField(max_length=50, blank=True, null=True)
    mobile_connectivity = models.BooleanField(default=False)
    instrument_console = models.CharField(max_length=100, blank=True, null=True)
    gps_navigation = models.BooleanField(default=False)
    riding_modes = models.BooleanField(default=False)
    slipper_clutch = models.BooleanField(default=False)
    traction_control = models.BooleanField(default=False)
    quick_shifter = models.BooleanField(default=False)
    seat_type = models.CharField(max_length=100, blank=True, null=True)

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
    mileage_city = models.CharField(max_length=100, blank=True, null=True)
    mileage_highway = models.CharField(max_length=100, blank=True, null=True)
    top_speed = models.CharField(max_length=100, blank=True, null=True)
    
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
    
    # Engine Additions
    gear_shift_pattern = models.CharField(max_length=100, blank=True, null=True)
    spark_plugs = models.IntegerField(null=True, blank=True)
    cooling_type = models.CharField(max_length=255, blank=True, null=True)
    
    # Features & Safety
    usb_charging = models.BooleanField(default=False)
    side_stand_cut_off = models.BooleanField(default=False)
    projector_headlight = models.BooleanField(default=False)
    drls = models.BooleanField(default=False)
    gear_indicator = models.BooleanField(default=False)
    distance_to_empty = models.BooleanField(default=False)
    avg_fuel_consumption = models.BooleanField(default=False)
    
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

class MarketCompetitorMapping(models.Model):
    id = models.BigAutoField(primary_key=True)
    source_bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='competitor_source')
    competitor_bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='competitor_target')
    is_aspirational = models.BooleanField(default=True, help_text="True if the competitor is a highly desired premium brand/model.")

    class Meta:
        unique_together = ('source_bike', 'competitor_bike')
        verbose_name_plural = "Market Competitor Mappings"

    def __str__(self):
        return f"{self.source_bike.name} vs {self.competitor_bike.name} (Aspirational: {self.is_aspirational})"
