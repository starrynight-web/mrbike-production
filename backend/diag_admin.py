import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth import get_user_model

def diag_user():
    User = get_user_model()
    email = 'mrbikecloude@gmail.com'
    u = User.objects.filter(email=email).first()
    
    if not u:
        print(f"ERROR: User {email} not found.")
        # List all staff/superusers to see who exists
        admins = User.objects.filter(is_staff=True)
        print(f"Available admins: {[user.email for user in admins]}")
        return

    print(f"User Found: {u.email}")
    print(f"Is Staff: {u.is_staff}")
    print(f"Is Superuser: {u.is_superuser}")
    print(f"Is Active: {u.is_active}")
    print(f"Has Usable Password: {u.has_usable_password()}")
    
    # Check for 2FA related fields
    # We added totp_secret in previous steps
    totp_secret = getattr(u, 'totp_secret', 'N/A')
    print(f"TOTP Secret: {totp_secret}")

if __name__ == "__main__":
    diag_user()
