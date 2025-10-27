from rest_framework import serializers
from .models import Gallery, GalleryArtwork
from catalogue.serializers import ArtworkSerializer

class GalleryArtworkSerializer(serializers.ModelSerializer):
    artwork = ArtworkSerializer(read_only=True)

    class Meta:
        model = GalleryArtwork
        fields = ['id', 'artwork', 'position_x', 'position_y', 'position_z', 'added_at']

class GallerySerializer(serializers.ModelSerializer):
    curator = serializers.StringRelatedField(read_only=True)
    artworks = GalleryArtworkSerializer(source='galleryartwork_set', many=True, read_only=True)
    artwork_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Gallery
        fields = ['id', 'name', 'description', 'curator', 'artworks', 'artwork_ids', 'is_public', 'created_at', 'updated_at']

    def create(self, validated_data):
        artwork_ids = validated_data.pop('artwork_ids', [])
        validated_data['curator'] = self.context['request'].user
        gallery = Gallery.objects.create(**validated_data)
        for artwork_id in artwork_ids:
            GalleryArtwork.objects.create(gallery=gallery, artwork_id=artwork_id)
        return gallery

    def update(self, instance, validated_data):
        artwork_ids = validated_data.pop('artwork_ids', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if artwork_ids is not None:
            instance.galleryartwork_set.all().delete()  # Remove existing artworks
            for artwork_id in artwork_ids:
                GalleryArtwork.objects.create(gallery=instance, artwork_id=artwork_id)
        return instance