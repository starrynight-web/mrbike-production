from django.urls import path
from . import views

urlpatterns = [
    path('bikes/<int:bike_id>/reviews/', views.BikeReviewListView.as_view(), name='bike-reviews'),
    path('wishlist/', views.UserWishlistView.as_view(), name='user-wishlist'),
    path('wishlist/toggle/<int:bike_id>/', views.WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('me/reviews/', views.UserReviewListView.as_view(), name='user-reviews'),
    path('inquiries/', views.InquiryCreateView.as_view(), name='inquiry-create'),
]
