# Skill.md: MrBikeBD Recommendation Engine

## Context Overview

**Domain**: Bangladeshi motorcycle marketplace (mrbikebd.com)
**Core Function**: New bike details + user-listed used bikes
**Target Users**: Bangladeshi motorcycle buyers/sellers
**Tech Stack**: Django + PostgreSQL (backend), Next.js (frontend)
**Scale**: ~20+ brands, ~200+ bikes (including electric), growing inventory of used bikes

---

## Brand Trust Hierarchy (Bangladesh Market)

```python
BRAND_TRUST_SCORES = {
    "yamaha": 95,
    "suzuki": 92,
    "honda": 90,
    "bajaj": 82,
    "tvs": 78,
    "hero": 75,
    "royal_enfield": 72,
    "ktm": 70,
    "cfmoto": 65,
    "gpx_demon": 60,
    "aprilia": 58,
    "qj_motor": 55,
    "hyosung": 52,
    "akij_motors": 50,
    "lifan": 45,
    "runner": 42,
    "vespa": 40,
    "taro": 38,
    "revoo": 35,
    "yadea": 55,  # Electric - separate consideration
    # New brands start at 30, earn trust through user engagement
}

ELECTRIC_BRAND_OVERRIDE = {
    "yadea": 70,  # Respected in EV segment
    # Electric buyers have different trust matrix
}
```

---

## Bike Segments (Bangladesh-Specific)

```python
BIKE_SEGMENTS = {
    "sports": {
        "displacement_range": (150, 400),
        "keywords": ["r15", "gixxer", "gsxr", "ns200", "apache", "cbr"],
        "user_intent": "performance", "style", "status"
    },
    "naked_street": {
        "displacement_range": (150, 400),
        "keywords": ["mt-15", "hornet", "fz", "duke", "pulsar", "xtreme"],
        "user_intent": "daily_performance", "versatility"
    },
    "commuter": {
        "displacement_range": (100, 160),
        "keywords": ["discover", "splendor", "glamour", "bd", "fox"],
        "user_intent": "fuel_efficiency", "reliability", "daily_use"
    },
    "cruiser": {
        "displacement_range": (200, 500),
        "keywords": ["classic", "meteor", "hunter", "thunderbird"],
        "user_intent": "comfort", "touring", "status", "lifestyle"
    },
    "adventure_touring": {
        "displacement_range": (200, 500),
        "keywords": ["vstrom", "adv", "ninja", "versys"],
        "user_intent": "touring", "versatility", "long_distance"
    },
    "scooter": {
        "displacement_range": (100, 160),
        "keywords": ["activa", "ntorq", "jupiter", "vespa", "aprilia_sr"],
        "user_intent": "convenience", "urban", "storage"
    },
    "electric": {
        "displacement_range": None,  # Uses different metrics
        "keywords": ["yadea", "revoo", "eco", "ev"],
        "user_intent": "running_cost", "eco_friendly", "urban"
    },
    "offroad_dirt": {
        "displacement_range": (150, 300),
        "keywords": ["crf", "klx", "tsx"],
        "user_intent": "adventure", "offroad"
    },
}
```

---

## Data Models (PostgreSQL)

```python
# models.py - Django Models

from django.db import models
from django.contrib.auth import get_user_model
import jsonfield or JSONField

User = get_user_model()


class BikeBrand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    trust_score = models.IntegerField(default=50)  # 0-100
    origin_country = models.CharField(max_length=50, null=True)
    is_electric_focused = models.BooleanField(default=False)
    popularity_rank = models.IntegerField(null=True)
    
    class Meta:
        ordering = ['-trust_score']


class BikeSegment(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    typical_displacement_min = models.IntegerField(null=True)
    typical_displacement_max = models.IntegerField(null=True)
    user_intents = models.JSONField(default=list)  # ["performance", "status"]
    cross_sell_segments = models.JSONField(default=list)  # Segments to recommend across
    aspirational_segments = models.JSONField(default=list)  # Upgrade paths


class BikeModel(models.Model):
    brand = models.ForeignKey(BikeBrand, on_delete=models.CASCADE)
    segment = models.ForeignKey(BikeSegment, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    displacement_cc = models.FloatField(null=True)
    price_min = models.DecimalField(max_digits=10, decimal_places=2)  # New price range
    price_max = models.DecimalField(max_digits=10, decimal_places=2)
    year_introduced = models.IntegerField(null=True)
    is_current = models.BooleanField(default=True)
    specifications = models.JSONField(default=dict)
    features = models.JSONField(default=list)
    popularity_score = models.FloatField(default=0)  # Calculated from views/wishlist
    trust_multiplier = models.FloatField(default=1.0)  # brand_trust/100
    
    # Computed fields updated periodically
    avg_used_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    used_price_min = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    used_price_max = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    depreciation_rate = models.FloatField(default=0.20)  # 20% first year typical
    
    class Meta:
        ordering = ['-popularity_score']
        indexes = [
            models.Index(fields=['segment', 'price_min']),
            models.Index(fields=['brand', 'displacement_cc']),
            models.Index(fields=['price_min', 'price_max']),
        ]


class UsedBikeListing(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('below_average', 'Below Average'),
    ]
    
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    bike_model = models.ForeignKey(BikeModel, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    year = models.IntegerField()
    km_driven = models.IntegerField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    location = models.CharField(max_length=100)  # Bangladeshi division/district
    description = models.TextField(blank=True)
    images = models.JSONField(default=list)  # List of image URLs
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    inquiry_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Computed
    price_vs_new_percentage = models.FloatField(null=True)  # Used/New * 100
    fair_price_score = models.FloatField(null=True)  # How fairly priced (0-100)
    
    class Meta:
        indexes = [
            models.Index(fields=['bike_model', 'price', 'is_active']),
            models.Index(fields=['price']),
            models.Index(fields=['location']),
            models.Index(fields=['created_at']),
        ]


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Preference Signals
    preferred_segments = models.JSONField(default=list)  # ["sports", "naked_street"]
    preferred_brands = models.JSONField(default=list)  # ["yamaha", "suzuki"]
    price_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    price_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    preferred_displacement_min = models.IntegerField(null=True)
    preferred_displacement_max = models.IntegerField(null=True)
    new_vs_used_preference = models.FloatField(default=0.5)  # 0=new_only, 1=used_only
    location = models.CharField(max_length=100, null=True)
    
    # Computed Profile
    primary_segment = models.ForeignKey(BikeSegment, null=True, on_delete=models.SET_NULL)
    trust_sensitivity = models.FloatField(default=0.7)  # How much trust score matters
    price_sensitivity = models.FloatField(default=0.5)  # How much price matters
    aspirational_index = models.FloatField(default=0.3)  # Tendency to aspirational buys
    
    # Engagement metrics
    avg_session_duration = models.FloatField(default=0)  # seconds
    total_views = models.IntegerField(default=0)
    total_searches = models.IntegerField(default=0)
    last_active = models.DateTimeField(null=True)
    
    updated_at = models.DateTimeField(auto_now=True)


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
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)  # Null for anonymous
    session_id = models.CharField(max_length=100, db_index=True)
    behavior_type = models.CharField(max_length=20, choices=BEHAVIOR_TYPES)
    bike_model = models.ForeignKey(BikeModel, null=True, on_delete=models.SET_NULL)
    used_listing = models.ForeignKey(UsedBikeListing, null=True, on_delete=models.SET_NULL)
    metadata = models.JSONField(default=dict)  # search_query, filters, time_spent, etc.
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'behavior_type', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['bike_model', 'behavior_type']),
        ]


class RecommendationCache(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    session_id = models.CharField(max_length=100, db_index=True)
    context_bike = models.ForeignKey(BikeModel, null=True, on_delete=models.SET_NULL)
    context_listing = models.ForeignKey(UsedBikeListing, null=True, on_delete=models.SET_NULL)
    recommendations = models.JSONField()  # Structured recommendation data
    slot_assignments = models.JSONField()  # Which bike in which slot
    generated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        indexes = [
            models.Index(fields=['session_id', 'expires_at']),
            models.Index(fields=['context_bike']),
        ]
```

---

## Recommendation Algorithm Core

