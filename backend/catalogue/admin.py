from django.contrib import admin
from .models import Tag, Artist, Artwork

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ['name', 'nationality', 'birth_date', 'death_date']
    search_fields = ['name', 'nationality']
    list_filter = ['nationality']

@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'style', 'year_created', 'popularity_score']
    search_fields = ['title', 'artist__name', 'style']
    list_filter = ['style', 'year_created', 'artist__nationality']
    filter_horizontal = ['tags']
