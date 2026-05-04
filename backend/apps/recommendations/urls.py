from django.urls import path
from .views import RecommendationView, BehaviorLogView

urlpatterns = [
    path('v2/bike/<slug:slug>/', RecommendationView.as_view(), name='recommendation-bike-v2'),
    path('v2/listing/<uuid:listing_id>/', RecommendationView.as_view(), name='recommendation-listing-v2'),
    path('v2/track/', BehaviorLogView.as_view(), name='track-behavior-v2'),
    # Keep legacy for backward compatibility
    path('bike/<slug:slug>/', RecommendationView.as_view(), name='recommendation-bike'),
    path('track/', BehaviorLogView.as_view(), name='track-behavior'),
]
