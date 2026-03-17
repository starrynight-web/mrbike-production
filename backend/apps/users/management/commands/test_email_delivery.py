"""
Management command to test email delivery via Brevo API.
Usage: python manage.py test_email_delivery --to your@gmail.com
"""
import os
from django.core.management.base import BaseCommand
from apps.users.services.email_service import email_service


class Command(BaseCommand):
    help = 'Send a test email to verify Brevo configuration and deliverability.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            required=True,
            help='Recipient email address for the test email'
        )

    def handle(self, *args, **options):
        to_email = options['to']
        
        self.stdout.write(self.style.HTTP_INFO(f'\n--- MrBikeBD Email Delivery Test ---'))
        self.stdout.write(f'  API Key Set: {"YES" if os.getenv("BREVO_API_KEY") else "NO - FATAL"}')
        self.stdout.write(f'  From Email: {os.getenv("DEFAULT_FROM_EMAIL", "noreply@mrbikebd.com")}')
        self.stdout.write(f'  Frontend URL: {os.getenv("FRONTEND_URL", "NOT SET")}')
        self.stdout.write(f'  Sending test email to: {to_email}\n')
        
        # Test 1: Verification Email
        self.stdout.write('Testing: send_verification_email...')
        result = email_service.send_verification_email(
            to_email=to_email,
            token='test-token-123abc',
            to_name='Test User'
        )
        if result:
            self.stdout.write(self.style.SUCCESS('  ✅ Verification email: SENT'))
        else:
            self.stdout.write(self.style.ERROR('  ❌ Verification email: FAILED (Check logs above for Brevo error)'))
        
        # Test 2: Welcome Email
        self.stdout.write('Testing: send_welcome_email...')
        result2 = email_service.send_welcome_email(
            to_email=to_email,
            to_name='Test User'
        )
        if result2:
            self.stdout.write(self.style.SUCCESS('  ✅ Welcome email: SENT'))
        else:
            self.stdout.write(self.style.ERROR('  ❌ Welcome email: FAILED'))
        
        self.stdout.write('\n--- Summary ---')
        if result and result2:
            self.stdout.write(self.style.SUCCESS(f'All emails sent. Check {to_email} inbox (and SPAM folder).'))
        else:
            self.stdout.write(self.style.ERROR('One or more emails failed. See Django logs for Brevo API error details.'))
            self.stdout.write('\nCommon causes:')
            self.stdout.write('  1. BREVO_API_KEY not set or invalid')
            self.stdout.write('  2. Sender domain (noreply@mrbikebd.com) not verified in Brevo')
            self.stdout.write('  3. Brevo account not activated or over sending limit')
            self.stdout.write('\nFix: Go to app.brevo.com → Senders & Domains and verify your domain.')
