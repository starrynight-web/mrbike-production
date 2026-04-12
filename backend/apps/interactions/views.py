from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Review, Wishlist, Inquiry
from .serializers import ReviewSerializer, WishlistSerializer, InquirySerializer
from apps.bikes.models import BikeModel

class InquiryCreateView(generics.CreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [permissions.AllowAny]

class BikeReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        identifier = self.kwargs['bike_id']
        if str(identifier).isdigit():
            return Review.objects.filter(Q(bike_id=identifier) | Q(bike__slug=identifier))
        return Review.objects.filter(bike__slug=identifier)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        identifier = self.kwargs['bike_id']
        if str(identifier).isdigit():
            bike = get_object_or_404(BikeModel, Q(pk=identifier) | Q(slug=identifier))
        else:
            bike = get_object_or_404(BikeModel, slug=identifier)
        # If user already reviewed this bike, update the existing review
        existing_review = Review.objects.filter(user=self.request.user, bike=bike).first()
        if existing_review:
            # Update the existing instance
            serializer.instance = existing_review
            serializer.save(user=self.request.user, bike=bike)
        else:
            serializer.save(user=self.request.user, bike=bike)

class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, bike_id):
        identifier = bike_id
        if str(identifier).isdigit():
            bike = get_object_or_404(BikeModel, Q(pk=identifier) | Q(slug=identifier))
        else:
            bike = get_object_or_404(BikeModel, slug=identifier)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        if wishlist.bikes.filter(id=bike.id).exists():
            wishlist.bikes.remove(bike)
            status_msg = "removed"
        else:
            wishlist.bikes.add(bike)
            status_msg = "added"
            
        return Response({"status": status_msg}, status=status.HTTP_200_OK)

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
        return Review.objects.filter(user=self.request.user)
