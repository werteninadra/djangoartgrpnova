from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .models import VirtualExhibition, ExhibitionArtwork, VisitorSession
from catalogue.models import Oeuvre
from django.db import transaction

def exhibition_list(request):
    """List all active virtual exhibitions"""
    exhibitions = VirtualExhibition.objects.filter(is_active=True)
    return JsonResponse([{
        'uuid': str(ex.uuid),
        'title': ex.title,
        'description': ex.description,
        'curator': ex.curator.username,
        'created_at': ex.created_at.isoformat(),
        'artwork_count': ex.artworks.count()
    } for ex in exhibitions], safe=False)

@login_required
def exhibition_detail(request, uuid):
    """View details of a specific virtual exhibition"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, is_active=True)

    # Get or create visitor session
    session, created = VisitorSession.objects.get_or_create(
        virtual_exhibition=exhibition,
        visitor=request.user,
        defaults={'current_artwork_index': 0}
    )

    artworks = exhibition.artworks.select_related('oeuvre').order_by('order')
    current_artwork = session.get_current_artwork()

    context = {
        'exhibition': exhibition,
        'artworks': artworks,
        'session': session,
        'current_artwork': current_artwork,
        'can_manage': request.user.role in ['curator', 'admin']
    }
    return render(request, 'virtual_exhibitions/detail.html', context)

@login_required
def create_exhibition(request):
    """Create a new virtual exhibition (curators and admins only)"""
    if request.user.role not in ['curator', 'admin']:
        raise PermissionDenied("Only curators and admins can create exhibitions")

    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')

        if title:
            exhibition = VirtualExhibition.objects.create(
                title=title,
                description=description,
                curator=request.user
            )
            messages.success(request, f'Exhibition "{exhibition.title}" created successfully!')
            return redirect('virtual_exhibitions:manage_exhibition', uuid=exhibition.uuid)
        else:
            messages.error(request, 'Title is required')

    return render(request, 'virtual_exhibitions/create.html')

@login_required
def manage_exhibition(request, uuid):
    """Manage an exhibition (add/remove artworks, reorder)"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, curator=request.user)

    if request.user.role not in ['curator', 'admin'] and exhibition.curator != request.user:
        raise PermissionDenied("You can only manage your own exhibitions")

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'add_artwork':
            oeuvre_id = request.POST.get('oeuvre_id')
            description = request.POST.get('description', '')

            try:
                oeuvre = Oeuvre.objects.get(id=oeuvre_id)
                if not exhibition.artworks.filter(oeuvre=oeuvre).exists():
                    order = exhibition.artworks.count()
                    ExhibitionArtwork.objects.create(
                        virtual_exhibition=exhibition,
                        oeuvre=oeuvre,
                        order=order,
                        description=description
                    )
                    messages.success(request, f'Added "{oeuvre.titre}" to the exhibition')
                else:
                    messages.warning(request, 'This artwork is already in the exhibition')
            except Oeuvre.DoesNotExist:
                messages.error(request, 'Artwork not found')

        elif action == 'remove_artwork':
            artwork_id = request.POST.get('artwork_id')
            try:
                artwork = exhibition.artworks.get(id=artwork_id)
                artwork.delete()
                # Reorder remaining artworks
                for i, art in enumerate(exhibition.artworks.order_by('order')):
                    art.order = i
                    art.save()
                messages.success(request, f'Removed "{artwork.oeuvre.titre}" from the exhibition')
            except ExhibitionArtwork.DoesNotExist:
                messages.error(request, 'Artwork not found in exhibition')

        elif action == 'reorder':
            order_data = request.POST.get('order')
            if order_data:
                order_ids = order_data.split(',')
                for i, artwork_id in enumerate(order_ids):
                    try:
                        artwork = exhibition.artworks.get(id=artwork_id)
                        artwork.order = i
                        artwork.save()
                    except ExhibitionArtwork.DoesNotExist:
                        continue
                messages.success(request, 'Artwork order updated')

        return redirect('virtual_exhibitions:manage_exhibition', uuid=uuid)

    # Get available artworks (not already in exhibition)
    existing_oeuvre_ids = exhibition.artworks.values_list('oeuvre_id', flat=True)
    available_artworks = Oeuvre.objects.exclude(id__in=existing_oeuvre_ids)

    context = {
        'exhibition': exhibition,
        'artworks': exhibition.artworks.select_related('oeuvre').order_by('order'),
        'available_artworks': available_artworks
    }
    return render(request, 'virtual_exhibitions/manage.html', context)

