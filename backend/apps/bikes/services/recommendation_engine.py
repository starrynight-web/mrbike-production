from django.db.models import Q, F, Count
from apps.marketplace.models import UsedBikeListing
from apps.bikes.models import MarketCompetitorMapping, BikeModel
from apps.interactions.models import UserViewHistory
import logging

logger = logging.getLogger(__name__)

def get_emotional_recommendations(current_bike, user=None, limit=4):
    """
    Main entry point for the recommendation engine.
    Fetches used bike listings that act as "emotional triggers".
    """
    # 1. Calculate Price Brackets (0.9 to 1.1)
    base_price = float(current_bike.price)
    min_price = base_price * 0.90
    max_price = base_price * 1.10

    # 2. Identify Candidate Models (Aspirational & Competitors)
    # Start with hardcoded aspirational competitors for this specific bike
    competitor_mappings = MarketCompetitorMapping.objects.filter(
        source_bike=current_bike
    ).select_related('competitor_bike')
    
    candidate_model_ids = [m.competitor_bike.id for m in competitor_mappings]
    
    # Also include high-popularity bikes from the same category as a secondary pool
    high_pop_bikes = BikeModel.objects.filter(
        category=current_bike.category,
        is_available=True
    ).order_by('-popularity_score')[:10]
    
    candidate_model_ids.extend([b.id for b in high_pop_bikes])
    candidate_model_ids = list(set(candidate_model_ids)) # De-duplicate

    # 3. Personalization (User Taste)
    user_preferences = {}
    if user and user.is_authenticated:
        # Get user's most viewed categories
        view_history = UserViewHistory.objects.filter(user=user).select_related('bike_model')
        for history in view_history:
            cat = history.bike_model.category
            user_preferences[cat] = user_preferences.get(cat, 0) + history.view_count

    # 4. Fetch Active Used Listings within Price Window
    listings = UsedBikeListing.objects.filter(
        status='active',
        price__gte=min_price,
        price__lte=max_price,
        bike_model_id__in=candidate_model_ids
    ).select_related('bike_model', 'bike_model__brand')

    # 5. Scoring Logic
    scored_listings = []
    for listing in listings:
        score = 0
        
        # Price Proximity (closer to target is better)
        price_diff_ratio = abs(listing.price - base_price) / base_price
        score += (1.0 - price_diff_ratio) * 30 # Up to 30 points

        # Aspirational Weighting (prioritize Yamaha, Honda, Suzuki etc.)
        aspirational_brands = ['Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'KTM']
        if listing.bike_model.brand.name in aspirational_brands:
            score += 40 # 40 points base for premium brands

        # User Personalization
        if listing.bike_model.category in user_preferences:
            # Scale based on how much they like this category
            pref_weight = min(user_preferences[listing.bike_model.category] * 5, 30)
            score += pref_weight

        # Global Popularity fallback
        score += (listing.bike_model.popularity_score / 1000) * 10
        
        scored_listings.append((listing, score))

    # Sort by score and take top hits
    scored_listings.sort(key=lambda x: x[1], reverse=True)
    
    return [item[0] for item in scored_listings[:limit]]
