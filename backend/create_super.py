import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()
email = 'admin@example.com'
password = 'adminpassword123'
username = 'admin'

user = User.objects.filter(email=email).first()
if not user:
    User.objects.create_superuser(
        email=email,
        username=username,
        password=password
    )
    print(f"Superuser created successfully: {email}")
else:
    user.set_password(password)
    user.save()
    print(f"Superuser password updated: {email}")
