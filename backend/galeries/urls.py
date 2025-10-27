from django.urls import path
from . import views

urlpatterns = [
    path('', views.liste_galeries, name='liste_galeries'),
    path('ajouter/', views.ajouter_galerie, name='ajouter_galerie'),
    path('modifier/<int:pk>/', views.modifier_galerie, name='modifier_galerie'),
    path('supprimer/<int:pk>/', views.supprimer_galerie, name='supprimer_galerie'),
    path('<int:pk>/manage/', views.manage_gallery, name='manage_gallery'),
    path('<int:gallery_pk>/add-room/', views.add_room, name='add_room'),
    path('room/<int:room_pk>/place-artwork/', views.place_artwork, name='place_artwork'),
    path('room/<int:room_pk>/auto-place/', views.auto_place_artworks, name='auto_place_artworks'),
    path('<int:pk>/virtual/', views.virtual_gallery, name='virtual_gallery'),
]
