import os
import sys
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

def test_send():
    print(f"Testing email from: {settings.DEFAULT_FROM_EMAIL}")
    print(f"SMTP Host: {settings.EMAIL_HOST}")
    print(f"SMTP User: {settings.EMAIL_HOST_USER}")
    
    try:
        subject = 'MrBikeBD Test Email'
        message = 'This is a test email from the MrBikeBD diagnosis script.'
        recipient_list = ['mrbikecloude@gmail.com'] # Test sending to self
        
        result = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=False,
        )
        print(f"Send mail result: {result}")
        if result == 1:
            print("SUCCESS: Django reports email was sent.")
        else:
            print("FAILURE: Django reports email was not sent.")
            
    except Exception as e:
        print(f"ERROR: Failed to send email: {e}")

if __name__ == "__main__":
    test_send()
