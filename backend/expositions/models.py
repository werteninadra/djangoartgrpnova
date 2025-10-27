from django.db import models
from django.utils import timezone

class Exposition(models.Model):
    titre = models.CharField(max_length=200, default='Exposition sans titre')
    description = models.TextField(blank=True)
    theme = models.CharField(max_length=100, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(default=timezone.now)
    # galerie field will be added later to avoid circular import

    def __str__(self):
        return self.titre
