from rest_framework import generics, permissions, status
from django.db import transaction
from apps.core.responses import StandardResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Review, Wishlist, Inquiry
from .serializers import ReviewSerializer, WishlistSerializer, InquirySerializer
from apps.bikes.models import BikeModel
from apps.core.throttles import InquiryThrottle

class InquiryCreateView(generics.CreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [InquiryThrottle]

class BikeReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(bike_id=self.kwargs['bike_id'])
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        bike = get_object_or_404(BikeModel, pk=self.kwargs['bike_id'])
        with transaction.atomic():
            # update_or_create is atomic and prevents duplicate reviews
            review, created = Review.objects.update_or_create(
                user=self.request.user, 
                bike=bike,
                defaults=serializer.validated_data
            )
            # Re-assign to instance for serializer representation
            serializer.instance = review

class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, bike_id):
        bike = get_object_or_404(BikeModel, pk=bike_id)
        
        with transaction.atomic():
            wishlist, created = Wishlist.objects.select_for_update().get_or_create(user=request.user)
            
            if wishlist.bikes.filter(id=bike_id).exists():
                wishlist.bikes.remove(bike)
                status_msg = "removed"
            else:
                wishlist.bikes.add(bike)
                status_msg = "added"
            
        return StandardResponse.success(
            data={"status": status_msg},
            message=f"Bike successfully {status_msg} your wishlist."
        )

class UserWishlistView(generics.RetrieveAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

class UserReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to handle individual review actions (retrieve, update, delete)"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see/edit/delete their own reviews via this detail view for security
        # Note: BikeReviewListView handles public viewing of approved reviews
        if self.request.user.is_authenticated:
            return Review.objects.filter(user=self.request.user)
        return Review.objects.none()
