import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

users = User.objects.filter(is_staff=True)
print("Staff Users:")
for user in users:
    print(f"Email: {user.email}, IsSuperuser: {user.is_superuser}, Role: {user.role}, IsStaff: {user.is_staff}")
