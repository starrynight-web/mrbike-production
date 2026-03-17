import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth import get_user_model

def enforce_single_admin():
    User = get_user_model()
    admin_email = 'mrbikecloude@gmail.com'
    admin_pass = 'mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202'
    
    print(f"Enforcing single admin policy for: {admin_email}")
    
    # 1. Update or Create the targeted admin
    user, created = User.objects.update_or_create(
        email=admin_email,
        defaults={
            'username': 'mrbike_admin',
            'is_staff': True,
            'is_superuser': True,
            'is_email_verified': True,
            'is_active': True,
            'role': 'admin'
        }
    )
    user.set_password(admin_pass)
    # Ensure 2FA secret is reset so they have to set it up (as per requirement)
    user.totp_secret = None
    user.save()
    
    if created:
        print(f"Created new admin account: {admin_email}")
    else:
        print(f"Updated existing admin account: {admin_email}")

    # 2. Remove staff/superuser status from all other accounts
    other_admins = User.objects.exclude(email=admin_email).filter(models.Q(is_staff=True) | models.Q(is_superuser=True))
    count = other_admins.count()
    
    # Actually demote them instead of deleting if they are just users, 
    # but the user said "Only this account will be the admin account"
    # To be safe, we demote them.
    for other in other_admins:
        print(f"Demoting account: {other.email}")
        other.is_staff = False
        other.is_superuser = False
        if other.role == 'admin':
            other.role = 'user'
        other.save()
        
    print(f"Demoted {count} other administrative accounts.")
    print("Security policy enforced.")

if __name__ == "__main__":
    from django.db import models
    enforce_single_admin()
