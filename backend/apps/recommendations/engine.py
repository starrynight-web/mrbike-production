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
            
            # Brand Trust Factor (25%)
            brand_scores = {
                'Honda': 25, 'Yamaha': 24, 'Suzuki': 23, 
                'Bajaj': 20, 'TVS': 19, 'Hero': 18,
                'Royal Enfield': 15, 'KTM': 12
            }
            brand_score = brand_scores.get(bike.brand.name, 10)
            if getattr(bike.brand, 'is_popular', False):
                brand_score += 5
            score += min(brand_score, 25)
            
            # Resale Value & Popularity (15%)
            if bike.popularity_score > base_bike.popularity_score:
                score += 15
                reasons.append("Highly popular model")
            elif bike.popularity_score > 50:
                score += 10
            
            # Category Matching (Mandatory in filter, but adding bonus for specific match)
            if bike.category == base_bike.category:
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

    def get_used_bikes_near_budget(self, budget, limit=4):
        """
        Suggest used bikes within a budget range (±15%) 
        for users looking at new bikes.
        """
        from apps.marketplace.models import UsedBikeListing
        
        cache_key = f"recommendations:used:budget:{budget}"
        if self.redis_client:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

        # Range: 85% to 115% of budget
        min_price = float(budget) * 0.85
        max_price = float(budget) * 1.15

        candidates = UsedBikeListing.objects.filter(
            status='active',
            price__gte=min_price,
            price__lte=max_price
        ).select_related('bike_model', 'bike_model__brand')

        scored_candidates = []
        for listing in candidates:
            score = 0
            # Priority to verified sellers (40%)
            if getattr(listing, 'is_verified', False):
                score += 40
            
            # Priority to lower mileage (30%)
            mileage = getattr(listing, 'mileage', 0)
            if mileage < 15000:
                score += 30
            elif mileage < 30000:
                score += 15
                
            scored_candidates.append({
                'listing': listing,
                'score': score
            })

        scored_candidates.sort(key=lambda x: x['score'], reverse=True)
        top_picks = scored_candidates[:limit]

        result = []
        for pick in top_picks:
            listing = pick['listing']
            # Get primary image safely
            primary_img = None
            try:
                primary_img = listing.images.filter(is_primary=True).first()
            except Exception:
                primary_img = None

            img_url = None
            if primary_img:
                if getattr(primary_img, 'webp_image', None) and getattr(primary_img.webp_image, 'url', None):
                    img_url = primary_img.webp_image.url
                elif getattr(primary_img, 'original_image', None) and getattr(primary_img.original_image, 'url', None):
                    img_url = primary_img.original_image.url

            # Build bike name defensively
            bike_model = getattr(listing, 'bike_model', None)
            model_name = getattr(bike_model, 'name', '') if bike_model else ''
            brand_obj = getattr(bike_model, 'brand', None) if bike_model else None
            brand_name = getattr(brand_obj, 'name', '') if brand_obj else ''
            bike_name = f"{brand_name} {model_name}".strip() or "Unknown"

            result.append({
                'id': str(getattr(listing, 'id', '')),
                'title': getattr(listing, 'title', ''),
                'price': float(getattr(listing, 'price', 0) or 0),
                'image': img_url,
                'location': getattr(listing, 'location', ''),
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
