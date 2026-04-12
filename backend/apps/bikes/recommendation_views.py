from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import BikeModel
from .serializers import BikeModelSerializer

class SimilarBikesView(APIView):
    def get(self, request, slug):
        try:
            bike = BikeModel.objects.get(slug=slug)
            
            # Logic for similar bikes:
            # 1. Same category
            # 2. Price range +/- 25%
            # 3. Exclude the current bike
            
            price = bike.price
            min_price = price * 0.75
            max_price = price * 1.25
            
            similar_bikes = BikeModel.objects.filter(
                category=bike.category,
                price__gte=min_price,
                price__lte=max_price
            ).exclude(brand=bike.brand).order_by('-popularity_score')[:4]
            
            # If not enough similar bikes, broaden search to same category regardless of price
            if similar_bikes.count() < 2:
                similar_bikes = BikeModel.objects.filter(
                    category=bike.category
                ).exclude(brand=bike.brand).order_by('-popularity_score')[:4]
            
            serializer = BikeModelSerializer(similar_bikes, many=True)
            return Response(serializer.data)
            
        except BikeModel.DoesNotExist:
            return Response({"error": "Bike not found"}, status=status.HTTP_404_NOT_FOUND)

class BudgetRecommendationsView(APIView):
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
            ).order_by('-popularity_score')[:4]
            
            serializer = BikeModelSerializer(recommended_bikes, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid budget value"}, status=status.HTTP_400_BAD_REQUEST)
