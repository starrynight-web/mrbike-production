import pytest
from apps.users.models import User

@pytest.mark.django_db
def test_user_creation():
    """Verify that a user can be created with email as username."""
    email = "test@mrbikebd.com"
    user = User.objects.create_user(email=email, password="password123", username="testuser")
    assert user.email == email
    assert user.check_password("password123")
    assert user.is_email_verified is False

@pytest.mark.django_db
def test_superuser_creation():
    """Verify that a superuser has correct flags."""
    email = "admin@mrbikebd.com"
    user = User.objects.create_superuser(email=email, password="password123", username="admin")
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.is_email_verified is True