@login_required
def delete_exhibition(request, uuid):
    """Delete an exhibition"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, curator=request.user)

    if request.user.role not in ['curator', 'admin'] and exhibition.curator != request.user:
        raise PermissionDenied("You can only delete your own exhibitions")

    if request.method == 'POST':
        exhibition.delete()
        messages.success(request, f'Exhibition "{exhibition.title}" deleted successfully')
        return redirect('virtual_exhibitions:list')

    return render(request, 'virtual_exhibitions/delete.html', {'exhibition': exhibition})

# API Endpoints for Virtual Tour

@require_POST
@login_required
def start_session(request, uuid):
    """Start or resume a virtual tour session"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, is_active=True)

    session, created = VisitorSession.objects.get_or_create(
        virtual_exhibition=exhibition,
        visitor=request.user,
        defaults={'current_artwork_index': 0}
    )

    return JsonResponse({
        'session_id': session.id,
        'current_index': session.current_artwork_index,
        'total_artworks': exhibition.artworks.count(),
        'created': created
    })

@require_POST
@login_required
def advance_artwork(request, uuid):
    """Move to the next artwork in the virtual tour"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, is_active=True)

    try:
        session = VisitorSession.objects.get(
            virtual_exhibition=exhibition,
            visitor=request.user
        )
        session.advance_to_next_artwork()
        session.save()

        current_artwork = session.get_current_artwork()
        return JsonResponse({
            'current_index': session.current_artwork_index,
            'completed': session.completed,
            'current_artwork': {
                'id': current_artwork.oeuvre.id if current_artwork else None,
                'title': current_artwork.oeuvre.titre if current_artwork else None,
                'image_url': current_artwork.oeuvre.image.url if current_artwork and current_artwork.oeuvre.image else None,
                'description': current_artwork.description if current_artwork else None,
            } if current_artwork else None
        })
    except VisitorSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

@require_POST
@login_required
def go_to_artwork(request, uuid):
    """Jump to a specific artwork in the virtual tour"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, is_active=True)
    index = int(request.POST.get('index', 0))

    try:
        session = VisitorSession.objects.get(
            virtual_exhibition=exhibition,
            visitor=request.user
        )
        session.go_to_artwork(index)

        current_artwork = session.get_current_artwork()
        return JsonResponse({
            'current_index': session.current_artwork_index,
            'current_artwork': {
                'id': current_artwork.oeuvre.id if current_artwork else None,
                'title': current_artwork.oeuvre.titre if current_artwork else None,
                'image_url': current_artwork.oeuvre.image.url if current_artwork and current_artwork.oeuvre.image else None,
                'description': current_artwork.description if current_artwork else None,
            } if current_artwork else None
        })
    except VisitorSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

@login_required
def get_session_progress(request, uuid):
    """Get current session progress"""
    exhibition = get_object_or_404(VirtualExhibition, uuid=uuid, is_active=True)

    try:
        session = VisitorSession.objects.get(
            virtual_exhibition=exhibition,
            visitor=request.user
        )

        current_artwork = session.get_current_artwork()
        return JsonResponse({
            'current_index': session.current_artwork_index,
            'total_artworks': exhibition.artworks.count(),
            'completed': session.completed,
            'current_artwork': {
                'id': current_artwork.oeuvre.id if current_artwork else None,
                'title': current_artwork.oeuvre.titre if current_artwork else None,
                'image_url': current_artwork.oeuvre.image.url if current_artwork and current_artwork.oeuvre.image else None,
                'description': current_artwork.description if current_artwork else None,
            } if current_artwork else None
        })
    except VisitorSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)
