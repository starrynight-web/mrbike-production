from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
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
        return Review.objects.filter(bike_id=self.kwargs['bike_id'])
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Verify bike exists in Postgres
        get_object_or_404(BikeModel, pk=self.kwargs['bike_id'])
        serializer.save(user=self.request.user, bike_id=self.kwargs['bike_id'])

class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, bike_id):
        # Verify bike exists
        get_object_or_404(BikeModel, pk=bike_id)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        if not isinstance(wishlist.bike_ids, list):
            wishlist.bike_ids = []

        if bike_id in wishlist.bike_ids:
            wishlist.bike_ids.remove(bike_id)
            status_msg = "removed"
        else:
            wishlist.bike_ids.append(bike_id)
            status_msg = "added"
            
        wishlist.save()
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
