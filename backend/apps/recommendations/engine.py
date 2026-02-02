import redis
import json
from django.conf import settings
from apps.bikes.models import BikeModel
from django.db.models import Q

class EmotionalRecommendationEngine:
    def __init__(self):
        # Redis is optional for now, fallback to DB
        try:
            self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception:
            self.redis_client = None
    
    def get_similar_bikes(self, bike_slug, limit=4):
        """
        Bangladesh-specific Rule-Based Recommendations
        """
        cache_key = f"recommendations:similar:{bike_slug}"
        if self.redis_client:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        
        try:
            base_bike = BikeModel.objects.get(slug=bike_slug)
        except BikeModel.DoesNotExist:
            return []

        # Rule 1: Same category
        candidates = BikeModel.objects.filter(category=base_bike.category).exclude(id=base_bike.id)
        
        scored_candidates = []
        for bike in candidates:
            score = 0
            reasons = []

            # Price proximity (30%)
            price_diff = abs(float(bike.price) - float(base_bike.price)) / float(base_bike.price)
            if price_diff <= 0.15:
                score += 30 * (1 - price_diff)
                if bike.price < base_bike.price:
                    reasons.append("More affordable")
            
            # Engine CC similarity (20%)
            cc_diff = abs(bike.engine_capacity - base_bike.engine_capacity) / base_bike.engine_capacity
            if cc_diff <= 0.20:
                score += 20 * (1 - cc_diff)
            
            # Brand Trust Factor (20%)
            brand_scores = {
                'Honda': 20, 'Yamaha': 19, 'Suzuki': 18, 
                'Bajaj': 15, 'TVS': 14, 'Hero': 13
            }
            brand_score = brand_scores.get(bike.brand.name, 10)
            score += brand_score
            
            # Resale Value Priority (high in BD)
            # For now using popularity_score as proxy or custom logic
            if bike.popularity_score > base_bike.popularity_score:
                score += 15
                reasons.append("Better resale value")
            
            if not reasons:
                reasons.append("Trusted alternative")

            scored_candidates.append({
                'bike': bike,
                'score': score,
                'emotional_reasons': reasons[:2]
            })

        # Sort by score
        scored_candidates.sort(key=lambda x: x['score'], reverse=True)
        top_picks = scored_candidates[:limit]
        
        # Prepare response
        result = []
        for pick in top_picks:
            b = pick['bike']
            result.append({
                'id': b.id,
                'name': b.name,
                'slug': b.slug,
                'price': float(b.price),
                'primary_image': b.primary_image,
                'brand_name': b.brand.name,
                'reasons': pick['emotional_reasons']
            })

        if self.redis_client:
            try:
                self.redis_client.setex(cache_key, 3600, json.dumps(result))
            except Exception:
                pass
                
        return result
