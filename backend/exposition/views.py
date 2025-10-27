from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Exposition, VirtualRoom, RoomArtwork, Visit
from .serializers import ExpositionSerializer, ExpositionDetailSerializer, VirtualRoomSerializer, RoomArtworkSerializer, VisitSerializer

class ExpositionListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpositionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Exposition.objects.filter(is_active=True)
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        elif not self.request.user.role == 'admin':
            queryset = queryset.filter(Q(is_public=True) | Q(curator=self.request.user))
        return queryset

    def perform_create(self, serializer):
        serializer.save(curator=self.request.user)

class ExpositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exposition.objects.all()
    serializer_class = ExpositionDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Exposition.objects.all()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True, is_active=True)
        elif not self.request.user.role == 'admin':
            queryset = queryset.filter(Q(is_public=True, is_active=True) | Q(curator=self.request.user))
        return queryset

class VirtualRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = VirtualRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        exposition_id = self.kwargs['exposition_id']
        return VirtualRoom.objects.filter(exposition_id=exposition_id)

    def perform_create(self, serializer):
        exposition_id = self.kwargs['exposition_id']
        exposition = get_object_or_404(Exposition, id=exposition_id)
        if exposition.curator != self.request.user and self.request.user.role != 'admin':
            raise PermissionError("Only the curator or admin can add rooms")
        serializer.save(exposition=exposition)

class VirtualRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VirtualRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        exposition_id = self.kwargs['exposition_id']
        return VirtualRoom.objects.filter(exposition_id=exposition_id)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_artwork_to_room(request, exposition_id, room_id):
    exposition = get_object_or_404(Exposition, id=exposition_id)
    room = get_object_or_404(VirtualRoom, id=room_id, exposition=exposition)

    if exposition.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    artwork_id = request.data.get('artwork_id')
    position_data = {
        'position_x': request.data.get('position_x', 0.0),
        'position_y': request.data.get('position_y', 0.0),
        'position_z': request.data.get('position_z', 0.0),
        'rotation_x': request.data.get('rotation_x', 0.0),
        'rotation_y': request.data.get('rotation_y', 0.0),
        'rotation_z': request.data.get('rotation_z', 0.0),
        'scale': request.data.get('scale', 1.0),
    }

    if RoomArtwork.objects.filter(room=room, artwork_id=artwork_id).exists():
        return Response({'error': 'Artwork already in room'}, status=status.HTTP_400_BAD_REQUEST)

    room_artwork = RoomArtwork.objects.create(room=room, artwork_id=artwork_id, **position_data)
    serializer = RoomArtworkSerializer(room_artwork)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_artwork_from_room(request, exposition_id, room_id, artwork_id):
    exposition = get_object_or_404(Exposition, id=exposition_id)
    room = get_object_or_404(VirtualRoom, id=room_id, exposition=exposition)

    if exposition.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        room_artwork = RoomArtwork.objects.get(room=room, artwork_id=artwork_id)
        room_artwork.delete()
        return Response({'message': 'Artwork removed from room'})
    except RoomArtwork.DoesNotExist:
        return Response({'error': 'Artwork not found in room'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_artwork_position_in_room(request, exposition_id, room_id, artwork_id):
    exposition = get_object_or_404(Exposition, id=exposition_id)
    room = get_object_or_404(VirtualRoom, id=room_id, exposition=exposition)

    if exposition.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        room_artwork = RoomArtwork.objects.get(room=room, artwork_id=artwork_id)
        for field in ['position_x', 'position_y', 'position_z', 'rotation_x', 'rotation_y', 'rotation_z', 'scale']:
            if field in request.data:
                setattr(room_artwork, field, request.data[field])
        room_artwork.save()
        serializer = RoomArtworkSerializer(room_artwork)
        return Response(serializer.data)
    except RoomArtwork.DoesNotExist:
        return Response({'error': 'Artwork not found in room'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_visit(request, exposition_id):
    exposition = get_object_or_404(Exposition, id=exposition_id, is_active=True, is_public=True)
    visit, created = Visit.objects.get_or_create(
        user=request.user,
        exposition=exposition,
        defaults={'start_time': timezone.now()}
    )
    if not created:
        return Response({'error': 'Visit already started'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = VisitSerializer(visit)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_visit(request, exposition_id):
    exposition = get_object_or_404(Exposition, id=exposition_id)
    try:
        visit = Visit.objects.get(user=request.user, exposition=exposition, end_time__isnull=True)
        visit.end_time = timezone.now()
        visit.duration = visit.end_time - visit.start_time
        visit.completed = True
        visit.save()
        serializer = VisitSerializer(visit)
        return Response(serializer.data)
    except Visit.DoesNotExist:
        return Response({'error': 'No active visit found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def visit_room(request, exposition_id, room_id):
    exposition = get_object_or_404(Exposition, id=exposition_id)
    room = get_object_or_404(VirtualRoom, id=room_id, exposition=exposition)

    try:
        visit = Visit.objects.get(user=request.user, exposition=exposition, end_time__isnull=True)
        visit.rooms_visited.add(room)
        return Response({'message': 'Room visited'})
    except Visit.DoesNotExist:
        return Response({'error': 'No active visit found'}, status=status.HTTP_404_NOT_FOUND)
