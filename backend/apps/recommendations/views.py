from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .engine import EmotionalRecommendationEngine

class SimilarBikesView(APIView):
    def get(self, request, slug):
        engine = EmotionalRecommendationEngine()
        recommendations = engine.get_similar_bikes(slug)
        return Response(recommendations, status=status.HTTP_200_OK)

class UsedBikesNearBudgetView(APIView):
    def get(self, request):
        budget_str = request.query_params.get('budget')
        if not budget_str:
            return Response({"error": "Budget is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            budget = float(budget_str)
        except (ValueError, TypeError):
            return Response({"error": "Budget must be a numeric value"}, status=status.HTTP_400_BAD_REQUEST)

        engine = EmotionalRecommendationEngine()
        recommendations = engine.get_used_bikes_near_budget(budget)
        return Response(recommendations, status=status.HTTP_200_OK)
