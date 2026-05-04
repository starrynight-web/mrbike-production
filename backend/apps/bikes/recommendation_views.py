from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import BikeModel
from .serializers import SimilarBikeSerializer

from apps.core.authentication import LenientJWTAuthentication

class SimilarBikesView(APIView):
    authentication_classes = [LenientJWTAuthentication]
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            bike = BikeModel.objects.select_related('brand').get(slug=slug)
            
            # Logic for similar bikes:
            # 1. Same category
            # 2. Price range +/- 30% (widened slightly for better coverage)
            # 3. Exclude the current bike
            
            price = float(bike.price) if bike.price else 0
            min_price = price * 0.70
            max_price = price * 1.30
            
            # Base query: same category, similar price, select_related brand for performance
            queryset = BikeModel.objects.filter(category=bike.category).select_related('brand').exclude(id=bike.id)
            
            similar_bikes = queryset.filter(
                price__gte=min_price,
                price__lte=max_price
            ).order_by('-popularity_score')[:4]
            
            # If not enough similar bikes in price range, broaden to any bike in category
            if similar_bikes.count() < 2:
                similar_bikes = queryset.order_by('-popularity_score')[:4]
            
            serializer = SimilarBikeSerializer(similar_bikes, many=True)
            return Response(serializer.data)
            
        except BikeModel.DoesNotExist:
            return Response({"error": "Bike not found"}, status=status.HTTP_404_NOT_FOUND)

class BudgetRecommendationsView(APIView):
    authentication_classes = [LenientJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        budget = request.query_params.get('budget')
        if not budget:
            return Response({"error": "Budget parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            budget = float(budget)
            # Find bikes around this budget
            min_budget = budget * 0.8
            max_budget = budget * 1.2
            
            recommended_bikes = BikeModel.objects.filter(
                price__gte=min_budget,
                price__lte=max_budget
            ).select_related('brand').order_by('-popularity_score')[:4]
            
            serializer = SimilarBikeSerializer(recommended_bikes, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid budget value"}, status=status.HTTP_400_BAD_REQUEST)
