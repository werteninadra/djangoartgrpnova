from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Gallery, GalleryArtwork
from .serializers import GallerySerializer, GalleryArtworkSerializer

class GalleryListCreateView(generics.ListCreateAPIView):
    serializer_class = GallerySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Gallery.objects.all()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        elif not self.request.user.role == 'admin':
            queryset = queryset.filter(Q(is_public=True) | Q(curator=self.request.user))
        return queryset

    def perform_create(self, serializer):
        serializer.save(curator=self.request.user)

class GalleryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GallerySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Gallery.objects.all()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        elif not self.request.user.role == 'admin':
            queryset = queryset.filter(Q(is_public=True) | Q(curator=self.request.user))
        return queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_artwork_to_gallery(request, gallery_id):
    gallery = get_object_or_404(Gallery, id=gallery_id)
    if gallery.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    artwork_id = request.data.get('artwork_id')
    position_x = request.data.get('position_x', 0.0)
    position_y = request.data.get('position_y', 0.0)
    position_z = request.data.get('position_z', 0.0)

    if GalleryArtwork.objects.filter(gallery=gallery, artwork_id=artwork_id).exists():
        return Response({'error': 'Artwork already in gallery'}, status=status.HTTP_400_BAD_REQUEST)

    gallery_artwork = GalleryArtwork.objects.create(
        gallery=gallery,
        artwork_id=artwork_id,
        position_x=position_x,
        position_y=position_y,
        position_z=position_z
    )
    serializer = GalleryArtworkSerializer(gallery_artwork)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_artwork_from_gallery(request, gallery_id, artwork_id):
    gallery = get_object_or_404(Gallery, id=gallery_id)
    if gallery.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        gallery_artwork = GalleryArtwork.objects.get(gallery=gallery, artwork_id=artwork_id)
        gallery_artwork.delete()
        return Response({'message': 'Artwork removed from gallery'})
    except GalleryArtwork.DoesNotExist:
        return Response({'error': 'Artwork not found in gallery'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_artwork_position(request, gallery_id, artwork_id):
    gallery = get_object_or_404(Gallery, id=gallery_id)
    if gallery.curator != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        gallery_artwork = GalleryArtwork.objects.get(gallery=gallery, artwork_id=artwork_id)
        gallery_artwork.position_x = request.data.get('position_x', gallery_artwork.position_x)
        gallery_artwork.position_y = request.data.get('position_y', gallery_artwork.position_y)
        gallery_artwork.position_z = request.data.get('position_z', gallery_artwork.position_z)
        gallery_artwork.save()
        serializer = GalleryArtworkSerializer(gallery_artwork)
        return Response(serializer.data)
    except GalleryArtwork.DoesNotExist:
        return Response({'error': 'Artwork not found in gallery'}, status=status.HTTP_404_NOT_FOUND)
