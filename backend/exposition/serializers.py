from rest_framework import serializers
from .models import Exposition, VirtualRoom, RoomArtwork, Visit
from catalogue.serializers import ArtworkSerializer

class RoomArtworkSerializer(serializers.ModelSerializer):
    artwork = ArtworkSerializer(read_only=True)

    class Meta:
        model = RoomArtwork
        fields = ['id', 'artwork', 'position_x', 'position_y', 'position_z', 'rotation_x', 'rotation_y', 'rotation_z', 'scale', 'added_at']

class VirtualRoomSerializer(serializers.ModelSerializer):
    artworks = RoomArtworkSerializer(source='roomartwork_set', many=True, read_only=True)
    exposition_title = serializers.CharField(source='exposition.title', read_only=True)

    class Meta:
        model = VirtualRoom
        fields = ['id', 'exposition', 'exposition_title', 'name', 'description', 'room_type', 'position_order', 'artworks']

class ExpositionSerializer(serializers.ModelSerializer):
    curator = serializers.StringRelatedField(read_only=True)
    rooms = VirtualRoomSerializer(many=True, read_only=True)

    class Meta:
        model = Exposition
        fields = ['id', 'title', 'description', 'curator', 'start_date', 'end_date', 'is_active', 'is_public', 'theme', 'rooms', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['curator'] = self.context['request'].user
        return super().create(validated_data)

class VisitSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    exposition_title = serializers.CharField(source='exposition.title', read_only=True)
    rooms_visited_names = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = ['id', 'user', 'exposition', 'exposition_title', 'start_time', 'end_time', 'duration', 'rooms_visited', 'rooms_visited_names', 'completed']

    def get_rooms_visited_names(self, obj):
        return [room.name for room in obj.rooms_visited.all()]

class ExpositionDetailSerializer(ExpositionSerializer):
    visits = VisitSerializer(many=True, read_only=True)

    class Meta(ExpositionSerializer.Meta):
        fields = ExpositionSerializer.Meta.fields + ['visits']