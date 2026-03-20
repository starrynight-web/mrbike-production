from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Ensures the strict mrbikecloude@gmail.com admin user exists with correct credentials'

    def handle(self, *args, **options):
        email = "mrbikecloude@gmail.com"
        password = "mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202"
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': 'admin_mrbike',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True
            }
        )
        
        user.set_password(password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.is_email_verified = True
        user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated admin user: {email}'))
