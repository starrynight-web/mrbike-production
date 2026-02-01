SECRET_KEY = 'test'
DEBUG = True
ALLOWED_HOSTS = ['*']
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'apps.users',
    'apps.bikes',
    'apps.marketplace',
    'apps.editorial',
    'apps.engine',
]
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}
ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'
AUTH_USER_MODEL = 'users.User'
