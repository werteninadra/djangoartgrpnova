//This is the backend for the djangoartgrpnova project.

Project structure (important parts):

- core/: main Django project module (contains `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`)
- catalogue/, expositions/, galeries/: Django apps
- manage.py: runserver, migrations, etc.

Note: the Django settings module is `core.settings` (not `djangoartgrpnova.settings`).

To run locally:

```powershell
cd backend
env\Scripts\Activate.ps1  # if using the provided virtualenv
python manage.py runserver
```