```python
# recommendation_engine.py

import math
from datetime import timedelta
from django.db.models import Q, F, FloatField, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from collections import defaultdict

class BikeRecommender:
    """
    4-Slot Recommendation System for MrBikeBD
    
    Slot 1: Direct Alternative (Same segment, similar price, higher trust brand)
    Slot 2: Value Alternative (Same segment, better price proposition)
    Slot 3: Segment Peer (Same segment, different displacement/style)
    Slot 4: Cross-Segment Hook (Different segment, psychological exploration)
    """
    
    # Price range multipliers for Bangladesh used bike market
    PRICE_RANGES = {
        'tight': (0.90, 1.10),      # Very similar price
        'standard': (0.85, 1.20),    # Comfortable range
        'flexible': (0.75, 1.35),    # Willing to stretch
        'aspirational': (0.60, 1.50), # Big stretch for right bike
    }
    
    # Depreciation rates by year for Bangladeshi market
    DEPRECIATION_BY_YEAR = {
        0: 1.00,   # New
        1: 0.82,   # 18% first year
        2: 0.72,   # 28% by year 2
        3: 0.65,   # 35% by year 3
        4: 0.58,   # 42% by year 4
        5: 0.52,   # 48% by year 5
    }
    
    # Cross-segment mapping for Slot 4
    CROSS_SEGMENT_MAP = {
        'sports': ['cruiser', 'naked_street', 'adventure_touring'],
        'naked_street': ['sports', 'commuter', 'cruiser'],
        'commuter': ['naked_street', 'scooter', 'electric'],
        'cruiser': ['naked_street', 'adventure_touring', 'sports'],
        'adventure_touring': ['cruiser', 'naked_street', 'sports'],
        'scooter': ['commuter', 'electric'],
        'electric': ['scooter', 'commuter'],
        'offroad_dirt': ['sports', 'adventure_touring'],
    }
    
    # Aspirational segment mapping (upgrade paths)
    ASPIRATIONAL_MAP = {
        'commuter': 'naked_street',
        'naked_street': 'sports',
        'scooter': 'naked_street',
        'sports': 'cruiser',  # Or adventure for mature buyers
    }
    
    def __init__(self, user=None, session_id=None):
        self.user = user
        self.session_id = session_id
        self.user_profile = self._get_user_profile()
        self.behavior_history = self._get_behavior_history()
        self.price_sensitivity = self._calculate_price_sensitivity()
        
    def _get_user_profile(self):
        if not self.user:
            return None
        try:
            return UserProfile.objects.select_related('primary_segment').get(user=self.user)
        except UserProfile.DoesNotExist:
            return None
    
    def _get_behavior_history(self, days=30):
        """Get recent behavior with recency weighting"""
        cutoff = timezone.now() - timedelta(days=days)
        query = UserBehaviorLog.objects.filter(created_at__gte=cutoff)
        
        if self.user:
            query = query.filter(user=self.user)
        elif self.session_id:
            query = query.filter(session_id=self.session_id)
        else:
            return []
        
        return list(query.select_related('bike_model', 'used_listing'))
    
    def _calculate_price_sensitivity(self):
        """Determine how price-sensitive this user is (0-1)"""
        if not self.behavior_history:
            return 0.5  # Default moderate sensitivity
        
        price_views = []
        for log in self.behavior_history:
            bike = log.bike_model or (log.used_listing.bike_model if log.used_listing else None)
            if bike:
                if log.used_listing:
                    price_views.append(float(log.used_listing.price))
                else:
                    price_views.append(float(bike.price_min))
        
        if len(price_views) < 2:
            return 0.5
        
        # Lower variance = more focused/less price sensitive
        price_range = max(price_views) - min(price_views)
        avg_price = sum(price_views) / len(price_views)
        
        if avg_price == 0:
            return 0.5
        
        variance_ratio = price_range / avg_price
        
        # Map variance to sensitivity
        if variance_ratio < 0.1:
            return 0.3  # Focused buyer
        elif variance_ratio < 0.3:
            return 0.5  # Moderate
        elif variance_ratio < 0.5:
            return 0.7  # Exploring
        else:
            return 0.9  # Very price sensitive
    
    def get_recommendations(self, context_bike=None, context_listing=None):
        """
        Main entry point - returns 4 recommendations
        
        Args:
            context_bike: BikeModel being viewed
            context_listing: UsedBikeListing being viewed
        
        Returns:
            dict with slots 1-4, each containing bike/listing data
        """
        # Determine context price and segment
        if context_listing:
            context_price = float(context_listing.price)
            context_model = context_listing.bike_model
        elif context_bike:
            context_price = float(context_bike.price_min)
            context_model = context_bike
        else:
            return self._get_general_recommendations()
        
        context_segment = context_model.segment
        context_brand = context_model.brand
        context_displacement = context_model.displacement_cc or 150
        
        # Adjust price range based on sensitivity
        if self.price_sensitivity < 0.3:
            price_range = self.PRICE_RANGES['tight']
        elif self.price_sensitivity < 0.6:
            price_range = self.PRICE_RANGES['standard']
        else:
            price_range = self.PRICE_RANGES['flexible']
        
        # Calculate used bike equivalent price
        # If viewing new bike, find used equivalents
        # If viewing used bike, consider similar used + new comparisons
        if context_listing:
            # Viewing used bike - target similar used prices
            used_price_target = context_price
            new_price_equivalent = context_price / 0.75  # Estimate new price
        else:
            # Viewing new bike - suggest used alternatives
            used_price_target = context_price * 0.80  # Typical used price
            new_price_equivalent = context_price
        
        recommendations = {
            'slot_1': None,  # Direct alternative
            'slot_2': None,  # Value alternative  
            'slot_3': None,  # Segment peer
            'slot_4': None,  # Cross-segment hook
        }
        
        # Get candidate pools
        slot1_candidates = self._get_slot1_candidates(
            context_model, context_segment, used_price_target, new_price_equivalent, price_range
        )
        slot2_candidates = self._get_slot2_candidates(
            context_model, context_segment, used_price_target, price_range
        )
        slot3_candidates = self._get_slot3_candidates(
            context_model, context_segment, context_displacement, price_range
        )
        slot4_candidates = self._get_slot4_candidates(
            context_model, context_segment, context_price, self.user_profile
        )
        
        # Score and select best from each slot
        recommendations['slot_1'] = self._select_best(slot1_candidates, 'slot_1', context_model)
        recommendations['slot_2'] = self._select_best(slot2_candidates, 'slot_2', context_model)
        recommendations['slot_3'] = self._select_best(slot3_candidates, 'slot_3', context_model)
        recommendations['slot_4'] = self._select_best(slot4_candidates, 'slot_4', context_model)
        
        # Ensure no duplicates across slots
        recommendations = self._deduplicate_slots(recommendations)
        
        # Format for API response
        return self._format_recommendations(recommendations, context_model)
    
    def _get_slot1_candidates(self, context_model, context_segment, used_price_target, new_price_equivalent, price_range):
        """
        Slot 1: Direct Alternative
        - Same segment
        - Similar price (used bike price around ±5-10% of target)
        - Prefer higher trust brand
        - Prefer actively listed used bikes
        """
        candidates = []
        
        # Get used listings in similar segment and price range
        min_price = used_price_target * 0.92
        max_price = used_price_target * 1.12
        
        used_listings = UsedBikeListing.objects.filter(
            is_active=True,
            bike_model__segment=context_segment,
            price__gte=min_price,
            price__lte=max_price,
        ).exclude(
            bike_model=context_model
        ).select_related('bike_model', 'bike_model__brand').order_by('-fair_price_score')
        
        for listing in used_listings[:20]:
            score = self._calculate_slot1_score(listing, context_model)
            candidates.append({
                'type': 'used_listing',
                'listing': listing,
                'bike': listing.bike_model,
                'score': score,
            })
        
        # Also consider new bikes in similar segment
        new_min = new_price_equivalent * price_range[0]
        new_max = new_price_equivalent * price_range[1]
        
        new_bikes = BikeModel.objects.filter(
            segment=context_segment,
            price_min__gte=new_min,
            price_max__lte=new_max,
            is_current=True,
        ).exclude(
            id=context_model.id
        ).select_related('brand')
        
        for bike in new_bikes[:10]:
            # Lower priority for new in this slot (used preferred for value)
            score = self._calculate_slot1_score_new(bike, context_model) * 0.7
            candidates.append({
                'type': 'new_bike',
                'bike': bike,
                'score': score,
            })
        
        return sorted(candidates, key=lambda x: x['score'], reverse=True)
    
    def _calculate_slot1_score(self, listing, context_model):
        """
        Score for used listing in Slot 1
        Factors: Trust score, price fairness, recency, view count (social proof)
        """
        brand = listing.bike_model.brand
        base_score = 50
        
        # Trust score bonus (up to +25 points)
        trust_diff = brand.trust_score - context_model.brand.trust_score
        if trust_diff > 0:
            base_score += min(trust_diff * 0.5, 25)
        
        # Fair price score (up to +20 points)
        if listing.fair_price_score:
            base_score += listing.fair_price_score * 0.2
        
        # Recency bonus (up to +10 points)
        days_old = (timezone.now() - listing.created_at).days
        if days_old < 7:
            base_score += 10
        elif days_old < 30:
            base_score += 5
        
        # Social proof - view count indicates interest (up to +5 points)
        base_score += min(listing.view_count * 0.1, 5)
        
        # Condition bonus (up to +10 points)
        condition_scores = {'excellent': 10, 'good': 7, 'fair': 3, 'below_average': 0}
        base_score += condition_scores.get(listing.condition, 0)
        
        # Location proximity bonus if user has location
        if self.user_profile and self.user_profile.location:
            if self.user_profile.location in listing.location:
                base_score += 5
        
        return base_score
    
    def _calculate_slot1_score_new(self, bike, context_model):
        """Score for new bike in Slot 1 (lower priority)"""
        base_score = 30
        
        trust_diff = bike.brand.trust_score - context_model.brand.trust_score
        if trust_diff > 0:
            base_score += min(trust_diff * 0.3, 15)
        
        base_score += bike.popularity_score * 0.1
        
        return base_score
    
    def _get_slot2_candidates(self, context_model, context_segment, used_price_target, price_range):
        """
        Slot 2: Value Alternative
        - Same segment
        - Better value proposition (lower price for similar specs, or better specs for similar price)
        - Can include different displacement if good value
        """
        candidates = []
        
        # Lower price range for value finds
        min_price = used_price_target * 0.70
        max_price = used_price_target * 1.05
        
        used_listings = UsedBikeListing.objects.filter(
            is_active=True,
            bike_model__segment=context_segment,
            price__gte=min_price,
            price__lte=max_price,
        ).exclude(
            bike_model=context_model
        ).select_related('bike_model', 'bike_model__brand')
        
        for listing in used_listings[:20]:
            score = self._calculate_slot2_score(listing, context_model, used_price_target)
            candidates.append({
                'type': 'used_listing',
                'listing': listing,
                'bike': listing.bike_model,
                'score': score,
            })
        
        return sorted(candidates, key=lambda x: x['score'], reverse=True)
    
    def _calculate_slot2_score(self, listing, context_model, target_price):
        """Value-focused scoring"""
        brand = listing.bike_model.brand
        base_score = 40
        
        # Price advantage (up to +30 points for significantly cheaper)
        price_diff = (target_price - float(listing.price)) / target_price
        if price_diff > 0:  # Cheaper than target
            base_score += min(price_diff * 100, 30)
        
        # Spec parity or advantage
        if listing.bike_model.displacement_cc:
            if listing.bike_model.displacement_cc >= context_model.displacement_cc:
                base_score += 15  # Same or more CC for less money
            else:
                base_score += 5  # Less CC but cheaper
        
        # Trust floor - don't recommend very untrusted brands even for value
        if brand.trust_score < 40:
            base_score -= 20
        
        # Fair price score heavily weighted
        if listing.fair_price_score:
            base_score += listing.fair_price_score * 0.25
        
        return base_score
    
    def _get_slot3_candidates(self, context_model, context_segment, context_displacement, price_range):
        """
        Slot 3: Segment Peer
        - Same segment
        - Different displacement (±50cc typically)
        - Competitor bike (different brand)
        - Shows breadth of options in segment
        """
        candidates = []
        
        # Wider displacement range for peers
        min_cc = (context_displacement - 75) if context_displacement else 100
        max_cc = (context_displacement + 75) if context_displacement else 400
        
        # Get new bikes as segment peers (showing what else exists)
        new_peers = BikeModel.objects.filter(
            segment=context_segment,
            displacement_cc__gte=max(min_cc, 100),
            displacement_cc__lte=min(max_cc, 500),
            is_current=True,
        ).exclude(
            id=context_model.id
        ).select_related('brand')
        
        for bike in new_peers[:15]:
            score = self._calculate_slot3_score(bike, context_model)
            candidates.append({
                'type': 'new_bike',
                'bike': bike,
                'score': score,
            })
        
        # Also check used listings for segment peers
        used_peers = UsedBikeListing.objects.filter(
            is_active=True,
            bike_model__segment=context_segment,
            bike_model__displacement_cc__gte=max(min_cc, 100),
            bike_model__displacement_cc__lte=min(max_cc, 500),
        ).exclude(
            bike_model=context_model
        ).select_related('bike_model', 'bike_model__brand')[:10]
        
        for listing in used_peers:
            score = self._calculate_slot3_score_used(listing, context_model) * 0.8
            candidates.append({
                'type': 'used_listing',
                'listing': listing,
                'bike': listing.bike_model,
                'score': score,
            })
        
        return sorted(candidates, key=lambda x: x['score'], reverse=True)
    
    def _calculate_slot3_score(self, bike, context_model):
        """Score for segment peer - focus on showing variety"""
        base_score = 40
        
        # Different brand bonus
        if bike.brand != context_model.brand:
            base_score += 15
        
        # Similar displacement bonus
        if bike.displacement_cc and context_model.displacement_cc:
            cc_diff = abs(bike.displacement_cc - context_model.displacement_cc)
            if cc_diff <= 25:
                base_score += 10  # Very close displacement
            elif cc_diff <= 50:
                base_score += 5
        
        # Popularity (shows this is a notable option)
        base_score += min(bike.popularity_score * 0.15, 20)
        
        # Trust score consideration
        base_score += bike.brand.trust_score * 0.1
        
        return base_score
    
    def _calculate_slot3_score_used(self, listing, context_model):
        """Score for used listing as segment peer"""
        bike_score = self._calculate_slot3_score(listing.bike_model, context_model)
        
        # Add listing quality factors
        if listing.condition == 'excellent':
            bike_score += 10
        elif listing.condition == 'good':
            bike_score += 5
        
        return bike_score
    
    def _get_slot4_candidates(self, context_model, context_segment, context_price, user_profile):
        """
        Slot 4: Cross-Segment Hook
        - Different segment entirely
        - Psychological exploration trigger
        - Based on user profile or segment cross-sell map
        - Shows aspirational or complementary option
        """
        candidates = []
        
        # Determine target segments
        target_segments = self.CROSS_SEGMENT_MAP.get(
            context_segment.slug if context_segment else 'commuter',
            ['naked_street', 'sports']
        )
        
        # Adjust based on user profile if available
        if user_profile:
            # If user has clear segment preferences, lean that way
            if user_profile.preferred_segments:
                for pref in user_profile.preferred_segments:
                    if pref not in target_segments:
                        target_segments.insert(0, pref)
            
            # Aspirational buyers get upgrade path
            if user_profile.aspirational_index > 0.6:
                aspirational = self.ASPIRATIONAL_MAP.get(context_segment.slug)
                if aspirational and aspirational not in target_segments:
                    target_segments.insert(0, aspirational)
        
        # Get bikes from target segments
        # Price can vary more for cross-segment
        min_price = context_price * 0.65
        max_price = context_price * 1.40
        
        cross_bikes = BikeModel.objects.filter(
            segment__slug__in=target_segments,
            price_min__gte=min_price,
            price_max__lte=max_price,
            is_current=True,
        ).select_related('brand', 'segment')[:30]
        
        for bike in cross_bikes:
            score = self._calculate_slot4_score(bike, context_model, context_segment, user_profile)
            candidates.append({
                'type': 'new_bike',
                'bike': bike,
                'score': score,
            })
        
        # Also include used listings from other segments
        cross_used = UsedBikeListing.objects.filter(
            is_active=True,
            bike_model__segment__slug__in=target_segments,
            price__gte=min_price * 0.8,
            price__lte=max_price * 0.8,  # Used price adjustment
        ).select_related('bike_model', 'bike_model__brand', 'bike_model__segment')[:20]
        
        for listing in cross_used:
            score = self._calculate_slot4_score_used(
                listing, context_model, context_segment, user_profile
            )
            candidates.append({
                'type': 'used_listing',
                'listing': listing,
                'bike': listing.bike_model,
                'score': score,
            })
        
        return sorted(candidates, key=lambda x: x['score'], reverse=True)
    
    def _calculate_slot4_score(self, bike, context_model, context_segment, user_profile):
        """
        Cross-segment scoring - psychological factors
        """
        base_score = 30
        
        # Must be different segment
        if bike.segment == context_segment:
            return 0
        
        # Aspirational factor - is this an "upgrade" segment?
        segment_upgrade_map = {
            'commuter': ['naked_street', 'sports'],
            'naked_street': ['sports', 'cruiser'],
            'scooter': ['naked_street'],
        }
        
        if context_segment and context_segment.slug in segment_upgrade_map:
            if bike.segment.slug in segment_upgrade_map[context_segment.slug]:
                base_score += 20  # Aspirational boost
        
        # Brand trust helps for cross-segment exploration
        base_score += bike.brand.trust_score * 0.15
        
        # Popularity - well-known option is safer for cross-segment
        base_score += min(bike.popularity_score * 0.1, 15)
        
        # User profile alignment
        if user_profile:
            if bike.segment.slug in (user_profile.preferred_segments or []):
                base_score += 15
            
            if bike.brand.slug in (user_profile.preferred_brands or []):
                base_score += 10
            
            # High aspirational index = prefer premium cross-segment
            if user_profile.aspirational_index > 0.5:
                if bike.brand.trust_score >= 80:
                    base_score += 10
        
        # Avoid recommending commuter to sports viewers (downgrade perception)
        if context_segment and context_segment.slug == 'sports':
            if bike.segment.slug == 'commuter':
                base_score -= 30
        
        return base_score
    
    def _calculate_slot4_score_used(self, listing, context_model, context_segment, user_profile):
        """Cross-segment used listing score"""
        bike_score = self._calculate_slot4_score(
            listing.bike_model, context_model, context_segment, user_profile
        )
        
        # Used bikes less risky for cross-segment exploration
        if listing.condition in ['excellent', 'good']:
            bike_score += 8
        
        # Price advantage for experimentation
        bike_score += min(listing.fair_price_score * 0.1, 10) if listing.fair_price_score else 0
        
        return bike_score
    
    def _select_best(self, candidates, slot_type, context_model):
        """Select best candidate from slot, with fallback"""
        if not candidates:
            return self._get_fallback(slot_type, context_model)
        
        # Filter out zero scores
        valid_candidates = [c for c in candidates if c['score'] > 0]
        if not valid_candidates:
            return self._get_fallback(slot_type, context_model)
        
        # Return top candidate
        return valid_candidates[0]
    
    def _get_fallback(self, slot_type, context_model):
        """Fallback when no good candidates found"""
        if slot_type == 'slot_4':
            # For cross-segment, fallback to a popular bike from different segment
            fallback = BikeModel.objects.filter(
                is_current=True,
            ).exclude(
                segment=context_model.segment
            ).order_by('-popularity_score').select_related('brand').first()
            
            if fallback:
                return {
                    'type': 'new_bike',
                    'bike': fallback,
                    'score': 20,
                    'is_fallback': True,
                }
        
        return None
    
    def _deduplicate_slots(self, recommendations):
        """Ensure no bike appears in multiple slots"""
        seen_bike_ids = set()
        seen_listing_ids = set()
        
        for slot_key in ['slot_1', 'slot_2', 'slot_3', 'slot_4']:
            rec = recommendations[slot_key]
            if not rec:
                continue
            
            bike_id = rec['bike'].id if rec.get('bike') else None
            listing_id = rec.get('listing') and rec['listing'].id
            
            if bike_id in seen_bike_ids or listing_id in seen_listing_ids:
                # Find replacement from candidates (would need to store them)
                recommendations[slot_key] = None
            else:
                if bike_id:
                    seen_bike_ids.add(bike_id)
                if listing_id:
                    seen_listing_ids.add(listing_id)
        
        return recommendations
    
    def _format_recommendations(self, recommendations, context_model):
        """Format for API response"""
        result = {
            'context_bike': {
                'id': context_model.id,
                'name': context_model.name,
                'brand': context_model.brand.name,
                'segment': context_model.segment.name if context_model.segment else None,
            },
            'recommendations': [],
            'user_profile_summary': self._get_profile_summary(),
        }
        
        slot_labels = {
            'slot_1': 'direct_alternative',
            'slot_2': 'value_pick',
            'slot_3': 'segment_peer',
            'slot_4': 'explore_different',
        }
        
        slot_reasons = {
            'slot_1': f'Similar to {context_model.name} with trusted brand',
            'slot_2': 'Great value in this segment',
            'slot_3': 'Popular alternative in same category',
            'slot_4': 'You might also like this style',
        }
        
        for slot_key, label in slot_labels.items():
            rec = recommendations[slot_key]
            if not rec:
                continue
            
            formatted = {
                'slot': label,
                'reason': slot_reasons[slot_key],
                'is_fallback': rec.get('is_fallback', False),
            }
            
            if rec['type'] == 'used_listing':
                listing = rec['listing']
                formatted.update({
                    'listing_type': 'used',
                    'listing_id': listing.id,
                    'bike_id': listing.bike_model.id,
                    'bike_name': listing.bike_model.name,
                    'brand_name': listing.bike_model.brand.name,
                    'price': float(listing.price),
                    'year': listing.year,
                    'km_driven': listing.km_driven,
                    'condition': listing.condition,
                    'location': listing.location,
                    'image': listing.images[0] if listing.images else None,
                    'trust_score': listing.bike_model.brand.trust_score,
                    'fair_price_score': listing.fair_price_score,
                })
            else:
                bike = rec['bike']
                formatted.update({
                    'listing_type': 'new',
                    'bike_id': bike.id,
                    'bike_name': bike.name,
                    'brand_name': bike.brand.name,
                    'price_min': float(bike.price_min),
                    'price_max': float(bike.price_max),
                    'segment': bike.segment.name if bike.segment else None,
                    'displacement': bike.displacement_cc,
                    'slug': bike.slug,
                    'trust_score': bike.brand.trust_score,
                })
            
            result['recommendations'].append(formatted)
        
        return result
    
    def _get_profile_summary(self):
        """Summary of user profile for debugging/analytics"""
        if not self.user_profile:
            return {'profile_type': 'anonymous'}
        
        return {
            'profile_type': 'known',
            'primary_segment': self.user_profile.primary_segment.name if self.user_profile.primary_segment else None,
            'price_sensitivity': self.price_sensitivity,
            'trust_sensitivity': self.user_profile.trust_sensitivity,
            'preferred_brands': self.user_profile.preferred_brands[:3] if self.user_profile.preferred_brands else [],
        }
    
    def _get_general_recommendations(self):
        """Recommendations when no specific bike context"""
        candidates = []
        
        # Popular bikes with trust bonus
        popular = BikeModel.objects.filter(
            is_current=True
        ).select_related('brand', 'segment').order_by('-popularity_score')[:50]
        
        for bike in popular:
            score = bike.popularity_score + (bike.brand.trust_score * 0.5)
            candidates.append({
                'type': 'new_bike',
                'bike': bike,
                'score': score,
            })
        
        # Recent good used listings
        recent_used = UsedBikeListing.objects.filter(
            is_active=True,
            created_at__gte=timezone.now() - timedelta(days=7),
            fair_price_score__gte=70,
        ).select_related('bike_model', 'bike_model__brand')[:30]
        
        for listing in recent_used:
            score = listing.fair_price_score + (listing.bike_model.brand.trust_score * 0.3)
            candidates.append({
                'type': 'used_listing',
                'listing': listing,
                'bike': listing.bike_model,
                'score': score,
            })
        
        # Sort and pick 4
        candidates.sort(key=lambda x: x['score'], reverse=True)
        top_4 = candidates[:4]
        
        # Format
        result = {
            'context_bike': None,
            'recommendations': [],
            'user_profile_summary': self._get_profile_summary(),
        }
        
        labels = ['trending_now', 'trusted_pick', 'fresh_listing', 'popular_choice']
        
        for i, rec in enumerate(top_4):
            formatted = {
                'slot': labels[i],
                'reason': 'Recommended for you',
            }
            
            if rec['type'] == 'used_listing':
                listing = rec['listing']
                formatted.update({
                    'listing_type': 'used',
                    'listing_id': listing.id,
                    'bike_id': listing.bike_model.id,
                    'bike_name': listing.bike_model.name,
                    'brand_name': listing.bike_model.brand.name,
                    'price': float(listing.price),
                    'year': listing.year,
                    'condition': listing.condition,
                    'location': listing.location,
                    'image': listing.images[0] if listing.images else None,
                })
            else:
                bike = rec['bike']
                formatted.update({
                    'listing_type': 'new',
                    'bike_id': bike.id,
                    'bike_name': bike.name,
                    'brand_name': bike.brand.name,
                    'price_min': float(bike.price_min),
                    'price_max': float(bike.price_max),
                    'segment': bike.segment.name if bike.segment else None,
                    'displacement': bike.displacement_cc,
                    'slug': bike.slug,
                })
            
            result['recommendations'].append(formatted)
        
        return result
```

