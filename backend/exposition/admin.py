from django.contrib import admin
from .models import Exposition, VirtualRoom, RoomArtwork, Visit

@admin.register(Exposition)
class ExpositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'curator', 'start_date', 'end_date', 'is_active', 'is_public']
    search_fields = ['title', 'curator__username']
    list_filter = ['is_active', 'is_public', 'start_date', 'end_date']
    date_hierarchy = 'start_date'

@admin.register(VirtualRoom)
class VirtualRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'exposition', 'room_type', 'position_order']
    search_fields = ['name', 'exposition__title']
    list_filter = ['room_type']

@admin.register(RoomArtwork)
class RoomArtworkAdmin(admin.ModelAdmin):
    list_display = ['room', 'artwork', 'position_x', 'position_y', 'position_z']
    search_fields = ['room__name', 'artwork__title']
    list_filter = ['added_at']

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ['user', 'exposition', 'start_time', 'end_time', 'completed']
    search_fields = ['user__username', 'exposition__title']
    list_filter = ['completed', 'start_time']
