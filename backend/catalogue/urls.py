from django.urls import path
from . import views

urlpatterns = [
    path('tags/', views.TagListCreateView.as_view(), name='tag-list-create'),
    path('tags/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail'),
    path('artists/', views.ArtistListCreateView.as_view(), name='artist-list-create'),
    path('artists/<int:pk>/', views.ArtistDetailView.as_view(), name='artist-detail'),
    path('artworks/', views.ArtworkListCreateView.as_view(), name='artwork-list-create'),
    path('artworks/<int:pk>/', views.ArtworkDetailView.as_view(), name='artwork-detail'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('artworks/<int:artwork_id>/like/', views.like_artwork, name='like-artwork'),
]