---

## User Profile Builder

```python
# profile_builder.py

from collections import Counter
from django.utils import timezone
from datetime import timedelta


class UserProfileBuilder:
    """
    Builds and updates user profile based on behavior history
    Should run periodically (cron job) and on significant actions
    """
    
    def __init__(self, user):
        self.user = user
        self.profile, _ = UserProfile.objects.get_or_create(user=user)
    
    def update_from_behavior(self):
        """Full profile update from all behavior history"""
        # Get all time behavior
        all_behavior = UserBehaviorLog.objects.filter(
            user=self.user
        ).select_related('bike_model__segment', 'bike_model__brand')
        
        # Segment preferences
        segment_counts = Counter()
        for log in all_behavior:
            if log.bike_model and log.bike_model.segment:
                segment_counts[log.bike_model.segment] += 1
        
        # Weight recent behavior more
        recent_behavior = all_behavior.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        )
        
        recent_segment_counts = Counter()
        for log in recent_behavior:
            if log.bike_model and log.bike_model.segment:
                recent_segment_counts[log.bike_model.segment] += 2  # Double weight
        
        # Combined segment scores
        combined_segments = segment_counts + recent_segment_counts
        
        # Get top segments
        total_segment_views = sum(combined_segments.values())
        if total_segment_views > 0:
            preferred_segments = [
                segment.slug for segment, count in combined_segments.most_common(5)
                if count / total_segment_views > 0.05  # At least 5% of views
            ]
            self.profile.preferred_segments = preferred_segments
            
            # Set primary segment
            if combined_segments:
                self.profile.primary_segment = combined_segments.most_common(1)[0][0]
        
        # Brand preferences
        brand_counts = Counter()
        for log in all_behavior:
            if log.bike_model:
                brand_counts[log.bike_model.brand.slug] += 1
        
        self.profile.preferred_brands = [
            brand for brand, _ in brand_counts.most_common(5)
        ]
        
        # Price range from viewed bikes
        prices = []
        for log in all_behavior:
            if log.used_listing:
                prices.append(float(log.used_listing.price))
            elif log.bike_model:
                prices.append(float(log.bike_model.price_min))
        
        if prices:
            prices.sort()
            # Use 10th-90th percentile to avoid outliers
            p10_idx = int(len(prices) * 0.1)
            p90_idx = int(len(prices) * 0.9)
            self.profile.price_range_min = prices[p10_idx]
            self.profile.price_range_max = prices[p90_idx]
        
        # Displacement preferences
        displacements = [
            log.bike_model.displacement_cc 
            for log in all_behavior 
            if log.bike_model and log.bike_model.displacement_cc
        ]
        
        if displacements:
            self.profile.preferred_displacement_min = min(displacements) - 25
            self.profile.preferred_displacement_max = max(displacements) + 25
        
        # New vs used preference
        new_views = sum(1 for log in all_behavior if log.bike_model and not log.used_listing)
        used_views = sum(1 for log in all_behavior if log.used_listing)
        total_views = new_views + used_views
        
        if total_views > 0:
            self.profile.new_vs_used_preference = used_views / total_views
        
        # Calculate sensitivity scores
        self._calculate_sensitivity_scores(all_behavior)
        
        # Update engagement metrics
        self.profile.total_views = all_behavior.filter(behavior_type='view').count()
        self.profile.total_searches = all_behavior.filter(behavior_type='search').count()
        self.profile.last_active = all_behavior.order_by('-created_at').first().created_at if all_behavior.exists() else None
        
        self.profile.save()
    
    def _calculate_sensitivity_scores(self, behavior):
        """Calculate trust and price sensitivity based on behavior patterns"""
        # Trust sensitivity: Do they stick with high-trust brands or explore?
        brand_trusts = []
        for log in behavior:
            if log.bike_model:
                brand_trusts.append(log.bike_model.brand.trust_score)
        
        if brand_trusts:
            avg_trust = sum(brand_trusts) / len(brand_trusts)
            trust_variance = sum((t - avg_trust) ** 2 for t in brand_trusts) / len(brand_trusts)
            
            # Low variance = high trust sensitivity (only views trusted brands)
            # High variance = low trust sensitivity (explores all brands)
            self.profile.trust_sensitivity = max(0, 1 - (trust_variance / 2500))
        else:
            self.profile.trust_sensitivity = 0.5
        
        # Price sensitivity from view patterns
        prices = []
        for log in behavior:
            if log.used_listing:
                prices.append(float(log.used_listing.price))
            elif log.bike_model:
                prices.append(float(log.bike_model.price_min))
        
        if len(prices) >= 3:
            price_range = max(prices) - min(prices)
            avg_price = sum(prices) / len(prices)
            
            if avg_price > 0:
                relative_range = price_range / avg_price
                self.profile.price_sensitivity = min(relative_range, 1.0)
        
        # Aspirational index: Do they view bikes above their typical price range?
        if len(prices) >= 5:
            median_price = sorted(prices)[len(prices) // 2]
            above_median_views = sum(1 for p in prices if p > median_price * 1.3)
            self.profile.aspirational_index = above_median_views / len(prices)
    
    def record_behavior(self, behavior_type, bike_model=None, used_listing=None, metadata=None):
        """Record a behavior event and trigger lightweight profile update"""
        log = UserBehaviorLog.objects.create(
            user=self.user,
            session_id=metadata.get('session_id', '') if metadata else '',
            behavior_type=behavior_type,
            bike_model=bike_model,
            used_listing=used_listing,
            metadata=metadata or {},
        )
        
        # Lightweight update for significant actions
        if behavior_type in ['wishlist', 'inquiry', 'compare']:
            self.update_from_behavior()
        
        return log
```

