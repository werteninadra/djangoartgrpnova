from django import forms
from .models import Catalogue, Oeuvre, UserProfile, ArtworkMetadata

class CatalogueForm(forms.ModelForm):
    class Meta:
        model = Catalogue
        fields = '__all__'

class OeuvreForm(forms.ModelForm):
    class Meta:
        model = Oeuvre
        fields = ['titre', 'description', 'style', 'theme', 'couleur_principale', 'tags',
                 'dimensions', 'materials', 'year_created', 'technique', 'location']

class ArtworkMetadataForm(forms.ModelForm):
    class Meta:
        model = ArtworkMetadata
        fields = ['provenance', 'conservation_status', 'exhibition_history',
                 'value_estimate', 'copyright_info', 'additional_notes']

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['preferences']
