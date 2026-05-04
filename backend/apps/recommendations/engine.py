import math
from datetime import timedelta
from django.db.models import Q, F, Avg
from django.utils import timezone
from .models import UserProfile, UserBehaviorLog, RecommendationCache
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing

class BikeRecommender:
    """
    4-Slot Recommendation System for MrBikeBD
    
    Slot 1: Direct Alternative (Same segment, similar price, higher trust brand)
    Slot 2: Value Alternative (Same segment, better price proposition)
    Slot 3: Segment Peer (Same segment, different displacement/style)
    Slot 4: Cross-Segment Hook (Different segment, psychological exploration)
    """
    
    PRICE_RANGES = {
        'tight': (0.90, 1.10),
        'standard': (0.85, 1.20),
        'flexible': (0.75, 1.35),
    }
    
    CROSS_SEGMENT_MAP = {
        'sports': ['cruiser', 'naked', 'adventure'],
        'naked': ['sports', 'commuter', 'cruiser'],
        'commuter': ['naked', 'scooter'],
        'cruiser': ['naked', 'adventure', 'sports'],
        'adventure': ['cruiser', 'naked', 'sports'],
        'scooter': ['commuter'],
        'electric': ['scooter', 'commuter'],
        'offroad': ['sports', 'adventure'],
    }
    
    ASPIRATIONAL_MAP = {
        'commuter': 'naked',
        'naked': 'sports',
        'scooter': 'naked',
        'sports': 'cruiser',
    }

    def __init__(self, user=None, session_id=None):
        self.user = user
        self.session_id = session_id
        self.profile = self._get_profile()
        self.price_sensitivity = self._calculate_price_sensitivity()

    def _get_profile(self):
        if not self.user:
            return None
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        return profile

    def _calculate_price_sensitivity(self):
        if self.profile and self.profile.price_sensitivity:
            return self.profile.price_sensitivity
        return 0.5

    def get_recommendations(self, context_bike=None, context_listing=None):
        if not context_bike and not context_listing:
            return []

        # Determine context
        if context_listing:
            target_price = float(context_listing.price)
            model = context_listing.bike_model
        else:
            target_price = float(context_bike.price)
            model = context_bike

        segment = model.segment or model.category
        
        # Determine price range based on sensitivity
        if self.price_sensitivity < 0.3:
            p_range = self.PRICE_RANGES['tight']
        elif self.price_sensitivity < 0.6:
            p_range = self.PRICE_RANGES['standard']
        else:
            p_range = self.PRICE_RANGES['flexible']

        recommendations = {}

        # Slot 1: Direct Alternative
        recommendations['slot_1'] = self._get_slot_1(model, segment, target_price, p_range)
        
        # Slot 2: Value Alternative
        recommendations['slot_2'] = self._get_slot_2(model, segment, target_price, p_range)
        
        # Slot 3: Segment Peer
        recommendations['slot_3'] = self._get_slot_3(model, segment, target_price, p_range)
        
        # Slot 4: Cross-Segment Hook
        recommendations['slot_4'] = self._get_slot_4(model, segment, target_price)

        return recommendations

    def _get_slot_1(self, context_model, segment, price, p_range):
        """Direct Alternative: Same segment, similar price, higher trust brand preferred."""
        candidates = BikeModel.objects.filter(
            Q(segment=segment) | Q(category=segment),
            price__gte=price * p_range[0],
            price__lte=price * p_range[1],
            is_available=True
        ).exclude(id=context_model.id).select_related('brand').order_by('-brand__trust_score', '-popularity_score')[:5]
        
        return candidates[0] if candidates else None

    def _get_slot_2(self, context_model, segment, price, p_range):
        """Value Alternative: Same segment, lower price but similar performance/popularity."""
        candidates = BikeModel.objects.filter(
            Q(segment=segment) | Q(category=segment),
            price__gte=price * 0.7,
            price__lt=price * 0.95,
            is_available=True
        ).exclude(id=context_model.id).select_related('brand').order_by('-popularity_score')[:5]
        
        return candidates[0] if candidates else None

    def _get_slot_3(self, context_model, segment, price, p_range):
        """Segment Peer: Same segment, slightly higher price (aspirational) or different displacement."""
        candidates = BikeModel.objects.filter(
            Q(segment=segment) | Q(category=segment),
            price__gt=price,
            price__lte=price * 1.3,
            is_available=True
        ).exclude(id=context_model.id).select_related('brand').order_by('-popularity_score')[:5]
        
        return candidates[0] if candidates else None

    def _get_slot_4(self, context_model, segment, price):
        """Cross-Segment Hook: Different but related segment."""
        related_segments = self.CROSS_SEGMENT_MAP.get(segment, [])
        if not related_segments:
            return None
            
        candidates = BikeModel.objects.filter(
            category__in=related_segments,
            price__gte=price * 0.8,
            price__lte=price * 1.2,
            is_available=True
        ).select_related('brand').order_by('-popularity_score')[:5]
        
        return candidates[0] if candidates else None
