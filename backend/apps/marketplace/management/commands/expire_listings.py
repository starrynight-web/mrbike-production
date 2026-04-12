from django.core.management.base import BaseCommand
from apps.marketplace.tasks import check_listing_expiry, notify_approaching_expiry

class Command(BaseCommand):
    help = 'Expires old listings and sends expiry notifications for marketplace bikes.'

    def handle(self, *args, **options):
        self.stdout.write("Running notify_approaching_expiry()...")
        try:
            res1 = notify_approaching_expiry()
            self.stdout.write(self.style.SUCCESS(f"Result: {res1}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error in notify_approaching_expiry: {str(e)}"))

        self.stdout.write("Running check_listing_expiry()...")
        try:
            res2 = check_listing_expiry()
            self.stdout.write(self.style.SUCCESS(f"Result: {res2}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error in check_listing_expiry: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS('Successfully completed marketplace scheduled tasks.'))
