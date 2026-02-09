from django.urls import path
from . import views

urlpatterns = [
    path('', views.ArticleListCreateView.as_view(), name='article-list-create'),
    path('<int:pk>/', views.ArticleAdminUpdateDeleteView.as_view(), name='article-admin-update-delete'),
    path('<slug:slug>/', views.ArticleDetailView.as_view(), name='article-detail'),
]
