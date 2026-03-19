import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.users.models import User

# Verify existing admin
admin_user = User.objects.filter(email='admin@mrbikebd.com').first()
if admin_user:
    admin_user.is_email_verified = True
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.role = 'admin'
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"Verified, reset password, and set role='admin' for: {admin_user.email}")
else:
    # Create new one if somehow missing (though createsuperuser failed before)
    User.objects.create_superuser('admin@mrbikebd.com', 'admin123', username='admin')
    print("Created and verified new admin: admin@mrbikebd.com / admin123")

# Verify all users for testing ease?
# User.objects.all().update(is_email_verified=True)