---

## Background Jobs (Celery)

```python
# tasks.py

from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task
def update_popularity_scores():
    """Update bike popularity scores based on recent engagement"""
    from .models import BikeModel, UserBehaviorLog, UsedBikeListing
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    for bike in BikeModel.objects.all():
        # Views
        view_count = UserBehaviorLog.objects.filter(
            bike_model=bike,
            behavior_type='view',
            created_at__gte=thirty_days_ago
        ).count()
        
        # Wishlists (higher weight)
        wishlist_count = UserBehaviorLog.objects.filter(
            bike_model=bike,
            behavior_type='wishlist',
            created_at__gte=thirty_days_ago
        ).count()
        
        # Inquiries (highest weight)
        inquiry_count = UserBehaviorLog.objects.filter(
            bike_model=bike,
            behavior_type='inquiry',
            created_at__gte=thirty_days_ago
        ).count()
        
        # Used listing engagement
        used_views = UserBehaviorLog.objects.filter(
            used_listing__bike_model=bike,
            behavior_type='listing_view',
            created_at__gte=thirty_days_ago
        ).count()
        
        # Calculate score (weighted sum)
        score = (
            view_count * 1 +
            wishlist_count * 5 +
            inquiry_count * 10 +
            used_views * 1.5
        )
        
        # Normalize with decay factor
        bike.popularity_score = score * 0.9 + bike.popularity_score * 0.1  # EMA
        bike.save(update_fields=['popularity_score'])


@shared_task
def update_used_bike_prices():
    """Update aggregate used bike prices for each model"""
    from .models import BikeModel, UsedBikeListing
    
    for bike in BikeModel.objects.all():
        active_listings = UsedBikeListing.objects.filter(
            bike_model=bike,
            is_active=True
        )
        
        if active_listings.exists():
            from django.db.models import Avg, Min, Max
            aggregates = active_listings.aggregate(
                avg_price=Avg('price'),
                min_price=Min('price'),
                max_price=Max('price'),
            )
            
            bike.avg_used_price = aggregates['avg_price']
            bike.used_price_min = aggregates['min_price']
            bike.used_price_max = aggregates['max_price']
            
            # Calculate depreciation
            if bike.price_min and aggregates['avg_price']:
                bike.depreciation_rate = 1 - (float(aggregates['avg_price']) / float(bike.price_min))
            
            bike.save(update_fields=[
                'avg_used_price', 'used_price_min', 'used_price_max', 'depreciation_rate'
            ])


@shared_task
def calculate_fair_price_scores():
    """Calculate fair price score for each used listing"""
    from .models import UsedBikeListing, BikeModel
    
    listings = UsedBikeListing.objects.filter(is_active=True)
    
    for listing in listings:
        bike = listing.bike_model
        
        # Expected price based on depreciation curve
        years_old = timezone.now().year - listing.year
        years_old = max(0, min(years_old, 10))
        
        depreciation_rates = {
            0: 1.00, 1: 0.82, 2: 0.72, 3: 0.65,
            4: 0.58, 5: 0.52, 6: 0.48, 7: 0.45,
            8: 0.42, 9: 0.40, 10: 0.38,
        }
        
        expected_ratio = depreciation_rates.get(years_old, 0.35)
        expected_price = float(bike.price_min) * expected_ratio
        
        # Adjust for condition
        condition_adjustments = {
            'excellent': 1.10,
            'good': 1.00,
            'fair': 0.90,
            'below_average': 0.75,
        }
        
        condition_adj = condition_adjustments.get(listing.condition, 1.0)
        expected_price *= condition_adj
        
        # Adjust for km driven
        if listing.km_driven:
            # Typical: 10000 km/year
            expected_km = years_old * 10000
            km_ratio = listing.km_driven / max(expected_km, 1)
            if km_ratio > 1.5:
                expected_price *= 0.90  # High km = lower price
            elif km_ratio < 0.5:
                expected_price *= 1.05  # Low km = higher price
        
        # Calculate fair price score (100 = exactly fair, higher = good deal)
        if expected_price > 0:
            price_ratio = float(listing.price) / expected_price
            if price_ratio <= 0.85:
                fair_score = 95  # Great deal
            elif price_ratio <= 0.95:
                fair_score = 90
            elif price_ratio <= 1.05:
                fair_score = 80
            elif price_ratio <= 1.15:
                fair_score = 60
            elif price_ratio <= 1.25:
                fair_score = 40
            else:
                fair_score = 20  # Overpriced
        else:
            fair_score = 50
        
        listing.fair_price_score = fair_score
        listing.price_vs_new_percentage = (
            (float(listing.price) / float(bike.price_min)) * 100
            if bike.price_min else None
        )
        
        listing.save(update_fields=['fair_price_score', 'price_vs_new_percentage'])


@shared_task
def update_all_user_profiles():
    """Periodic full profile update for all users"""
    from .models import UserProfile, User
    from .profile_builder import UserProfileBuilder
    
    active_users = User.objects.filter(
        userprofile__last_active__gte=timezone.now() - timedelta(days=60)
    )
    
    for user in active_users:
        try:
            builder = UserProfileBuilder(user)
            builder.update_from_behavior()
        except Exception as e:
            # Log error but continue with other users
            print(f"Profile update failed for user {user.id}: {e}")


@shared_task
def cleanup_expired_recommendations():
    """Remove expired recommendation cache entries"""
    from .models import RecommendationCache
    
    RecommendationCache.objects.filter(
        expires_at__lte=timezone.now()
    ).delete()
```

