from django.db import models
from django.contrib.auth import get_user_model
from catalogue.models import Oeuvre
import uuid

User = get_user_model()

class VirtualExhibition(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    curator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='virtual_exhibitions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self):
        return self.title

class ExhibitionArtwork(models.Model):
    virtual_exhibition = models.ForeignKey(VirtualExhibition, on_delete=models.CASCADE, related_name='artworks')
    oeuvre = models.ForeignKey(Oeuvre, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)  # Curator's notes for this artwork in the exhibition
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['virtual_exhibition', 'oeuvre']

    def __str__(self):
        return f"{self.virtual_exhibition.title} - {self.oeuvre.titre}"

class VisitorSession(models.Model):
    virtual_exhibition = models.ForeignKey(VirtualExhibition, on_delete=models.CASCADE, related_name='visitor_sessions')
    visitor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visitor_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    current_artwork_index = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    session_data = models.JSONField(default=dict, blank=True)  # Store additional session data like time spent on each artwork

    class Meta:
        unique_together = ['virtual_exhibition', 'visitor']

    def __str__(self):
        return f"{self.visitor.username} - {self.virtual_exhibition.title}"

    def get_current_artwork(self):
        artworks = self.virtual_exhibition.artworks.all()
        if self.current_artwork_index < artworks.count():
            return artworks[self.current_artwork_index]
        return None

    def advance_to_next_artwork(self):
        self.current_artwork_index += 1
        if self.current_artwork_index >= self.virtual_exhibition.artworks.count():
            self.completed = True
        self.save()

    def go_to_artwork(self, index):
        if 0 <= index < self.virtual_exhibition.artworks.count():
            self.current_artwork_index = index
            self.save()
