from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a secure superuser from environment variables'

    def handle(self, *args, **options):
        email = os.getenv('ADMIN_EMAIL')
        password = os.getenv('ADMIN_PASSWORD')
        
        if not email or not password:
            self.stdout.write(self.style.ERROR("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment."))
            return

        user, created = User.objects.get_or_create(email=email)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_email_verified = True
        user.role = 'admin'
        user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f"Successfully created superuser: {email}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully updated superuser: {email}"))
