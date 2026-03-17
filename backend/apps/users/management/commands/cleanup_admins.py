from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class Command(BaseCommand):
    help = 'Delete legacy and placeholder admin accounts'

    def handle(self, *args, **options):
        # Accounts specifically requested/identified for removal
        legacy_emails = [
            'admin_gr_s_n_r_t_e@unleft.space',
            'super_tester@mrbikebd.com',
            'admin@mrbikebd.com',
            'demo@mrbikebd.com'
        ]
        
        deleted_count = 0
        for email in legacy_emails:
            try:
                user = User.objects.get(email=email)
                user.delete()
                self.stdout.write(self.style.SUCCESS(f"Deleted user: {email}"))
                deleted_count += 1
            except User.DoesNotExist:
                self.stdout.write(f"User {email} not found, skipping.")
                
        # Also hunt for any other super/admin accounts that shouldn't be there
        # but keep it safe for now - only delete known legacy ones.
        
        self.stdout.write(self.style.SUCCESS(f"Total deleted: {deleted_count} accounts."))
