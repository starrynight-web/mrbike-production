from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Review, Wishlist
from .serializers import ReviewSerializer, WishlistSerializer
from apps.bikes.models import BikeModel

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
        serializer.save(user=self.request.user, bike=bike)

class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, bike_id):
        bike = get_object_or_404(BikeModel, pk=bike_id)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        if wishlist.bikes.filter(pk=bike_id).exists():
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
