from django.db import models
from django.conf import settings

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Artist(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    death_date = models.DateField(blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class Artwork(models.Model):
    STYLE_CHOICES = [
        ('abstract', 'Abstract'),
        ('realism', 'Realism'),
        ('impressionism', 'Impressionism'),
        ('surrealism', 'Surrealism'),
        ('modern', 'Modern'),
        ('contemporary', 'Contemporary'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, null=True, blank=True, related_name='artworks')
    year_created = models.PositiveIntegerField(blank=True, null=True)
    style = models.CharField(max_length=20, choices=STYLE_CHOICES, default='other')
    medium = models.CharField(max_length=100, blank=True, null=True)
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='artworks/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    popularity_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-popularity_score', '-created_at']
