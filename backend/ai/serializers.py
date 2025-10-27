from rest_framework import serializers
from .models import UserBehavior, ArtworkRecommendation, UserSimilarity, ArtworkSimilarity, RecommendationEngine


class UserBehaviorSerializer(serializers.ModelSerializer):
    oeuvre_title = serializers.CharField(source='oeuvre.titre', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserBehavior
        fields = [
            'id', 'user', 'user_username', 'oeuvre', 'oeuvre_title',
            'interaction_type', 'timestamp', 'duration', 'rating', 'context'
        ]
        read_only_fields = ['id', 'timestamp']


class ArtworkRecommendationSerializer(serializers.ModelSerializer):
    oeuvre_title = serializers.CharField(source='oeuvre.titre', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ArtworkRecommendation
        fields = [
            'id', 'user', 'user_username', 'oeuvre', 'oeuvre_title',
            'score', 'algorithm', 'created_at', 'expires_at', 'is_active', 'reason'
        ]
        read_only_fields = ['id', 'created_at']


class UserSimilaritySerializer(serializers.ModelSerializer):
    user1_username = serializers.CharField(source='user1.username', read_only=True)
    user2_username = serializers.CharField(source='user2.username', read_only=True)

    class Meta:
        model = UserSimilarity
        fields = [
            'id', 'user1', 'user1_username', 'user2', 'user2_username',
            'similarity_score', 'algorithm', 'calculated_at', 'common_interactions', 'features'
        ]
        read_only_fields = ['id', 'calculated_at']


class ArtworkSimilaritySerializer(serializers.ModelSerializer):
    oeuvre1_title = serializers.CharField(source='oeuvre1.titre', read_only=True)
    oeuvre2_title = serializers.CharField(source='oeuvre2.titre', read_only=True)

    class Meta:
        model = ArtworkSimilarity
        fields = [
            'id', 'oeuvre1', 'oeuvre1_title', 'oeuvre2', 'oeuvre2_title',
            'similarity_score', 'algorithm', 'calculated_at', 'similarity_type', 'features'
        ]
        read_only_fields = ['id', 'calculated_at']


class RecommendationEngineSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationEngine
        fields = [
            'id', 'name', 'algorithm', 'is_active', 'parameters',
            'last_trained', 'performance_metrics', 'target_users', 'description'
        ]
        read_only_fields = ['id', 'last_trained']


# Custom serializers for API responses
class VirtualTourSerializer(serializers.Serializer):
    theme = serializers.CharField()
    stops = serializers.ListField()
    total_time = serializers.IntegerField()
    artwork_count = serializers.IntegerField()


class ArtworkPlacementSerializer(serializers.Serializer):
    oeuvre = serializers.DictField()
    position = serializers.DictField()
    rotation = serializers.DictField()
    scale = serializers.FloatField()
    group = serializers.CharField(required=False)