from django import forms
from .models import Gallery, GalleryRoom, ArtworkPlacement

class GalleryForm(forms.ModelForm):
    class Meta:
        model = Gallery
        fields = ['name', 'description', 'manager']

class GalleryRoomForm(forms.ModelForm):
    class Meta:
        model = GalleryRoom
        fields = ['name', 'description', 'layout']

class ArtworkPlacementForm(forms.ModelForm):
    class Meta:
        model = ArtworkPlacement
        fields = ['artwork', 'position_x', 'position_y', 'position_z']
