from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import Tag, Artist, Artwork
from .serializers import TagSerializer, ArtistSerializer, ArtworkSerializer

class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

class ArtistListCreateView(generics.ListCreateAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ArtistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticated]

class ArtworkListCreateView(generics.ListCreateAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Artwork.objects.all()
        search = self.request.query_params.get('search', None)
        style = self.request.query_params.get('style', None)
        artist = self.request.query_params.get('artist', None)
        tag = self.request.query_params.get('tag', None)
        min_year = self.request.query_params.get('min_year', None)
        max_year = self.request.query_params.get('max_year', None)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(artist__name__icontains=search)
            )
        if style:
            queryset = queryset.filter(style=style)
        if artist:
            queryset = queryset.filter(artist__name__icontains=artist)
        if tag:
            queryset = queryset.filter(tags__name__icontains=tag)
        if min_year:
            queryset = queryset.filter(year_created__gte=min_year)
        if max_year:
            queryset = queryset.filter(year_created__lte=max_year)

        return queryset

class ArtworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_recommendations(request):
    user = request.user if request.user.is_authenticated else None
    # Simple recommendation based on popularity and recent artworks
    # In a real implementation, this would use more sophisticated algorithms
    recommendations = Artwork.objects.order_by('-popularity_score', '-created_at')[:10]
    serializer = ArtworkSerializer(recommendations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_artwork(request, artwork_id):
    artwork = get_object_or_404(Artwork, id=artwork_id)
    # Simple popularity increase - in real implementation, use proper like system
    artwork.popularity_score += 0.1
    artwork.save()
    return Response({'message': 'Artwork liked', 'popularity_score': artwork.popularity_score})
