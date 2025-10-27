from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Gallery, GalleryRoom, ArtworkPlacement
from .forms import GalleryForm, GalleryRoomForm, ArtworkPlacementForm
from catalogue.models import Oeuvre

def liste_galeries(request):
    galleries = Gallery.objects.prefetch_related('collections').all()
    query = request.GET.get('q', '')
    if query:
        galleries = galleries.filter(name__icontains=query)
    return render(request, 'galeries/liste.html', {'galleries': galleries, 'query': query})

@csrf_exempt
def ajouter_galerie(request):
    if request.method == 'POST':
        # Handle JSON data from frontend
        import json
        try:
            data = json.loads(request.body)
            gallery = Gallery.objects.create(
                name=data.get('name'),
                description=data.get('description', ''),
                manager_id=data.get('manager') if data.get('manager') else None
            )
            return JsonResponse({
                'message': 'Galerie créée avec succès',
                'gallery': {
                    'id': gallery.id,
                    'name': gallery.name,
                    'description': gallery.description,
                    'manager': gallery.manager.username if gallery.manager else None
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # GET request - return form
    form = GalleryForm()
    galleries = Gallery.objects.prefetch_related('collections').all()
    return render(request, 'galeries/liste.html', {
        'form': form,
        'title': 'Ajouter Galerie',
        'galleries': galleries
    })


def modifier_galerie(request, pk):
    gallery = get_object_or_404(Gallery, pk=pk)
    form = GalleryForm(request.POST or None, instance=gallery)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('liste_galeries')
    galleries = Gallery.objects.prefetch_related('collections').all()
    return render(request, 'galeries/liste.html', {'form': form, 'title': 'Modifier Galerie', 'galleries': galleries})

def supprimer_galerie(request, pk):
    gallery = get_object_or_404(Gallery, pk=pk)
    if request.method == 'POST':
        gallery.delete()
        return redirect('liste_galeries')
    galleries = Gallery.objects.prefetch_related('collections').all()
    return render(request, 'galeries/liste.html', {'gallery_to_delete': gallery, 'galleries': galleries})

@login_required
def manage_gallery(request, pk):
    gallery = get_object_or_404(Gallery, pk=pk)
    if not (request.user.role == 'admin' or gallery.manager == request.user):
        messages.error(request, "You don't have permission to manage this gallery.")
        return redirect('liste_galeries')

    rooms = gallery.rooms.prefetch_related('placements__artwork').all()
    return render(request, 'galeries/manage.html', {
        'gallery': gallery,
        'rooms': rooms,
    })

@login_required
def add_room(request, gallery_pk):
    gallery = get_object_or_404(Gallery, pk=gallery_pk)
    if not (request.user.role == 'admin' or gallery.manager == request.user):
        messages.error(request, "You don't have permission to add rooms to this gallery.")
        return redirect('liste_galeries')

    if request.method == 'POST':
        form = GalleryRoomForm(request.POST)
        if form.is_valid():
            room = form.save(commit=False)
            room.gallery = gallery
            room.save()
            messages.success(request, "Room added successfully.")
            return redirect('manage_gallery', pk=gallery.pk)
    else:
        form = GalleryRoomForm()
    return render(request, 'galeries/add_room.html', {'form': form, 'gallery': gallery})

@login_required
def place_artwork(request, room_pk):
    room = get_object_or_404(GalleryRoom, pk=room_pk)
    gallery = room.gallery
    if not (request.user.role == 'admin' or gallery.manager == request.user):
        messages.error(request, "You don't have permission to place artworks in this room.")
        return redirect('liste_galeries')

    if request.method == 'POST':
        form = ArtworkPlacementForm(request.POST)
        if form.is_valid():
            placement = form.save(commit=False)
            placement.room = room
            placement.save()
            messages.success(request, "Artwork placed successfully.")
            return redirect('manage_gallery', pk=gallery.pk)
    else:
        form = ArtworkPlacementForm()
    return render(request, 'galeries/place_artwork.html', {'form': form, 'room': room})

@login_required
def auto_place_artworks(request, room_pk):
    room = get_object_or_404(GalleryRoom, pk=room_pk)
    gallery = room.gallery
    if not (request.user.role == 'admin' or gallery.manager == request.user):
        messages.error(request, "You don't have permission to auto-place artworks in this room.")
        return redirect('liste_galeries')

    # Get artworks not yet placed in this room
    placed_artwork_ids = ArtworkPlacement.objects.filter(room=room).values_list('artwork_id', flat=True)
    available_artworks = Oeuvre.objects.exclude(id__in=placed_artwork_ids)

    # Simple auto-placement logic: sort by style, color, then popularity (view count)
    sorted_artworks = available_artworks.annotate(
        view_count=Count('viewed_by')
    ).order_by('style', 'couleur_principale', '-view_count')

    placements = []
    for i, artwork in enumerate(sorted_artworks[:10]):  # Place up to 10 artworks
        placement = ArtworkPlacement.objects.create(
            room=room,
            artwork=artwork,
            position_x=i * 2.0,  # Simple grid layout
            position_y=0.0,
            position_z=0.0
        )
        placements.append(placement)

    messages.success(request, f"Auto-placed {len(placements)} artworks in {room.name}.")
    return redirect('manage_gallery', pk=gallery.pk)

def virtual_gallery(request, pk):
    gallery = get_object_or_404(Gallery, pk=pk)
    rooms = gallery.rooms.prefetch_related('placements__artwork').all()
    return render(request, 'galeries/virtual.html', {
        'gallery': gallery,
        'rooms': rooms,
    })
