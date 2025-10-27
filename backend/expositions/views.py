from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Exposition
from .forms import ExpositionForm

def liste_expositions(request):
    expositions = Exposition.objects.all()
    query = request.GET.get('q', '')
    if query:
        expositions = expositions.filter(titre__icontains=query)
    return render(request, 'expositions/liste.html', {
        'expositions': expositions,
        'query': query
    })

@csrf_exempt
def ajouter_exposition(request):
    if request.method == 'POST':
        # Handle JSON data from frontend
        import json
        try:
            data = json.loads(request.body)
            exposition = Exposition.objects.create(
                titre=data.get('titre'),
                description=data.get('description', ''),
                theme=data.get('theme', ''),
                actif=data.get('is_active', True)
            )
            return JsonResponse({
                'message': 'Exposition créée avec succès',
                'exposition': {
                    'id': exposition.id,
                    'titre': exposition.titre,
                    'description': exposition.description,
                    'theme': exposition.theme,
                    'actif': exposition.actif
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # GET request - return form
    form = ExpositionForm()
    return render(request, 'expositions/liste.html', {
        'form': form,
        'title': 'Ajouter Exposition'
    })

def modifier_exposition(request, pk):
    exposition = get_object_or_404(Exposition, pk=pk)
    form = ExpositionForm(request.POST or None, instance=exposition)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('liste_expositions')
    return render(request, 'liste.html', {
        'form': form,
        'title': 'Modifier Exposition',
        'module': 'exposition'
    })

def supprimer_exposition(request, pk):
    exposition = get_object_or_404(Exposition, pk=pk)
    if request.method == 'POST':
        exposition.delete()
        return redirect('liste_expositions')
    return render(request, 'liste.html', {
        'item_to_delete': exposition,
        'module': 'exposition'
    })
