import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()
email = 'admin_gr_s_n_r_t_e@unleft.space'
password = 'admin_gr_s_n_r_t_e@27-07-16-20'
username = 'superadmin'

user = User.objects.filter(email=email).first()
if not user:
    User.objects.create_superuser(
        email=email,
        username=username,
        password=password,
        first_name='Super',
        last_name='Admin',
        role='admin'
    )
    print(f"Superadmin created successfully: {email}")
else:
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.role = 'admin'
    user.save()
    print(f"Superadmin updated: {email}")