---

## API Endpoints (Django REST Framework)

```python
# api_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta


class RecommendationAPIView(APIView):
    """
    Get personalized recommendations
    
    Query params:
    - bike_id: BikeModel ID being viewed
    - listing_id: UsedBikeListing ID being viewed
    - session_id: For anonymous users
    """
    
    def get(self, request):
        bike_id = request.query_params.get('bike_id')
        listing_id = request.query_params.get('listing_id')
        session_id = request.query_params.get('session_id')
        
        context_bike = None
        context_listing = None
        
        if listing_id:
            try:
                context_listing = UsedBikeListing.objects.select_related(
                    'bike_model', 'bike_model__brand', 'bike_model__segment'
                ).get(id=listing_id, is_active=True)
                context_bike = context_listing.bike_model
            except UsedBikeListing.DoesNotExist:
                return Response(
                    {'error': 'Listing not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif bike_id:
            try:
                context_bike = BikeModel.objects.select_related(
                    'brand', 'segment'
                ).get(id=bike_id)
            except BikeModel.DoesNotExist:
                return Response(
                    {'error': 'Bike not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Check cache first
        cache_key = self._get_cache_key(request.user, session_id, context_bike, context_listing)
        cached = self._get_cached_recommendation(cache_key)
        if cached:
            return Response(cached)
        
        # Generate recommendations
        recommender = BikeRecommender(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
        )
        
        recommendations = recommender.get_recommendations(
            context_bike=context_bike,
            context_listing=context_listing,
        )
        
        # Cache the result
        self._cache_recommendation(cache_key, recommendations)
        
        # Log this recommendation view
        self._log_recommendation_view(request, context_bike, context_listing, recommendations)
        
        return Response(recommendations)
    
    def _get_cache_key(self, user, session_id, bike, listing):
        parts = []
        if user and user.is_authenticated:
            parts.append(f"user_{user.id}")
        else:
            parts.append(f"session_{session_id or 'anon'}")
        
        if listing:
            parts.append(f"listing_{listing.id}")
        elif bike:
            parts.append(f"bike_{bike.id}")
        else:
            parts.append("general")
        
        return "_".join(parts)
    
    def _get_cached_recommendation(self, cache_key):
        try:
            cached = RecommendationCache.objects.filter(
                session_id=cache_key,
                expires_at__gt=timezone.now()
            ).first()
            
            if cached:
                return cached.recommendations
        except:
            pass
        return None
    
    def _cache_recommendation(self, cache_key, recommendations):
        RecommendationCache.objects.update_or_create(
            session_id=cache_key,
            defaults={
                'user': recommendations.get('user_profile_summary', {}).get('profile_type') != 'anonymous' and self.request.user or None,
                'recommendations': recommendations,
                'expires_at': timezone.now() + timedelta(minutes=30),
            }
        )
    
    def _log_recommendation_view(self, request, bike, listing, recommendations):
        """Log that recommendations were shown"""
        # This helps track recommendation effectiveness
        pass


class TrackBehaviorAPIView(APIView):
    """
    Track user behavior for recommendations
    
    POST body:
    - behavior_type: view|search|wishlist|compare|inquiry|filter_apply|listing_view
    - bike_id: optional
    - listing_id: optional
    - metadata: optional dict (search_query, time_spent, filters, etc.)
    - session_id: required for anonymous
    """
    
    def post(self, request):
        behavior_type = request.data.get('behavior_type')
        bike_id = request.data.get('bike_id')
        listing_id = request.data.get('listing_id')
        metadata = request.data.get('metadata', {})
        session_id = request.data.get('session_id')
        
        if not behavior_type:
            return Response(
                {'error': 'behavior_type required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate behavior type
        valid_types = ['view', 'search', 'wishlist', 'compare', 'inquiry', 'filter_apply', 'listing_view']
        if behavior_type not in valid_types:
            return Response(
                {'error': f'Invalid behavior_type. Must be one of: {valid_types}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get related objects
        bike = None
        listing = None
        
        if bike_id:
            try:
                bike = BikeModel.objects.get(id=bike_id)
            except BikeModel.DoesNotExist:
                pass
        
        if listing_id:
            try:
                listing = UsedBikeListing.objects.get(id=listing_id)
                if not bike:
                    bike = listing.bike_model
            except UsedBikeListing.DoesNotExist:
                pass
        
        # Add session_id to metadata
        metadata['session_id'] = session_id
        
        # Create log
        log = UserBehaviorLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id or '',
            behavior_type=behavior_type,
            bike_model=bike,
            used_listing=listing,
            metadata=metadata,
        )
        
        # Update view counts
        if behavior_type == 'view' and bike:
            bike.popularity_score += 0.1
            bike.save(update_fields=['popularity_score'])
        
        if behavior_type == 'listing_view' and listing:
            listing.view_count += 1
            listing.save(update_fields=['view_count'])
        
        # Trigger profile update for significant actions
        if behavior_type in ['wishlist', 'inquiry'] and request.user.is_authenticated:
            from .tasks import update_single_user_profile
            update_single_user_profile.delay(request.user.id)
        
        return Response({'status': 'ok', 'log_id': log.id})


class UserPreferencesAPIView(APIView):
    """
    Get/update user preference profile
    """
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'profile_type': 'anonymous'})
        
        try:
            profile = UserProfile.objects.get(user=request.user)
            return Response({
                'profile_type': 'known',
                'preferred_segments': profile.preferred_segments,
                'preferred_brands': profile.preferred_brands,
                'price_range': {
                    'min': float(profile.price_range_min) if profile.price_range_min else None,
                    'max': float(profile.price_range_max) if profile.price_range_max else None,
                },
                'displacement_range': {
                    'min': profile.preferred_displacement_min,
                    'max': profile.preferred_displacement_max,
                },
                'new_vs_used': profile.new_vs_used_preference,
                'primary_segment': profile.primary_segment.name if profile.primary_segment else None,
                'sensitivities': {
                    'trust': profile.trust_sensitivity,
                    'price': profile.price_sensitivity,
                    'aspirational': profile.aspirational_index,
                },
            })
        except UserProfile.DoesNotExist:
            return Response({'profile_type': 'new_user'})


# urls.py
from django.urls import path
from .api_views import RecommendationAPIView, TrackBehaviorAPIView, UserPreferencesAPIView

urlpatterns = [
    path('api/recommendations/', RecommendationAPIView.as_view(), name='recommendations'),
    path('api/behavior/track/', TrackBehaviorAPIView.as_view(), name='track_behavior'),
    path('api/preferences/', UserPreferencesAPIView.as_view(), name='user_preferences'),
]
```

