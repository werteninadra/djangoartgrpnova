from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from .models import CustomUser, Catalogue, Oeuvre, UserProfile
from ai.models import UserBehavior

@receiver(post_migrate)
def create_user_groups_and_permissions(sender, **kwargs):
    # Create groups
    artist_group, created = Group.objects.get_or_create(name='Artist')
    curator_group, created = Group.objects.get_or_create(name='Curator')
    visitor_group, created = Group.objects.get_or_create(name='Visitor')
    admin_group, created = Group.objects.get_or_create(name='Admin')

    # Get content types
    user_ct = ContentType.objects.get_for_model(CustomUser)
    catalogue_ct = ContentType.objects.get_for_model(Catalogue)
    oeuvre_ct = ContentType.objects.get_for_model(Oeuvre)
    profile_ct = ContentType.objects.get_for_model(UserProfile)

    # Define permissions for each role
    # Artist permissions
    artist_permissions = [
        Permission.objects.get_or_create(
            codename='add_oeuvre',
            name='Can add oeuvre',
            content_type=oeuvre_ct
        )[0],
        Permission.objects.get_or_create(
            codename='change_oeuvre',
            name='Can change oeuvre',
            content_type=oeuvre_ct
        )[0],
        Permission.objects.get_or_create(
            codename='view_oeuvre',
            name='Can view oeuvre',
            content_type=oeuvre_ct
        )[0],
        Permission.objects.get_or_create(
            codename='view_catalogue',
            name='Can view catalogue',
            content_type=catalogue_ct
        )[0],
    ]

    # Curator permissions
    curator_permissions = [
        Permission.objects.get_or_create(
            codename='add_catalogue',
            name='Can add catalogue',
            content_type=catalogue_ct
        )[0],
        Permission.objects.get_or_create(
            codename='change_catalogue',
            name='Can change catalogue',
            content_type=catalogue_ct
        )[0],
        Permission.objects.get_or_create(
            codename='view_catalogue',
            name='Can view catalogue',
            content_type=catalogue_ct
        )[0],
        Permission.objects.get_or_create(
            codename='add_oeuvre',
            name='Can add oeuvre',
            content_type=oeuvre_ct
        )[0],
        Permission.objects.get_or_create(
            codename='change_oeuvre',
            name='Can change oeuvre',
            content_type=oeuvre_ct
        )[0],
        Permission.objects.get_or_create(
            codename='view_oeuvre',
            name='Can view oeuvre',
            content_type=oeuvre_ct
        )[0],
    ]

    # Visitor permissions
    visitor_permissions = [
        Permission.objects.get_or_create(
            codename='view_catalogue',
            name='Can view catalogue',
            content_type=catalogue_ct
        )[0],
        Permission.objects.get_or_create(
            codename='view_oeuvre',
            name='Can view oeuvre',
            content_type=oeuvre_ct
        )[0],
    ]

    # Admin permissions (all permissions)
    admin_permissions = Permission.objects.all()

    # Assign permissions to groups
    artist_group.permissions.set(artist_permissions)
    curator_group.permissions.set(curator_permissions)
    visitor_group.permissions.set(visitor_permissions)
    admin_group.permissions.set(admin_permissions)


@receiver(post_save, sender=Oeuvre)
def track_artwork_view(sender, instance, created, **kwargs):
    """Signal to track when artworks are viewed (placeholder for actual tracking)"""
    # This would be called when an artwork is accessed
    # Actual tracking happens through API endpoints
    pass


@receiver(post_save, sender=UserProfile)
def update_user_recommendations(sender, instance, created, **kwargs):
    """Signal to update recommendations when user profile changes"""
    if not created:  # Only update on profile changes, not creation
        try:
            from ai.services import RecommendationService
            # Trigger recommendation refresh in background
            # This could be done asynchronously with Celery in production
            pass
        except ImportError:
            pass  # AI app not available