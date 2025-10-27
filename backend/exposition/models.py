from django.db import models
from django.conf import settings
from catalogue.models import Artwork

class Exposition(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    curator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expositions')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    theme = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-start_date']

class VirtualRoom(models.Model):
    exposition = models.ForeignKey(Exposition, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    room_type = models.CharField(max_length=50, choices=[
        ('main', 'Main Hall'),
        ('gallery', 'Gallery Room'),
        ('special', 'Special Exhibition'),
        ('interactive', 'Interactive Space'),
    ], default='gallery')
    position_order = models.PositiveIntegerField(default=0)  # For ordering rooms in the virtual tour

    def __str__(self):
        return f"{self.exposition.title} - {self.name}"

    class Meta:
        ordering = ['position_order']

class RoomArtwork(models.Model):
    room = models.ForeignKey(VirtualRoom, on_delete=models.CASCADE, related_name='artworks')
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE)
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    scale = models.FloatField(default=1.0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['room', 'artwork']

    def __str__(self):
        return f"{self.room.name} - {self.artwork.title}"

class Visit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visits')
    exposition = models.ForeignKey(Exposition, on_delete=models.CASCADE, related_name='visits')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    rooms_visited = models.ManyToManyField(VirtualRoom, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.exposition.title}"

    class Meta:
        unique_together = ['user', 'exposition']
