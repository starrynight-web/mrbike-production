from django.urls import path
from .recommendation_views import SimilarBikesView, BudgetRecommendationsView

urlpatterns = [
    path('similar/<slug:slug>/', SimilarBikesView.as_view(), name='similar-bikes'),
    path('budget/', BudgetRecommendationsView.as_view(), name='budget-recommendations'),
]
