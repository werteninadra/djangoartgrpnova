from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIRecommendationViewSet,
    VirtualTourViewSet,
    ArtworkPlacementViewSet,
    UserBehaviorViewSet
)

router = DefaultRouter()
router.register(r'behaviors', UserBehaviorViewSet)

app_name = 'ai'

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/recommendations/', AIRecommendationViewSet.as_view({'get': 'personalized'}), name='recommendations'),
    path('api/recommendations/content-based/', AIRecommendationViewSet.as_view({'get': 'content_based'}), name='content_based_recommendations'),
    path('api/recommendations/collaborative/', AIRecommendationViewSet.as_view({'get': 'collaborative'}), name='collaborative_recommendations'),
    path('api/tours/thematic/', VirtualTourViewSet.as_view({'post': 'thematic_tour'}), name='thematic_tour'),
    path('api/tours/personalized/', VirtualTourViewSet.as_view({'get': 'personalized_tour'}), name='personalized_tour'),
    path('api/placement/optimize/', ArtworkPlacementViewSet.as_view({'post': 'optimize_placement'}), name='optimize_placement'),
    path('api/behaviors/track/', UserBehaviorViewSet.as_view({'post': 'track_interaction'}), name='track_interaction'),
]