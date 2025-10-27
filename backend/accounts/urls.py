from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile-update'),
    path('change-password/', views.change_password, name='change-password'),
    path('users/', views.list_users, name='list-users'),
    path('users/<int:user_id>/role/', views.update_user_role, name='update-user-role'),
]