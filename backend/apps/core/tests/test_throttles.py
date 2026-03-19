import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from apps.core.throttles import AuthThrottle

User = get_user_model()

@pytest.fixture
def factory():
    return APIRequestFactory()

@pytest.fixture
def auth_throttle():
    return AuthThrottle()

@pytest.mark.django_db
class TestAuthThrottle:
    def test_get_cache_key_anonymous(self, factory, auth_throttle):
        request = factory.get('/api/v1/auth/login/')
        # DRF calls get_cache_key with (request, view)
        view = None
        key = auth_throttle.get_cache_key(request, view)
        
        assert key is not None
        assert 'auth' in key
        # Default identifier for anon is IP
        assert '127.0.0.1' in key

    def test_get_cache_key_authenticated(self, factory, auth_throttle):
        user = User.objects.create_user(email='test@example.com', username='testuser', password='password')
        request = factory.get('/api/v1/auth/login/')
        request.user = user
        view = None
        
        key = auth_throttle.get_cache_key(request, view)
        
        assert key is not None
        assert 'auth' in key
        assert str(user.id) in key