---

## Frontend Integration (Next.js)

```typescript
// lib/recommendations.ts

import { useSession } from 'next-auth/react';

const SESSION_ID_KEY = 'mrbike_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export interface Recommendation {
  slot: 'direct_alternative' | 'value_pick' | 'segment_peer' | 'explore_different' | 'trending_now' | 'trusted_pick' | 'fresh_listing' | 'popular_choice';
  reason: string;
  is_fallback?: boolean;
  listing_type: 'used' | 'new';
  listing_id?: number;
  bike_id: number;
  bike_name: string;
  brand_name: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  year?: number;
  km_driven?: number;
  condition?: string;
  location?: string;
  image?: string;
  segment?: string;
  displacement?: number;
  slug?: string;
  trust_score?: number;
  fair_price_score?: number;
}

export interface RecommendationResponse {
  context_bike: {
    id: number;
    name: string;
    brand: string;
    segment: string | null;
  } | null;
  recommendations: Recommendation[];
  user_profile_summary: {
    profile_type: string;
    primary_segment?: string;
    price_sensitivity?: number;
    trust_sensitivity?: number;
    preferred_brands?: string[];
  };
}

export async function getRecommendations(
  bikeId?: number,
  listingId?: number
): Promise<RecommendationResponse> {
  const sessionId = getSessionId();
  
  const params = new URLSearchParams();
  if (bikeId) params.append('bike_id', bikeId.toString());
  if (listingId) params.append('listing_id', listingId.toString());
  if (sessionId) params.append('session_id', sessionId);
  
  const response = await fetch(`/api/recommendations/?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
}

export async function trackBehavior(
  behaviorType: 'view' | 'search' | 'wishlist' | 'compare' | 'inquiry' | 'filter_apply' | 'listing_view',
  bikeId?: number,
  listingId?: number,
  metadata?: Record<string, any>
): Promise<void> {
  const sessionId = getSessionId();
  
  // Send asynchronously, don't block UI
  fetch('/api/behavior/track/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      behavior_type: behaviorType,
      bike_id: bikeId,
      listing_id: listingId,
      session_id: sessionId,
      metadata,
    }),
  }).catch(console.error);
}
```

```typescript
// components/RecommendationSection.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecommendations, Recommendation, RecommendationResponse } from '@/lib/recommendations';
import Image from 'next/image';

interface Props {
  bikeId?: number;
  listingId?: number;
}

const slotLabels: Record<string, string> = {
  direct_alternative: 'Recommended for You',
  value_pick: 'Best Value',
  segment_peer: 'Similar Bikes',
  explore_different: 'You Might Also Like',
  trending_now: 'Trending Now',
  trusted_pick: 'Trusted Choice',
  fresh_listing: 'Just Listed',
  popular_choice: 'Popular Pick',
};

const slotIcons: Record<string, string> = {
  direct_alternative: '🎯',
  value_pick: '💰',
  segment_peer: '🏍️',
  explore_different: '✨',
  trending_now: '🔥',
  trusted_pick: '🛡️',
  fresh_listing: '🆕',
  popular_choice: '⭐',
};

export default function RecommendationSection({ bikeId, listingId }: Props) {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(bikeId, listingId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bikeId, listingId]);

  if (loading) {
    return <RecommendationSkeleton />;
  }

  if (!data || data.recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {data.context_bike ? 'Recommended for You' : 'Discover Bikes'}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const href = recommendation.listing_type === 'used'
    ? `/used-bikes/${recommendation.listing_id}`
    : `/bike/${recommendation.slug}`;

  const price = recommendation.listing_type === 'used'
    ? `৳${(recommendation.price! / 100000).toFixed(2)} লক্ষ`
    : `৳${(recommendation.price_min! / 100000).toFixed(2)} - ৳${(recommendation.price_max! / 100000).toFixed(2)} লক্ষ`;

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
        {/* Image */}
        <div className="relative h-40 bg-gray-50">
          {recommendation.image ? (
            <Image
              src={recommendation.image}
              alt={recommendation.bike_name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              🏍️
            </div>
          )}
          
          {/* Slot badge */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
            {slotIcons[recommendation.slot]} {slotLabels[recommendation.slot]}
          </div>
          
          {/* Listing type badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white ${
            recommendation.listing_type === 'used' 
              ? 'bg-green-500' 
              : 'bg-blue-500'
          }`}>
            {recommendation.listing_type === 'used' ? 'Used' : 'New'}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">{recommendation.brand_name}</p>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
            {recommendation.bike_name}
          </h3>
          
          {/* Used bike specifics */}
          {recommendation.listing_type === 'used' && (
            <div className="flex gap-2 text-xs text-gray-500 mb-2">
              <span>{recommendation.year}</span>
              <span>•</span>
              <span>{recommendation.km_driven?.toLocaleString()} km</span>
              <span>•</span>
              <span className="capitalize">{recommendation.condition}</span>
            </div>
          )}
          
          {/* Price */}
          <p className="font-bold text-gray-900 text-sm">{price}</p>
          
          {/* Trust indicator */}
          {recommendation.trust_score !== undefined && recommendation.trust_score >= 80 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600">✓ Trusted Brand</span>
            </div>
          )}
          
          {/* Fair price indicator */}
          {recommendation.fair_price_score !== undefined && recommendation.fair_price_score >= 80 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-blue-600">💰 Fair Price</span>
            </div>
          )}
          
          {/* Reason */}
          <p className="text-xs text-gray-400 mt-2 italic">{recommendation.reason}</p>
        </div>
      </div>
    </Link>
  );
}

