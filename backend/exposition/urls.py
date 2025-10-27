from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExpositionListCreateView.as_view(), name='exposition-list-create'),
    path('<int:pk>/', views.ExpositionDetailView.as_view(), name='exposition-detail'),
    path('<int:exposition_id>/rooms/', views.VirtualRoomListCreateView.as_view(), name='virtual-room-list-create'),
    path('<int:exposition_id>/rooms/<int:pk>/', views.VirtualRoomDetailView.as_view(), name='virtual-room-detail'),
    path('<int:exposition_id>/rooms/<int:room_id>/add-artwork/', views.add_artwork_to_room, name='add-artwork-to-room'),
    path('<int:exposition_id>/rooms/<int:room_id>/remove-artwork/<int:artwork_id>/', views.remove_artwork_from_room, name='remove-artwork-from-room'),
    path('<int:exposition_id>/rooms/<int:room_id>/update-position/<int:artwork_id>/', views.update_artwork_position_in_room, name='update-artwork-position-in-room'),
    path('<int:exposition_id>/start-visit/', views.start_visit, name='start-visit'),
    path('<int:exposition_id>/end-visit/', views.end_visit, name='end-visit'),
    path('<int:exposition_id>/visit-room/<int:room_id>/', views.visit_room, name='visit-room'),
]