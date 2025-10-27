from django.urls import path
from . import views

app_name = 'virtual_exhibitions'

urlpatterns = [
    # Exhibition views
    path('', views.exhibition_list, name='list'),
    path('<uuid:uuid>/', views.exhibition_detail, name='detail'),
    path('create/', views.create_exhibition, name='create'),
    path('<uuid:uuid>/manage/', views.manage_exhibition, name='manage_exhibition'),
    path('<uuid:uuid>/delete/', views.delete_exhibition, name='delete_exhibition'),

    # API endpoints for virtual tour
    path('<uuid:uuid>/api/start-session/', views.start_session, name='start_session'),
    path('<uuid:uuid>/api/advance/', views.advance_artwork, name='advance_artwork'),
    path('<uuid:uuid>/api/go-to/', views.go_to_artwork, name='go_to_artwork'),
    path('<uuid:uuid>/api/progress/', views.get_session_progress, name='get_progress'),
]