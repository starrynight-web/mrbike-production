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
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                # Silently fail on Redis errors, fallback to DB
                self.redis_client = None  # Disable for this instance lifetime
        
        try:
            base_bike = BikeModel.objects.select_related('brand').get(slug=bike_slug)
        except BikeModel.DoesNotExist:
            return []

        # Rule 1: Same category, pre-fetch relationship
        candidates = BikeModel.objects.filter(
            category=base_bike.category
        ).select_related('brand').exclude(id=base_bike.id)
        
        scored_candidates = []
        for bike in candidates:
            score = 0
            reasons = []

            # Price proximity (30%)
            try:
                base_price = float(base_bike.price)
                bike_price = float(bike.price)
                if base_price > 0:
                    price_diff = abs(bike_price - base_price) / base_price
                    if price_diff <= 0.20:
                        score += 30 * (1 - price_diff)
                        if bike_price < base_price:
                            reasons.append("More affordable")
            except (ValueError, TypeError):
                pass
            
            # Engine CC similarity (20%)
            if base_bike.engine_capacity > 0:
                cc_diff = abs(bike.engine_capacity - base_bike.engine_capacity) / base_bike.engine_capacity
                if cc_diff <= 0.25:
                    score += 20 * (1 - cc_diff)
            
            # Brand Trust Factor (25%) - Case insensitive
            brand_scores = {
                'honda': 25, 'yamaha': 24, 'suzuki': 23, 
                'bajaj': 20, 'tvs': 19, 'hero': 18,
                'royal enfield': 15, 'ktm': 12
            }
            brand_name_lower = bike.brand.name.lower()
            brand_score = brand_scores.get(brand_name_lower, 10)
            
            if getattr(bike.brand, 'is_popular', False):
                brand_score += 5
            score += min(brand_score, 25)
            
            # Resale Value & Popularity (15%)
            if bike.popularity_score > base_bike.popularity_score:
                score += 15
                reasons.append("Highly popular model")
            elif bike.popularity_score > 50:
                score += 10
            
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
                'primary_image': b.primary_image.url if b.primary_image else None,
                'brand_name': b.brand.name,
                'reasons': pick['emotional_reasons']
            })

        if self.redis_client:
            try:
                self.redis_client.setex(cache_key, 3600, json.dumps(result))
            except Exception:
                pass
                
        return result

    def get_used_bikes_near_budget(self, budget, limit=4):
        """
        Suggest used bikes within a budget range (±15%) 
        for users looking at new bikes.
        """
        from apps.marketplace.models import UsedBikeListing
        
        cache_key = f"recommendations:used:budget:{budget}"
        if self.redis_client:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                self.redis_client = None

        # Range: 80% to 120% of budget for broader matches
        min_price = float(budget) * 0.80
        max_price = float(budget) * 1.20

        candidates = UsedBikeListing.objects.filter(
            status='active',
            price__gte=min_price,
            price__lte=max_price
        ).prefetch_related('images')

        scored_candidates = []
        for listing in candidates:
            score = 0
            # Priority to verified sellers (40%)
            if getattr(listing, 'is_verified', False):
                score += 40
            
            # Priority to lower mileage (30%)
            mileage = getattr(listing, 'mileage', 0) or 0
            if mileage < 10000:
                score += 30
            elif mileage < 25000:
                score += 15
            
            # Recency bonus (10%)
            if listing.is_featured:
                score += 10
                
            scored_candidates.append({
                'listing': listing,
                'score': score
            })

        scored_candidates.sort(key=lambda x: x['score'], reverse=True)
        top_picks = scored_candidates[:limit]

        result = []
        for pick in top_picks:
            listing = pick['listing']
            # Get primary image from prefetched images
            primary_img = next((img for img in listing.images.all() if img.is_primary), None)
            if not primary_img:
                primary_img = listing.images.all()[0] if listing.images.exists() else None

            img_url = None
            if primary_img:
                img_url = primary_img.get_best_url

            # Build bike name defensively
            model_name = listing.custom_model or ''
            brand_name = listing.custom_brand or 'Unknown'
            
            if listing.bike_model_id:
                try:
                    from apps.bikes.models import BikeModel
                    bike = BikeModel.objects.select_related('brand').get(pk=listing.bike_model_id)
                    model_name = bike.name
                    if bike.brand:
                        brand_name = bike.brand.name
                except Exception:
                    pass
                    
            bike_name = f"{brand_name} {model_name}".strip()

            # Score boost for same model/brand if we have base_bike context (optional improvement)
            # For now, just fix the primary bug reported.

            result.append({
                'id': str(listing.id),
                'title': listing.title,
                'price': float(listing.price or 0),
                'image': img_url,
                'location': listing.location,
                'year': getattr(listing, 'manufacturing_year', None),
                'mileage': getattr(listing, 'mileage', None),
                'bike_name': bike_name
            })

        if self.redis_client:
            try:
                self.redis_client.setex(cache_key, 1800, json.dumps(result))
            except Exception:
                pass

        return result
