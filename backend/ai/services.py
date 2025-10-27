from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from catalogue.models import Oeuvre, UserProfile
from .models import UserBehavior, ArtworkRecommendation, UserSimilarity, ArtworkSimilarity, RecommendationEngine
import logging

try:
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import StandardScaler
    AI_DEPS_AVAILABLE = True
except ImportError:
    AI_DEPS_AVAILABLE = False

logger = logging.getLogger(__name__)
User = get_user_model()

class RecommendationService:
    """Service for generating personalized artwork recommendations"""

    @staticmethod
    def get_user_preferences(user):
        """Extract user preferences from behavior and profile data"""
        try:
            profile = UserProfile.objects.filter(user=user).first()
            behaviors = UserBehavior.objects.filter(user=user)

            preferences = {
                'liked_styles': [],
                'liked_themes': [],
                'liked_colors': [],
                'viewed_artworks': [],
                'favorite_artworks': [],
                'search_terms': []
            }

            if profile:
                preferences['favorite_artworks'] = list(profile.favorite_oeuvres.values_list('id', flat=True))
                preferences['viewed_artworks'] = list(profile.viewed_oeuvres.values_list('id', flat=True))
                if profile.search_history:
                    preferences['search_terms'] = profile.search_history

            # Extract preferences from behaviors
            for behavior in behaviors:
                oeuvre = behavior.oeuvre
                if behavior.interaction_type in ['like', 'favorite']:
                    if oeuvre.style:
                        preferences['liked_styles'].append(oeuvre.style)
                    if oeuvre.theme:
                        preferences['liked_themes'].append(oeuvre.theme)
                    if oeuvre.couleur_principale:
                        preferences['liked_colors'].append(oeuvre.couleur_principale)

            return preferences
        except Exception as e:
            logger.error(f"Error getting user preferences: {e}")
            return {}

    @staticmethod
    def calculate_artwork_similarity(oeuvre1, oeuvre2):
        """Calculate similarity between two artworks"""
        try:
            similarity_score = 0
            factors = 0

            # Style similarity
            if oeuvre1.style and oeuvre2.style:
                if oeuvre1.style == oeuvre2.style:
                    similarity_score += 1
                factors += 1

            # Theme similarity
            if oeuvre1.theme and oeuvre2.theme:
                if oeuvre1.theme == oeuvre2.theme:
                    similarity_score += 1
                factors += 1

            # Color similarity
            if oeuvre1.couleur_principale and oeuvre2.couleur_principale:
                if oeuvre1.couleur_principale == oeuvre2.couleur_principale:
                    similarity_score += 1
                factors += 1

            # Tag similarity
            tags1 = set(oeuvre1.tags.values_list('nom', flat=True))
            tags2 = set(oeuvre2.tags.values_list('nom', flat=True))
            if tags1 and tags2:
                intersection = len(tags1.intersection(tags2))
                union = len(tags1.union(tags2))
                if union > 0:
                    jaccard_similarity = intersection / union
                    similarity_score += jaccard_similarity
                    factors += 1

            return similarity_score / factors if factors > 0 else 0
        except Exception as e:
            logger.error(f"Error calculating artwork similarity: {e}")
            return 0

    @staticmethod
    def generate_content_based_recommendations(user, limit=10):
        """Generate content-based recommendations"""
        try:
            preferences = RecommendationService.get_user_preferences(user)
            favorite_artworks = preferences.get('favorite_artworks', [])

            if not favorite_artworks:
                return []

            # Get similar artworks to user's favorites
            recommendations = []
            seen_artworks = set(favorite_artworks)

            for artwork_id in favorite_artworks[:5]:  # Limit to top 5 favorites
                try:
                    artwork = Oeuvre.objects.get(id=artwork_id)
                    similar_artworks = Oeuvre.objects.exclude(id__in=seen_artworks)

                    for similar_artwork in similar_artworks[:20]:  # Check top 20 similar
                        similarity = RecommendationService.calculate_artwork_similarity(artwork, similar_artwork)
                        if similarity > 0.3:  # Minimum similarity threshold
                            recommendations.append({
                                'oeuvre': similar_artwork,
                                'score': similarity,
                                'reason': f"Similar to {artwork.titre}"
                            })
                            seen_artworks.add(similar_artwork.id)
                except Oeuvre.DoesNotExist:
                    continue

            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
        except Exception as e:
            logger.error(f"Error generating content-based recommendations: {e}")
            return []

    @staticmethod
    def generate_collaborative_recommendations(user, limit=10):
        """Generate collaborative filtering recommendations"""
        try:
            # Find similar users
            similar_users = UserSimilarity.objects.filter(
                Q(user1=user) | Q(user2=user)
            ).order_by('-similarity_score')[:5]

            recommendations = []
            seen_artworks = set()

            for similarity in similar_users:
                similar_user = similarity.user2 if similarity.user1 == user else similarity.user1

                # Get artworks liked by similar user but not by current user
                liked_by_similar = UserBehavior.objects.filter(
                    user=similar_user,
                    interaction_type__in=['like', 'favorite']
                ).exclude(oeuvre__in=user.behaviors.filter(
                    interaction_type__in=['like', 'favorite']
                ).values_list('oeuvre', flat=True))

                for behavior in liked_by_similar:
                    if behavior.oeuvre.id not in seen_artworks:
                        score = similarity.similarity_score * 0.8  # Weight by similarity
                        recommendations.append({
                            'oeuvre': behavior.oeuvre,
                            'score': score,
                            'reason': f"Liked by users similar to you"
                        })
                        seen_artworks.add(behavior.oeuvre.id)

            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
        except Exception as e:
            logger.error(f"Error generating collaborative recommendations: {e}")
            return []

    @staticmethod
    def get_personalized_recommendations(user, limit=20):
        """Get combined personalized recommendations"""
        try:
            content_based = RecommendationService.generate_content_based_recommendations(user, limit//2)
            collaborative = RecommendationService.generate_collaborative_recommendations(user, limit//2)

            # Combine and deduplicate
            all_recommendations = {}
            for rec in content_based + collaborative:
                oeuvre_id = rec['oeuvre'].id
                if oeuvre_id not in all_recommendations:
                    all_recommendations[oeuvre_id] = rec
                else:
                    # Average scores if duplicate
                    all_recommendations[oeuvre_id]['score'] = (
                        all_recommendations[oeuvre_id]['score'] + rec['score']
                    ) / 2

            # Sort and return
            sorted_recommendations = sorted(
                all_recommendations.values(),
                key=lambda x: x['score'],
                reverse=True
            )

            return sorted_recommendations[:limit]
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return []


class VirtualTourService:
    """Service for generating guided virtual tours"""

    @staticmethod
    def create_thematic_tour(theme, user=None, max_artworks=15):
        """Create a thematic virtual tour"""
        try:
            # Find artworks matching the theme
            artworks = Oeuvre.objects.filter(
                Q(theme__icontains=theme) |
                Q(tags__nom__icontains=theme) |
                Q(style__icontains=theme)
            ).distinct()[:max_artworks]

            if user:
                # Personalize based on user preferences
                preferences = RecommendationService.get_user_preferences(user)
                # Prioritize artworks user hasn't seen
                viewed_ids = preferences.get('viewed_artworks', [])
                unseen_artworks = [art for art in artworks if art.id not in viewed_ids]
                if unseen_artworks:
                    artworks = unseen_artworks[:max_artworks]

            tour_stops = []
            for i, artwork in enumerate(artworks):
                tour_stops.append({
                    'order': i + 1,
                    'oeuvre': artwork,
                    'description': f"Explore {artwork.titre} - {artwork.description[:100]}...",
                    'estimated_time': 120,  # 2 minutes per artwork
                })

            return {
                'theme': theme,
                'stops': tour_stops,
                'total_time': len(tour_stops) * 120,
                'artwork_count': len(tour_stops)
            }
        except Exception as e:
            logger.error(f"Error creating thematic tour: {e}")
            return None

    @staticmethod
    def create_personalized_tour(user, max_artworks=12):
        """Create a personalized virtual tour based on user preferences"""
        try:
            recommendations = RecommendationService.get_personalized_recommendations(user, max_artworks)

            tour_stops = []
            for i, rec in enumerate(recommendations):
                tour_stops.append({
                    'order': i + 1,
                    'oeuvre': rec['oeuvre'],
                    'description': f"Recommended for you: {rec['reason']}",
                    'estimated_time': 180,  # 3 minutes for recommended artworks
                    'recommendation_score': rec['score']
                })

            return {
                'theme': 'Personalized Recommendations',
                'stops': tour_stops,
                'total_time': len(tour_stops) * 180,
                'artwork_count': len(tour_stops)
            }
        except Exception as e:
            logger.error(f"Error creating personalized tour: {e}")
            return None


class ArtworkPlacementService:
    """Service for automatic artwork placement in virtual galleries"""

    @staticmethod
    def calculate_optimal_placement(artworks, room_dimensions):
        """Calculate optimal placement for artworks in a room"""
        try:
            # Simple grid-based placement algorithm
            width, height = room_dimensions
            num_artworks = len(artworks)

            # Calculate grid dimensions
            cols = int(np.ceil(np.sqrt(num_artworks)))
            rows = int(np.ceil(num_artworks / cols))

            placements = []
            spacing_x = width / (cols + 1)
            spacing_y = height / (rows + 1)

            for i, artwork in enumerate(artworks):
                row = i // cols
                col = i % cols

                x = spacing_x * (col + 1)
                y = spacing_y * (row + 1)

                placements.append({
                    'oeuvre': artwork,
                    'position': {'x': x, 'y': y, 'z': 0},
                    'rotation': {'x': 0, 'y': 0, 'z': 0},
                    'scale': 1.0
                })

            return placements
        except Exception as e:
            logger.error(f"Error calculating optimal placement: {e}")
            return []

    @staticmethod
    def optimize_placement_by_similarity(artworks, room_dimensions):
        """Optimize placement based on artwork similarity"""
        try:
            # Group similar artworks together
            similarity_groups = {}

            for artwork in artworks:
                # Simple grouping by style
                key = artwork.style or 'unknown'
                if key not in similarity_groups:
                    similarity_groups[key] = []
                similarity_groups[key].append(artwork)

            # Place groups in different areas of the room
            placements = []
            width, height = room_dimensions
            group_centers = []

            num_groups = len(similarity_groups)
            if num_groups == 1:
                group_centers = [(width/2, height/2)]
            elif num_groups == 2:
                group_centers = [(width/3, height/2), (2*width/3, height/2)]
            elif num_groups <= 4:
                group_centers = [
                    (width/3, height/3),
                    (2*width/3, height/3),
                    (width/3, 2*height/3),
                    (2*width/3, 2*height/3)
                ][:num_groups]
            else:
                # For more groups, use grid
                cols = int(np.ceil(np.sqrt(num_groups)))
                rows = int(np.ceil(num_groups / cols))
                spacing_x = width / (cols + 1)
                spacing_y = height / (rows + 1)

                for i in range(num_groups):
                    row = i // cols
                    col = i % cols
                    group_centers.append((
                        spacing_x * (col + 1),
                        spacing_y * (row + 1)
                    ))

            # Place artworks within their groups
            for group_idx, (style, group_artworks) in enumerate(similarity_groups.items()):
                if group_idx < len(group_centers):
                    center_x, center_y = group_centers[group_idx]

                    # Arrange artworks around center
                    num_in_group = len(group_artworks)
                    if num_in_group == 1:
                        positions = [(center_x, center_y)]
                    else:
                        # Circular arrangement
                        radius = min(100, 50 * np.sqrt(num_in_group))
                        positions = []
                        for i in range(num_in_group):
                            angle = 2 * np.pi * i / num_in_group
                            x = center_x + radius * np.cos(angle)
                            y = center_y + radius * np.sin(angle)
                            positions.append((x, y))

                    for i, artwork in enumerate(group_artworks):
                        if i < len(positions):
                            x, y = positions[i]
                            placements.append({
                                'oeuvre': artwork,
                                'position': {'x': x, 'y': y, 'z': 0},
                                'rotation': {'x': 0, 'y': 0, 'z': 0},
                                'scale': 1.0,
                                'group': style
                            })

            return placements
        except Exception as e:
            logger.error(f"Error optimizing placement by similarity: {e}")
            return ArtworkPlacementService.calculate_optimal_placement(artworks, room_dimensions)