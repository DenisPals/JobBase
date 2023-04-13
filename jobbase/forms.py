from django import forms
from .models import CV

class CVForm(forms.ModelForm):
    """Form for the CV model"""
    class Meta:
        model =  CV
        fields = ('user', 'cv', 'active')

