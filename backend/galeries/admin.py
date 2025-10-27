from django.contrib import admin
from .models import Gallery, GalleryRoom, ArtworkPlacement, Collection

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'description']
    list_filter = ['manager']
    search_fields = ['name', 'description']

@admin.register(GalleryRoom)
class GalleryRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'gallery', 'description']
    list_filter = ['gallery']
    search_fields = ['name', 'description']

@admin.register(ArtworkPlacement)
class ArtworkPlacementAdmin(admin.ModelAdmin):
    list_display = ['artwork', 'room', 'position_x', 'position_y', 'position_z', 'placed_at']
    list_filter = ['room__gallery', 'placed_at']
    search_fields = ['artwork__titre', 'room__name']

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'gallery', 'is_active']
    list_filter = ['gallery', 'is_active']
    search_fields = ['name']