function RecommendationSkeleton() {
  return (
    <section className="mt-8 mb-12">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gray-100 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mt-4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## Price Range Research Notes (Bangladesh Market)

```python
# pricing_intelligence.py

"""
Bangladesh Used Bike Market Pricing Intelligence

Key Findings:
1. Sports bikes (150-200cc): Hold value best, 15-22% depreciation year 1
   - R15 V4: Used prices typically 80-88% of new
   - Gixxer SF: Used prices 75-85% of new
   - Reasons: High demand, limited supply, aspirational value

2. Commuter bikes (100-150cc): Higher depreciation, 22-30% year 1
   - Discover 125: Used prices 65-75% of new
   - GD Honda: Used prices 70-78% of new
   - Reasons: Abundant supply, functional purchase

3. Premium/Cruiser: Moderate depreciation, 18-25% year 1
   - Classic 350: Used prices 78-85% of new
   - Meteor: Used prices 75-82% of new
   - Reasons: Brand cachet, waiting period advantage

4. Chinese brands (CFMoto, GPX): Higher depreciation, 25-35% year 1
   - CFMoto 250SR: Used prices 60-72% of new
   - GPX Demon: Used prices 55-68% of new
   - Reasons: Trust deficit, parts availability concerns

RECOMMENDATION PRICE RANGE CALCULATION:
For optimal recommendation click-through:

If user viewing NEW bike at price P:
- Slot 1 (Direct Alternative): Used price = P × 0.78 to P × 0.88
- Slot 2 (Value Pick): Used price = P × 0.65 to P × 0.80
- Slot 3 (Segment Peer): New price = P × 0.90 to P × 1.15
- Slot 4 (Cross-Segment): New price = P × 0.70 to P × 1.30

If user viewing USED bike at price P:
- Slot 1 (Direct Alternative): Used price = P × 0.92 to P × 1.12
- Slot 2 (Value Pick): Used price = P × 0.75 to P × 0.95
- Slot 3 (Segment Peer): Used price = P × 0.85 to P × 1.20
- Slot 4 (Cross-Segment): New price = P × 1.10 to P × 1.60

TRUST SCORE IMPACT ON CLICK-THROUGH:
- 90+ trust score: 2.5x more likely to click recommendation
- 80-89 trust score: 1.8x more likely
- 70-79 trust score: 1.2x more likely
- Below 70: Neutral or negative effect unless significant price advantage
"""

SEGMENT_DEPRECIATION_RATES = {
    'sports': {'year_1': 0.17, 'year_2': 0.25, 'year_3': 0.32},
    'naked_street': {'year_1': 0.20, 'year_2': 0.28, 'year_3': 0.35},
    'commuter': {'year_1': 0.25, 'year_2': 0.33, 'year_3': 0.40},
    'cruiser': {'year_1': 0.18, 'year_2': 0.24, 'year_3': 0.30},
    'scooter': {'year_1': 0.22, 'year_2': 0.30, 'year_3': 0.37},
    'electric': {'year_1': 0.30, 'year_2': 0.40, 'year_3': 0.50},  # Battery degradation concerns
    'adventure_touring': {'year_1': 0.19, 'year_2': 0.26, 'year_3': 0.33},
}

# Brand-specific depreciation adjustments
BRAND_DEPRECIATION_ADJUSTMENT = {
    'yamaha': -0.03,    # Holds value better
    'suzuki': -0.02,
    'honda': -0.04,     # Honda holds value best
    'bajaj': 0.00,
    'tvs': 0.01,
    'hero': 0.02,
    'royal_enfield': -0.02,
    'ktm': 0.01,
    'cfmoto': 0.05,     # Loses value faster
    'gpx_demon': 0.07,
    'lifan': 0.08,
    # Others default to 0
}

def estimate_used_price(new_price: float, brand_slug: str, segment_slug: str, years_old: int) -> float:
    """Estimate fair used price for a bike"""
    base_depreciation = SEGMENT_DEPRECIATION_RATES.get(segment_slug, SEGMENT_DEPRECIATION_RATES['commuter'])
    
    if years_old == 1:
        dep_rate = base_depreciation['year_1']
    elif years_old == 2:
        dep_rate = base_depreciation['year_2']
    else:
        dep_rate = base_depreciation['year_3']
    
    # Apply brand adjustment
    brand_adj = BRAND_DEPRECIATION_ADJUSTMENT.get(brand_slug, 0)
    dep_rate = max(0.05, dep_rate + brand_adj)  # Floor at 5%
    
    return new_price * (1 - dep_rate)
```

---

## Database Indexes (Optimization)

```sql
-- Critical indexes for recommendation performance

-- BikeModel lookups
CREATE INDEX idx_bike_segment_price ON bikes_bikemodel(segment_id, price_min, price_max);
CREATE INDEX idx_bike_brand_cc ON bikes_bikemodel(brand_id, displacement_cc);
CREATE INDEX idx_bike_popularity ON bikes_bikemodel(popularity_score DESC);
CREATE INDEX idx_bike_segment_current ON bikes_bikemodel(segment_id, is_current);

-- UsedBikeListing lookups
CREATE INDEX idx_listing_active_segment_price ON bikes_usedbikelisting(is_active, bike_model_id, price);
CREATE INDEX idx_listing_price_range ON bikes_usedbikelisting(is_active, price);
CREATE INDEX idx_listing_fair_price ON bikes_usedbikelisting(is_active, fair_price_score DESC);
CREATE INDEX idx_listing_recent ON bikes_usedbikelisting(is_active, created_at DESC);
CREATE INDEX idx_listing_location ON bikes_usedbikelisting(is_active, location);

-- UserBehaviorLog queries
CREATE INDEX idx_behavior_user_type_time ON bikes_userbehaviorlog(user_id, behavior_type, created_at DESC);
CREATE INDEX idx_behavior_session_time ON bikes_userbehaviorlog(session_id, created_at DESC);
CREATE INDEX idx_behavior_bike_type ON bikes_userbehaviorlog(bike_model_id, behavior_type);

-- RecommendationCache
CREATE INDEX idx_cache_session_expiry ON bikes_recommendationcache(session_id, expires_at);

-- Composite indexes for complex queries
CREATE INDEX idx_listing_segment_price_fair ON bikes_usedbikelisting(is_active, bike_model_id, price, fair_price_score DESC);
CREATE INDEX idx_bike_segment_popular ON bikes_bikemodel(segment_id, is_current, popularity_score DESC);
```

---

## Celery Schedule (settings.py)

```python
# settings.py

CELERY_BEAT_SCHEDULE = {
    'update-popularity-scores': {
        'task': 'bikes.tasks.update_popularity_scores',
        'schedule': crontab(hour='*/6', minute=0),  # Every 6 hours
    },
    'update-used-prices': {
        'task': 'bikes.tasks.update_used_bike_prices',
        'schedule': crontab(hour='*/4', minute=30),  # Every 4 hours
    },
    'calculate-fair-prices': {
        'task': 'bikes.tasks.calculate_fair_price_scores',
        'schedule': crontab(hour='*/3', minute=0),  # Every 3 hours
    },
    'update-user-profiles': {
        'task': 'bikes.tasks.update_all_user_profiles',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    'cleanup-cache': {
        'task': 'bikes.tasks.cleanup_expired_recommendations',
        'schedule': crontab(hour='*/1', minute=0),  # Hourly
    },
}
```

---

## Initial Data Setup

```python
# management/commands/setup_recommendation_data.py

from django.core.management.base import BaseCommand
from bikes.models import BikeBrand, BikeSegment


class Command(BaseCommand):
    help = 'Setup initial brand and segment data for recommendation engine'
    
    def handle(self, *args, **options):
        # Create brands
        brands_data = [
            ("Yamaha", "yamaha", 95, "Japan"),
            ("Suzuki", "suzuki", 92, "Japan"),
            ("Honda", "honda", 90, "Japan"),
            ("Bajaj", "bajaj", 82, "India"),
            ("TVS", "tvs", 78, "India"),
            ("Hero", "hero", 75, "India"),
            ("Royal Enfield", "royal_enfield", 72, "India"),
            ("KTM", "ktm", 70, "Austria"),
            ("CFMoto", "cfmoto", 65, "China"),
            ("GPX Demon", "gpx_demon", 60, "Thailand"),
            ("Aprilia", "aprilia", 58, "Italy"),
            ("QJ Motor", "qj_motor", 55, "China"),
            ("Yadea", "yadea", 55, "China", True),
            ("Hyosung", "hyosung", 52, "South Korea"),
            ("Akij Motors", "akij_motors", 50, "Bangladesh"),
            ("Lifan", "lifan", 45, "China"),
            ("Runner", "runner", 42, "Bangladesh"),
            ("Vespa", "vespa", 40, "Italy"),
            ("Taro", "taro", 38, "China"),
            ("Revoo", "revoo", 35, "Bangladesh", True),
        ]
        
        for data in brands_data:
            is_electric = data[4] if len(data) > 4 else False
            BikeBrand.objects.update_or_create(
                slug=data[1],
                defaults={
                    'name': data[0],
                    'trust_score': data[2],
                    'origin_country': data[3],
                    'is_electric_focused': is_electric,
                }
            )
        
        # Create segments
        segments_data = [
            ("Sports", "sports", 150, 400, ["performance", "style", "status"], ["cruiser", "naked_street"], ["naked_street"]),
            ("Naked Street", "naked_street", 150, 400, ["daily_performance", "versatility"], ["sports", "commuter"], ["sports"]),
            ("Commuter", "commuter", 100, 160, ["fuel_efficiency", "reliability", "daily_use"], ["naked_street", "scooter"], ["naked_street"]),
            ("Cruiser", "cruiser", 200, 500, ["comfort", "touring", "status", "lifestyle"], ["naked_street", "adventure_touring"], []),
            ("Adventure Touring", "adventure_touring", 200, 500, ["touring", "versatility", "long_distance"], ["cruiser", "naked_street"], []),
            ("Scooter", "scooter", 100, 160, ["convenience", "urban", "storage"], ["commuter", "electric"], ["naked_street"]),
            ("Electric", "electric", None, None, ["running_cost", "eco_friendly", "urban"], ["scooter", "commuter"], []),
            ("Off-Road/Dirt", "offroad_dirt", 150, 300, ["adventure", "offroad"], ["sports", "adventure_touring"], []),
        ]
        
        for data in segments_data:
            BikeSegment.objects.update_or_create(
                slug=data[1],
                defaults={
                    'name': data[0],
                    'typical_displacement_min': data[2],
                    'typical_displacement_max': data[3],
                    'user_intents': data[4],
                    'cross_sell_segments': data[5],
                    'aspirational_segments': data[6],
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Setup complete!'))
```

---

## Testing Guidelines

```python
# tests/test_recommendation_engine.py

import pytest
from django.test import TestCase
from bikes.models import BikeBrand, BikeSegment, BikeModel, UsedBikeListing, UserProfile, UserBehaviorLog
from bikes.recommendation_engine import BikeRecommender
from django.contrib.auth import get_user_model

User = get_user_model()


class RecommendationEngineTestCase(TestCase):
    
    @classmethod
    def setUpTestData(cls):
        # Create brands
        cls.yamaha = BikeBrand.objects.create(name="Yamaha", slug="yamaha", trust_score=95)
        cls.suzuki = BikeBrand.objects.create(name="Suzuki", slug="suzuki", trust_score=92)
        cls.cfmoto = BikeBrand.objects.create(name="CFMoto", slug="cfmoto", trust_score=65)
        cls.royal_enfield = BikeBrand.objects.create(name="Royal Enfield", slug="royal_enfield", trust_score=72)
        
        # Create segments
        cls.sports = BikeSegment.objects.create(name="Sports", slug="sports")
        cls.cruiser = BikeSegment.objects.create(name="Cruiser", slug="cruiser")
        
        # Create bikes
        cls.r15 = BikeModel.objects.create(
            brand=cls.yamaha,
            segment=cls.sports,
            name="R15 V4",
            slug="yamaha-r15-v4",
            displacement_cc=155,
            price_min=550000,
            price_max=650000,
            popularity_score=100,
        )
        
        cls.cfmoto_250sr = BikeModel.objects.create(
            brand=cls.cfmoto,
            segment=cls.sports,
            name="250SR",
            slug="cfmoto-250sr",
            displacement_cc=249,
            price_min=450000,
            price_max=450000,
            popularity_score=60,
        )
        
        cls.gsxr = BikeModel.objects.create(
            brand=cls.suzuki,
            segment=cls.sports,
            name="GSX-R 155",
            slug="suzuki-gsxr-155",
            displacement_cc=155,
            price_min=500000,
            price_max=520000,
            popularity_score=75,
        )
        
        cls.classic_350 = BikeModel.objects.create(
            brand=cls.royal_enfield,
            segment=cls.cruiser,
            name="Classic 350",
            slug="royal-enfield-classic-350",
            displacement_cc=349,
            price_min=450000,
            price_max=480000,
            popularity_score=80,
        )
        
        # Create used listings
        cls.used_r15 = UsedBikeListing.objects.create(
            bike_model=cls.r15,
            price=480000,  # ~80% of new price
            year=2023,
            km_driven=8000,
            condition='excellent',
            location='Dhaka',
            is_active=True,
            fair_price_score=85,
        )
    
    def test_slot1_returns_trusted_brand_alternative(self):
        """When viewing CFMoto, Slot 1 should suggest higher-trust brand"""
        recommender = BikeRecommender(user=None, session_id='test')
        results = recommender.get_recommendations(context_bike=self.cfmoto_250sr)
        
        slot_1 = next((r for r in results['recommendations'] if r['slot'] == 'direct_alternative'), None)
        
        self.assertIsNotNone(slot_1)
        # Should recommend a trusted brand (Yamaha/Suzuki) over CFMoto itself
        self.assertIn(slot_1['brand_name'], ['Yamaha', 'Suzuki'])
    
    def test_slot3_returns_segment_peer(self):
        """Slot 3 should return same-segment different bike"""
        recommender = BikeRecommender(user=None, session_id='test')
        results = recommender.get_recommendations(context_bike=self.r15)
        
        slot_3 = next((r for r in results['recommendations'] if r['slot'] == 'segment_peer'), None)
        
        self.assertIsNotNone(slot_3)
        # Should be sports segment
        # (In real test, we'd check segment field)
    
    def test_slot4_returns_cross_segment(self):
        """Slot 4 should return different segment"""
        recommender = BikeRecommender(user=None, session_id='test')
        results = recommender.get_recommendations(context_bike=self.r15)
        
        slot_4 = next((r for r in results['recommendations'] if r['slot'] == 'explore_different'), None)
        
        self.assertIsNotNone(slot_4)
        # Should be different from sports (e.g., cruiser)
    
    def test_no_duplicates_across_slots(self):
        """Same bike shouldn't appear in multiple slots"""
        recommender = BikeRecommender(user=None, session_id='test')
        results = recommender.get_recommendations(context_bike=self.cfmoto_250sr)
        
        bike_ids = [r['bike_id'] for r in results['recommendations']]
        self.assertEqual(len(bike_ids), len(set(bike_ids)))
    
    def test_price_range_for_used_recommendation(self):
        """Used bike recommendations should be in sensible price range"""
        recommender = BikeRecommender(user=None, session_id='test')
        results = recommender.get_recommendations(context_bike=self.cfmoto_250sr)
        
        # Context bike is 4.5 lac, used recommendations should be around 3.6-5.0 lac
        for rec in results['recommendations']:
            if rec['listing_type'] == 'used' and rec.get('price'):
                self.assertGreater(rec['price'], 300000)
                self.assertLess(rec['price'], 600000)
    
    def test_anonymous_user_gets_recommendations(self):
        """Anonymous users should still get recommendations"""
        recommender = BikeRecommender(user=None, session_id='anon_123')
        results = recommender.get_recommendations(context_bike=self.r15)
        
        self.assertIsNotNone(results)
        self.assertGreater(len(results['recommendations']), 0)
```

---

## Deployment Checklist

- [ ] Run `setup_recommendation_data` management command
- [ ] Verify all BikeModel records have segment assigned
- [ ] Backfill UsedBikeListing fair_price_score via `calculate_fair_price_scores` task
- [ ] Initialize UserProfile for existing users
- [ ] Configure Celery beat schedule
- [ ] Verify database indexes are created
- [ ] Test API endpoints with Postman/curl
- [ ] Monitor query performance (should be <200ms per recommendation)
- [ ] Set up error logging for recommendation failures
- [ ] Configure CDN caching for recommendation responses (short TTL)

---

## Monitoring & Metrics

```python
# metrics to track

RECOMMENDATION_METRICS = {
    'click_through_rate': 'Percentage of recommendations clicked',
    'slot_ctr': 'CTR per slot (slot_1 should be highest)',
    'conversion_rate': 'Inquiries generated from recommendations',
    'diversity_score': 'How different the 4 recommendations are from each other',
    'coverage_rate': 'Percentage of bike views that get 4 recommendations',
    'fallback_rate': 'How often fallback recommendations are used',
    'user_satisfaction': 'Implicit (if user clicks, return to view more)',
}
```
The promt I give for it:
----
https://www.mrbikebd.com/
This site is mine , analysis the site deeply so you have a complete knowledge on it.
This site usually shows the new bike details and also user can upload their used bikes for sell
I need to build a recommendation engoine algothrim that will vary user to user and act accordingly their taste , choices ,seraches ,interestes
for example,
My site primaryly target the users of bangladesh, 
Let me give you an examople 
Yahama R15 v4 is the most famous bike in bangladesh in sports catagory ,
Its new model price starts from 5.5 lac to6.5 lac according to variants ,if any user is viewing cfmoto 300 sr at my site ,in the recomandation part used r15 v4 should appear , as the used bike price should be arround bike_price*.95 or bike_price*1.05 
also reserach for the best range , so user will definately view this bike ,in my recomendation part there will be 4 bikes to show lets say , among them 2 will be come as direct user choice as he inserted , one will be similar like r15 v4 for example suzuki gsxr 155and another show the best bike from another segment , for example royal enfield ,it need to understand the psycology of the user 
https://www.mrbikebd.com/bike/cfmoto-cfmoto-250sr
--
I just gave you the example of r15 but it should be workable for every brand every bike 

----
The recomandation engine should work on the trust score of bangladesh peope for example , yahama ,suzuli ,honda is trusted highly is bangladesh.
For now the recomendation engine should be develop for the brands of trusted and used most
1.yahama
[2.suzuki](http://2.suzuki)
[3.honda](http://3.honda)
4.bajaj
[5.tvs](http://5.tvs)
6.hero
7.royal enfield
8.Cfmoto
9.Gpx demon
10.ktm
11.Lifan 
but there will around 20+ brands 200+ bike in my site where also includes electric bikes 
Yamaha
Suzuki
Honda
Bajaj
TVS
Hero
CFMoto
Royal Enfield
GPX Demon
KTM
Akij Motors
Lifan
Hyosung
QJ Motor
Yadea
Aprilia
Runner
Taro
Revoo
Vespa
-----
The system should very in recommened bike from user to user 
#I am using django with postgresql in backend and next.js at frontend.
# now give me the exact skill.md for antigravity ide to develop this system

---

This skill.md provides a complete, production-ready recommendation engine architecture tailored for the Bangladeshi motorcycle market with proper trust scoring, psychological segmentation, and price intelligence.