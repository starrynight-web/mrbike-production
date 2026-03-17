import os
import sys
import django
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

def test_api_direct():
    api_key = os.getenv("BREVO_API_KEY", "")
    from_email = os.getenv("DEFAULT_FROM_EMAIL", "noreply@mrbikebd.com")
    
    print(f"Testing Brevo API Key: {api_key[:10]}...")
    print(f"From Email: {from_email}")
    
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[sib_api_v3_sdk.SendSmtpEmailTo(email='mrbikecloude@gmail.com', name='Test')],
        html_content='<html><body><h1>Test</h1></body></html>',
        sender=sib_api_v3_sdk.SendSmtpEmailSender(email=from_email, name='MrBikeBD'),
        subject='Direct API Test'
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"SUCCESS: {api_response}")
    except ApiException as e:
        print(f"BREVO API ERROR: {e.status} {e.reason}")
        print(f"BODY: {e.body}")
    except Exception as e:
        print(f"OTHER ERROR: {e}")

if __name__ == "__main__":
    test_api_direct()
