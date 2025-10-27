from rest_framework import serializers
from .models import Tag, Artist, Artwork

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'birth_date', 'death_date', 'nationality']

class ArtworkSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    artist_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Artwork
        fields = ['id', 'title', 'description', 'artist', 'artist_id', 'year_created', 'style', 'medium', 'dimensions', 'image', 'tags', 'tag_ids', 'popularity_score', 'created_at', 'updated_at']

    def validate_artist_id(self, value):
        if value is not None:
            try:
                Artist.objects.get(id=value)
            except Artist.DoesNotExist:
                raise serializers.ValidationError("Artist with this ID does not exist.")
        return value

    def validate_year_created(self, value):
        if value is not None and (value < 0 or value > 2100):
            raise serializers.ValidationError("Invalid year.")
        return value

    def validate_style(self, value):
        valid_styles = ['abstract', 'realism', 'impressionism', 'surrealism', 'modern', 'contemporary', 'other']
        if value not in valid_styles:
            raise serializers.ValidationError(f"Invalid style. Must be one of: {', '.join(valid_styles)}")
        return value

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required.")
        return value.strip()

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        artwork = Artwork.objects.create(**validated_data)
        artwork.tags.set(tag_ids)
        return artwork

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_ids:
            instance.tags.set(tag_ids)
        return instance