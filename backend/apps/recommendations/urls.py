from django.urls import path
from .views import RecommendationView, BehaviorLogView

urlpatterns = [
    path('bike/<slug:slug>/', RecommendationView.as_view(), name='recommendation-bike'),
    path('listing/<uuid:listing_id>/', RecommendationView.as_view(), name='recommendation-listing'),
    path('track/', BehaviorLogView.as_view(), name='track-behavior'),
]
