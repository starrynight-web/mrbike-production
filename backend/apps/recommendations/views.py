from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .engine import BikeRecommender
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.bikes.serializers import SimilarBikeSerializer # Reuse the lightweight serializer
from .models import UserProfile, UserBehaviorLog

from apps.core.authentication import LenientJWTAuthentication

class RecommendationView(APIView):
    authentication_classes = [LenientJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        slug = kwargs.get('slug')
        listing_id = kwargs.get('listing_id')
        
        recommender = BikeRecommender(
            user=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key or "anon"
        )
        
        context_bike = None
        context_listing = None
        
        if slug:
            try:
                context_bike = BikeModel.objects.get(slug=slug)
            except BikeModel.DoesNotExist:
                return Response({"error": "Bike not found"}, status=status.HTTP_404_NOT_FOUND)
        elif listing_id:
            try:
                context_listing = UsedBikeListing.objects.get(id=listing_id)
            except UsedBikeListing.DoesNotExist:
                return Response({"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND)
        
        results = recommender.get_recommendations(
            context_bike=context_bike,
            context_listing=context_listing
        )
        
        # Serialize the slots
        serialized_results = {}
        for slot, bike in results.items():
            if bike:
                serialized_results[slot] = SimilarBikeSerializer(bike).data
            else:
                serialized_results[slot] = None
                
        return Response(serialized_results)

class BehaviorLogView(APIView):
    authentication_classes = [LenientJWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        behavior_type = request.data.get('behavior_type')
        slug = request.data.get('slug')
        listing_id = request.data.get('listing_id')
        metadata = request.data.get('metadata', {})
        
        if not behavior_type:
            return Response({"error": "behavior_type is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        bike_model = None
        if slug:
            bike_model = BikeModel.objects.filter(slug=slug).first()
            
        used_listing = None
        if listing_id:
            used_listing = UsedBikeListing.objects.filter(id=listing_id).first()
            
        UserBehaviorLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key or "anon",
            behavior_type=behavior_type,
            bike_model=bike_model,
            used_listing=used_listing,
            metadata=metadata
        )
        
        return Response({"status": "success"}, status=status.HTTP_201_CREATED)
