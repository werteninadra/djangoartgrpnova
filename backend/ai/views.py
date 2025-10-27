from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from catalogue.models import Oeuvre
from .models import UserBehavior, ArtworkRecommendation
from .services import RecommendationService, VirtualTourService, ArtworkPlacementService
from .serializers import (
    UserBehaviorSerializer,
    ArtworkRecommendationSerializer,
    VirtualTourSerializer,
    ArtworkPlacementSerializer
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class AIRecommendationViewSet(viewsets.ViewSet):
    """ViewSet for AI-powered recommendations"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def personalized(self, request):
        """Get personalized artwork recommendations"""
        try:
            user = request.user
            limit = int(request.query_params.get('limit', 20))

            recommendations = RecommendationService.get_personalized_recommendations(user, limit)

            # Format response
            data = []
            for rec in recommendations:
                data.append({
                    'id': rec['oeuvre'].id,
                    'titre': rec['oeuvre'].titre,
                    'image': rec['oeuvre'].image.url if rec['oeuvre'].image else None,
                    'score': rec['score'],
                    'reason': rec['reason'],
                    'style': rec['oeuvre'].style,
                    'theme': rec['oeuvre'].theme,
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return Response(
                {'error': 'Failed to get recommendations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def content_based(self, request):
        """Get content-based recommendations"""
        try:
            user = request.user
            limit = int(request.query_params.get('limit', 10))

            recommendations = RecommendationService.generate_content_based_recommendations(user, limit)

            data = []
            for rec in recommendations:
                data.append({
                    'id': rec['oeuvre'].id,
                    'titre': rec['oeuvre'].titre,
                    'image': rec['oeuvre'].image.url if rec['oeuvre'].image else None,
                    'score': rec['score'],
                    'reason': rec['reason'],
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error getting content-based recommendations: {e}")
            return Response(
                {'error': 'Failed to get content-based recommendations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def collaborative(self, request):
        """Get collaborative filtering recommendations"""
        try:
            user = request.user
            limit = int(request.query_params.get('limit', 10))

            recommendations = RecommendationService.generate_collaborative_recommendations(user, limit)

            data = []
            for rec in recommendations:
                data.append({
                    'id': rec['oeuvre'].id,
                    'titre': rec['oeuvre'].titre,
                    'image': rec['oeuvre'].image.url if rec['oeuvre'].image else None,
                    'score': rec['score'],
                    'reason': rec['reason'],
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error getting collaborative recommendations: {e}")
            return Response(
                {'error': 'Failed to get collaborative recommendations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VirtualTourViewSet(viewsets.ViewSet):
    """ViewSet for virtual tour generation"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def thematic_tour(self, request):
        """Create a thematic virtual tour"""
        try:
            theme = request.data.get('theme')
            if not theme:
                return Response(
                    {'error': 'Theme is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = request.user
            max_artworks = int(request.data.get('max_artworks', 15))

            tour = VirtualTourService.create_thematic_tour(theme, user, max_artworks)

            if not tour:
                return Response(
                    {'error': 'Failed to create tour'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Format response
            data = {
                'theme': tour['theme'],
                'total_time': tour['total_time'],
                'artwork_count': tour['artwork_count'],
                'stops': []
            }

            for stop in tour['stops']:
                data['stops'].append({
                    'order': stop['order'],
                    'oeuvre': {
                        'id': stop['oeuvre'].id,
                        'titre': stop['oeuvre'].titre,
                        'image': stop['oeuvre'].image.url if stop['oeuvre'].image else None,
                        'description': stop['oeuvre'].description,
                    },
                    'description': stop['description'],
                    'estimated_time': stop['estimated_time'],
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error creating thematic tour: {e}")
            return Response(
                {'error': 'Failed to create thematic tour'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def personalized_tour(self, request):
        """Create a personalized virtual tour"""
        try:
            user = request.user
            max_artworks = int(request.query_params.get('max_artworks', 12))

            tour = VirtualTourService.create_personalized_tour(user, max_artworks)

            if not tour:
                return Response(
                    {'error': 'Failed to create personalized tour'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Format response
            data = {
                'theme': tour['theme'],
                'total_time': tour['total_time'],
                'artwork_count': tour['artwork_count'],
                'stops': []
            }

            for stop in tour['stops']:
                data['stops'].append({
                    'order': stop['order'],
                    'oeuvre': {
                        'id': stop['oeuvre'].id,
                        'titre': stop['oeuvre'].titre,
                        'image': stop['oeuvre'].image.url if stop['oeuvre'].image else None,
                        'description': stop['oeuvre'].description,
                    },
                    'description': stop['description'],
                    'estimated_time': stop['estimated_time'],
                    'recommendation_score': stop.get('recommendation_score'),
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error creating personalized tour: {e}")
            return Response(
                {'error': 'Failed to create personalized tour'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ArtworkPlacementViewSet(viewsets.ViewSet):
    """ViewSet for automatic artwork placement"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def optimize_placement(self, request):
        """Optimize artwork placement in a virtual room"""
        try:
            artwork_ids = request.data.get('artwork_ids', [])
            room_width = float(request.data.get('room_width', 1000))
            room_height = float(request.data.get('room_height', 800))
            optimize_by_similarity = request.data.get('optimize_by_similarity', False)

            if not artwork_ids:
                return Response(
                    {'error': 'Artwork IDs are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            artworks = Oeuvre.objects.filter(id__in=artwork_ids)
            room_dimensions = (room_width, room_height)

            if optimize_by_similarity:
                placements = ArtworkPlacementService.optimize_placement_by_similarity(artworks, room_dimensions)
            else:
                placements = ArtworkPlacementService.calculate_optimal_placement(artworks, room_dimensions)

            # Format response
            data = []
            for placement in placements:
                data.append({
                    'oeuvre': {
                        'id': placement['oeuvre'].id,
                        'titre': placement['oeuvre'].titre,
                        'image': placement['oeuvre'].image.url if placement['oeuvre'].image else None,
                    },
                    'position': placement['position'],
                    'rotation': placement['rotation'],
                    'scale': placement['scale'],
                    'group': placement.get('group'),
                })

            return Response(data)
        except Exception as e:
            logger.error(f"Error optimizing artwork placement: {e}")
            return Response(
                {'error': 'Failed to optimize artwork placement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserBehaviorViewSet(viewsets.ModelViewSet):
    """ViewSet for user behavior tracking"""
    queryset = UserBehavior.objects.all()
    serializer_class = UserBehaviorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBehavior.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def track_interaction(self, request):
        """Track user interaction with artwork"""
        try:
            oeuvre_id = request.data.get('oeuvre_id')
            interaction_type = request.data.get('interaction_type')
            duration = request.data.get('duration', 0)
            rating = request.data.get('rating')
            context = request.data.get('context', {})

            if not oeuvre_id or not interaction_type:
                return Response(
                    {'error': 'oeuvre_id and interaction_type are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            oeuvre = get_object_or_404(Oeuvre, id=oeuvre_id)

            # Create or update behavior record
            behavior, created = UserBehavior.objects.get_or_create(
                user=request.user,
                oeuvre=oeuvre,
                interaction_type=interaction_type,
                defaults={
                    'duration': duration,
                    'rating': rating,
                    'context': context,
                }
            )

            if not created:
                # Update existing record
                behavior.duration = max(behavior.duration, duration)
                if rating:
                    behavior.rating = rating
                behavior.context.update(context)
                behavior.save()

            return Response({'success': True, 'created': created})
        except Exception as e:
            logger.error(f"Error tracking user interaction: {e}")
            return Response(
                {'error': 'Failed to track interaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
