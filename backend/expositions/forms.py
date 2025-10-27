from django import forms
from .models import Exposition

class ExpositionForm(forms.ModelForm):
    class Meta:
        model = Exposition
        fields = '__all__'
