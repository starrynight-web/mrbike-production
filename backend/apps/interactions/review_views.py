"""
Review views and serializers for bike reviews
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg
from .models import Review
from .review_serializers import ReviewSerializer
from apps.bikes.models import BikeModel


class BikeReviewListCreateView(generics.ListCreateAPIView):
    """List and create reviews for a specific bike"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        bike_id = self.kwargs.get('bike_id')
        return Review.objects.filter(
            bike_id=bike_id,
            is_approved=True
        ).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        bike_id = self.kwargs.get('bike_id')
        bike = BikeModel.objects.get(id=bike_id)
        serializer.save(user=self.request.user, bike=bike)
        
        # Update bike rating
        avg_rating = Review.objects.filter(
            bike=bike,
            is_approved=True
        ).aggregate(Avg('rating'))['rating__avg']
        
        if avg_rating:
            bike.average_rating = round(avg_rating, 2)
            bike.save()


class UserReviewsView(generics.ListAPIView):
    """Get all reviews by current user"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(
            user=self.request.user
        ).select_related('bike').order_by('-created_at')


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.select_related('bike', 'user')
    
    def update(self, request, *args, **kwargs):
        review = self.get_object()
        
        # Check if user owns the review
        if review.user != request.user:
            return Response(
                {'error': 'You can only edit your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        
        # Check if user owns the review
        if review.user != request.user:
            return Response(
                {'error': 'You can only delete your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
