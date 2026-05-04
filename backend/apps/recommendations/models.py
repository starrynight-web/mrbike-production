from django.db import models
from django.contrib.auth import get_user_model
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recommendation_profile')
    
    # Preference Signals
    preferred_segments = models.JSONField(default=list)  # ["sports", "naked"]
    preferred_brands = models.JSONField(default=list)  # ["yamaha", "suzuki"]
    price_range_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_range_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    preferred_displacement_min = models.IntegerField(null=True, blank=True)
    preferred_displacement_max = models.IntegerField(null=True, blank=True)
    new_vs_used_preference = models.FloatField(default=0.5)  # 0=new_only, 1=used_only
    location = models.CharField(max_length=100, null=True, blank=True)
    
    # Computed Profile
    primary_segment = models.CharField(max_length=50, null=True, blank=True)
    trust_sensitivity = models.FloatField(default=0.7)  # How much trust score matters
    price_sensitivity = models.FloatField(default=0.5)  # How much price matters
    aspirational_index = models.FloatField(default=0.3)  # Tendency to aspirational buys
    
    # Engagement metrics
    avg_session_duration = models.FloatField(default=0)  # seconds
    total_views = models.IntegerField(default=0)
    total_searches = models.IntegerField(default=0)
    last_active = models.DateTimeField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.email}"

class UserBehaviorLog(models.Model):
    BEHAVIOR_TYPES = [
        ('view', 'View'),
        ('search', 'Search'),
        ('wishlist', 'Wishlist'),
        ('compare', 'Compare'),
        ('inquiry', 'Inquiry'),
        ('filter_apply', 'Filter Apply'),
        ('listing_view', 'Listing View'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, db_index=True)
    behavior_type = models.CharField(max_length=20, choices=BEHAVIOR_TYPES)
    bike_model = models.ForeignKey(BikeModel, null=True, blank=True, on_delete=models.SET_NULL)
    used_listing = models.ForeignKey(UsedBikeListing, null=True, blank=True, on_delete=models.SET_NULL)
    metadata = models.JSONField(default=dict)  # search_query, filters, time_spent, etc.
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'behavior_type', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['bike_model', 'behavior_type']),
        ]

class RecommendationCache(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, db_index=True)
    context_bike = models.ForeignKey(BikeModel, null=True, blank=True, on_delete=models.SET_NULL)
    context_listing = models.ForeignKey(UsedBikeListing, null=True, blank=True, on_delete=models.SET_NULL)
    recommendations = models.JSONField()  # Structured recommendation data
    generated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        indexes = [
            models.Index(fields=['session_id', 'expires_at']),
            models.Index(fields=['context_bike']),
        ]
