from django.db import models
from catalogue.models import CustomUser, Oeuvre

class Gallery(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    manager = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_galleries')

    def __str__(self):
        return self.name

class GalleryRoom(models.Model):
    gallery = models.ForeignKey(Gallery, related_name='rooms', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    layout = models.TextField(blank=True, help_text="JSON or text describing room layout")

    def __str__(self):
        return f"{self.name} in {self.gallery.name}"

class ArtworkPlacement(models.Model):
    room = models.ForeignKey(GalleryRoom, related_name='placements', on_delete=models.CASCADE)
    artwork = models.ForeignKey(Oeuvre, related_name='placements', on_delete=models.CASCADE)
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    placed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.artwork.titre} in {self.room.name}"

class Collection(models.Model):
    gallery = models.ForeignKey(Gallery, related_name='collections', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
