from apps.marketplace.models import UsedBikeListing
from apps.interactions.models import Wishlist, Review
from apps.marketplace.serializers import UsedBikeListingSerializer
from apps.bikes.serializers import BikeModelSerializer
from apps.interactions.serializers import ReviewSerializer

def get_full_profile_data(user):
    # Stats
    listings_count = UsedBikeListing.objects.filter(seller=user).count()
    wishlist = Wishlist.objects.filter(user=user).first()
    wishlist_count = wishlist.bikes.count() if wishlist else 0
    reviews_count = Review.objects.filter(user=user).count()
    
    stats = {
        "listings_count": listings_count,
        "wishlist_count": wishlist_count,
        "reviews_count": reviews_count,
        "member_since": user.date_joined.strftime("%b %Y")
    }

    # Active Listings
    listings = UsedBikeListing.objects.filter(seller=user).order_by('-created_at')[:5]
    listings_data = UsedBikeListingSerializer(listings, many=True).data

    # Wishlist Items
    wishlist_bikes = wishlist.bikes.all()[:5] if wishlist else []
    wishlist_data = BikeModelSerializer(wishlist_bikes, many=True).data

    # Reviews
    reviews = Review.objects.filter(user=user).select_related('bike_model').order_by('-created_at')[:5]
    reviews_data = ReviewSerializer(reviews, many=True).data

    return {
        "stats": stats,
        "listings": listings_data,
        "wishlist": wishlist_data,
        "reviews": reviews_data
    }
