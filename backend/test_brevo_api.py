import os
import sys
import django
import logging

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

# Configure logging to see the errors from email_service
logging.basicConfig(level=logging.INFO)

from apps.users.services.email_service import email_service

def test_api_send():
    recipient = 'mrbikecloude@gmail.com'
    print(f"Testing API email to: {recipient}")
    
    # Try sending a welcome email (simplest)
    result = email_service.send_welcome_email(
        to_email=recipient,
        to_name='Test Admin'
    )
    
    if result:
        print("SUCCESS: Brevo API accepted the request.")
    else:
        print("FAILURE: Brevo API rejected the request. Check the logs above for the error body.")

if __name__ == "__main__":
    test_api_send()
