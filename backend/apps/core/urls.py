from django.urls import path
from .views import AdminStatsView, AdminFilterOptionsView, AdminAnalyticsView

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('filter-options/', AdminFilterOptionsView.as_view(), name='admin-filters'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
