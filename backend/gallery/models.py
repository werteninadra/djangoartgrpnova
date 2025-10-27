from django.db import models
from django.conf import settings
from catalogue.models import Artwork

class Gallery(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    curator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='galleries')
    artworks = models.ManyToManyField(Artwork, through='GalleryArtwork', related_name='galleries')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class GalleryArtwork(models.Model):
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE)
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE)
    position_x = models.FloatField(default=0.0)  # For virtual room positioning
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['gallery', 'artwork']

    def __str__(self):
        return f"{self.gallery.name} - {self.artwork.title}"
