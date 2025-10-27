from django.urls import path
from . import views

urlpatterns = [
    path('', views.liste_expositions, name='liste_expositions'),
    path('ajouter/', views.ajouter_exposition, name='ajouter_exposition'),
    path('modifier/<int:pk>/', views.modifier_exposition, name='modifier_exposition'),
    path('supprimer/<int:pk>/', views.supprimer_exposition, name='supprimer_exposition'),
]
