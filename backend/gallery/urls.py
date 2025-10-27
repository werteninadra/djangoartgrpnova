from django.urls import path
from . import views

urlpatterns = [
    path('', views.GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('<int:pk>/', views.GalleryDetailView.as_view(), name='gallery-detail'),
    path('<int:gallery_id>/add-artwork/', views.add_artwork_to_gallery, name='add-artwork-to-gallery'),
    path('<int:gallery_id>/remove-artwork/<int:artwork_id>/', views.remove_artwork_from_gallery, name='remove-artwork-from-gallery'),
    path('<int:gallery_id>/update-position/<int:artwork_id>/', views.update_artwork_position, name='update-artwork-position'),
]