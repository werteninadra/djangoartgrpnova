from django.contrib import admin
from .models import Gallery, GalleryArtwork

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['name', 'curator', 'is_public', 'created_at']
    search_fields = ['name', 'curator__username']
    list_filter = ['is_public', 'created_at']

@admin.register(GalleryArtwork)
class GalleryArtworkAdmin(admin.ModelAdmin):
    list_display = ['gallery', 'artwork', 'position_x', 'position_y', 'position_z']
    search_fields = ['gallery__name', 'artwork__title']
    list_filter = ['added_at']
