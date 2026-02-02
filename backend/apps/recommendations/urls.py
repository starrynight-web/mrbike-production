from django.urls import path
from . import views

urlpatterns = [
    path('similar/<slug:slug>/', views.SimilarBikesView.as_view(), name='similar-bikes'),
]
