import math
from datetime import timedelta
from django.db.models import Q, F, FloatField, Value, Sum, Avg
from django.db.models.functions import Coalesce
from django.utils import timezone
from collections import defaultdict
from .models import UserProfile, UserBehaviorLog, RecommendationCache
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing

BRAND_TRUST_SCORES = {
    "yamaha": 95, "suzuki": 92, "honda": 90, "bajaj": 82, "tvs": 78,
    "hero": 75, "royal_enfield": 72, "ktm": 70, "cfmoto": 65, "gpx_demon": 60,
    "aprilia": 58, "qj_motor": 55, "hyosung": 52, "akij_motors": 50,
    "lifan": 45, "runner": 42, "vespa": 40, "taro": 38, "revoo": 35,
    "yadea": 55,
}

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
        'aspirational': (0.60, 1.50),
    }
    
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
    
    ASPIRATIONAL_MAP = {
        'commuter': 'naked_street',
        'naked_street': 'sports',
        'scooter': 'naked_street',
        'sports': 'cruiser',
    }
    
    def __init__(self, user=None, session_id=None):
        self.user = user
        self.session_id = session_id
        self.user_profile = self._get_user_profile()
        self.behavior_history = self._get_behavior_history()
        self.price_sensitivity = self._calculate_price_sensitivity()
        
    def _get_user_profile(self):
        if not self.user or not self.user.is_authenticated:
            return None
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        return profile
    
    def _get_behavior_history(self, days=30):
        cutoff = timezone.now() - timedelta(days=days)
        query = UserBehaviorLog.objects.filter(created_at__gte=cutoff)
        
        if self.user and self.user.is_authenticated:
            query = query.filter(user=self.user)
        elif self.session_id:
            query = query.filter(session_id=self.session_id)
        else:
            return []
        
        return list(query.select_related('bike_model', 'used_listing'))
    
    def _calculate_price_sensitivity(self):
        if not self.behavior_history:
            return 0.5
        
        prices = []
        for log in self.behavior_history:
            if log.used_listing:
                prices.append(float(log.used_listing.price))
            elif log.bike_model and log.bike_model.price:
                prices.append(float(log.bike_model.price))
        
        if len(prices) < 2:
            return 0.5
            
        price_range = max(prices) - min(prices)
        avg_price = sum(prices) / len(prices)
        return min(1.0, max(0.1, price_range / avg_price)) if avg_price > 0 else 0.5

    def get_recommendations(self, context_bike=None, context_listing=None):
        if context_listing:
            context_price = float(context_listing.price)
            context_model = context_listing.bike_model
        elif context_bike:
            context_price = float(context_bike.price) if context_bike.price else 0
            context_model = context_bike
        else:
            return {}

        context_segment = context_model.category or context_model.segment
        
        p_range = self.PRICE_RANGES['standard']
        if self.price_sensitivity < 0.3: p_range = self.PRICE_RANGES['tight']
        elif self.price_sensitivity > 0.7: p_range = self.PRICE_RANGES['flexible']

        recommendations = {
            'slot_1': self._get_slot_1(context_model, context_segment, context_price, p_range),
            'slot_2': self._get_slot_2(context_model, context_segment, context_price, p_range),
            'slot_3': self._get_slot_3(context_model, context_segment, context_price, p_range),
            'slot_4': self._get_slot_4(context_model, context_segment, context_price),
        }
        
        return recommendations

    def _get_slot_1(self, model, segment, price, p_range):
        """Direct Alternative"""
        candidates = BikeModel.objects.filter(
            category=segment,
            price__gte=price * p_range[0],
            price__lte=price * p_range[1]
        ).exclude(id=model.id).select_related('brand').order_by('-popularity_score')[:5]
        return candidates[0] if candidates else None

    def _get_slot_2(self, model, segment, price, p_range):
        """Value Alternative"""
        candidates = UsedBikeListing.objects.filter(
            status='active',
            bike_model__category=segment,
            price__gte=price * 0.7,
            price__lte=price * 0.95
        ).exclude(bike_model=model).select_related('bike_model', 'bike_model__brand').order_by('-views_count')[:5]
        return candidates[0].bike_model if candidates else None

    def _get_slot_3(self, model, segment, price, p_range):
        """Segment Peer"""
        candidates = BikeModel.objects.filter(
            category=segment
        ).exclude(brand=model.brand).select_related('brand').order_by('-popularity_score')[:5]
        return candidates[0] if candidates else None

    def _get_slot_4(self, model, segment, price):
        """Cross-Segment Hook"""
        target_segments = self.CROSS_SEGMENT_MAP.get(segment, [])
        candidates = BikeModel.objects.filter(
            category__in=target_segments,
            price__gte=price * 0.8,
            price__lte=price * 1.3
        ).select_related('brand').order_by('-popularity_score')[:5]
        return candidates[0] if candidates else None
