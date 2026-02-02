from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .engine import EmotionalRecommendationEngine

class SimilarBikesView(APIView):
    def get(self, request, slug):
        engine = EmotionalRecommendationEngine()
        recommendations = engine.get_similar_bikes(slug)
        return Response(recommendations, status=status.HTTP_200_OK)
