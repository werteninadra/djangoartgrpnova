from django.db import models
from django.contrib.auth import get_user_model
from catalogue.models import Oeuvre
import uuid

# Use default database for AI models since MySQL is not configured

User = get_user_model()

class UserBehavior(models.Model):
    """Tracks user interactions with artworks for recommendation algorithms"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behaviors')
    oeuvre = models.ForeignKey(Oeuvre, on_delete=models.CASCADE, related_name='user_behaviors')
    interaction_type = models.CharField(max_length=50, choices=[
        ('view', 'View'),
        ('like', 'Like'),
        ('favorite', 'Favorite'),
        ('share', 'Share'),
        ('comment', 'Comment'),
        ('purchase', 'Purchase'),
        ('download', 'Download'),
    ])
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(default=0, help_text="Time spent viewing in seconds")
    rating = models.IntegerField(blank=True, null=True, choices=[(i, i) for i in range(1, 6)])
    context = models.JSONField(default=dict, blank=True, help_text="Additional context like search terms, referral source")

    class Meta:
        unique_together = ['user', 'oeuvre', 'interaction_type', 'timestamp']
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.interaction_type} - {self.oeuvre.titre}"


class ArtworkRecommendation(models.Model):
    """Stores personalized artwork recommendations for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    oeuvre = models.ForeignKey(Oeuvre, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField(help_text="Recommendation score (0-1)")
    algorithm = models.CharField(max_length=100, help_text="Algorithm used for recommendation")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    reason = models.TextField(blank=True, help_text="Why this artwork was recommended")

    class Meta:
        unique_together = ['user', 'oeuvre', 'algorithm']
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"Recommendation for {self.user.username}: {self.oeuvre.titre} ({self.score})"


class UserSimilarity(models.Model):
    """Stores similarity scores between users for collaborative filtering"""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='similar_users_from')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='similar_users_to')
    similarity_score = models.FloatField(help_text="Similarity score (0-1)")
    algorithm = models.CharField(max_length=100, help_text="Algorithm used to calculate similarity")
    calculated_at = models.DateTimeField(auto_now_add=True)
    common_interactions = models.IntegerField(default=0, help_text="Number of common artworks interacted with")
    features = models.JSONField(default=dict, blank=True, help_text="Feature vectors used for similarity calculation")

    class Meta:
        unique_together = ['user1', 'user2', 'algorithm']
        ordering = ['-similarity_score']

    def __str__(self):
        return f"Similarity: {self.user1.username} <-> {self.user2.username} ({self.similarity_score})"


class ArtworkSimilarity(models.Model):
    """Stores similarity scores between artworks for content-based filtering"""
    oeuvre1 = models.ForeignKey(Oeuvre, on_delete=models.CASCADE, related_name='similar_artworks_from')
    oeuvre2 = models.ForeignKey(Oeuvre, on_delete=models.CASCADE, related_name='similar_artworks_to')
    similarity_score = models.FloatField(help_text="Similarity score (0-1)")
    algorithm = models.CharField(max_length=100, help_text="Algorithm used to calculate similarity")
    calculated_at = models.DateTimeField(auto_now_add=True)
    similarity_type = models.CharField(max_length=50, choices=[
        ('visual', 'Visual Similarity'),
        ('content', 'Content Similarity'),
        ('style', 'Style Similarity'),
        ('theme', 'Theme Similarity'),
        ('metadata', 'Metadata Similarity'),
    ])
    features = models.JSONField(default=dict, blank=True, help_text="Feature vectors used for similarity calculation")

    class Meta:
        unique_together = ['oeuvre1', 'oeuvre2', 'algorithm', 'similarity_type']
        ordering = ['-similarity_score']

    def __str__(self):
        return f"Similarity: {self.oeuvre1.titre} <-> {self.oeuvre2.titre} ({self.similarity_score})"


class RecommendationEngine(models.Model):
    """Configuration and state of recommendation engines"""
    name = models.CharField(max_length=100, unique=True)
    algorithm = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    parameters = models.JSONField(default=dict, blank=True, help_text="Algorithm parameters")
    last_trained = models.DateTimeField(blank=True, null=True)
    performance_metrics = models.JSONField(default=dict, blank=True, help_text="Accuracy, precision, recall, etc.")
    target_users = models.ManyToManyField(User, blank=True, related_name='targeted_by_engines')
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.algorithm})"
