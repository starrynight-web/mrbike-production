from __future__ import print_function
import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import logging
from typing import Optional
from django.conf import settings

logger = logging.getLogger(__name__)

from django.template.loader import render_to_string

class BrevoEmailService:
    """Email service using Brevo (formerly Sendinblue) Official Python SDK"""
    
    def __init__(self):
        self.api_key = os.getenv("BREVO_API_KEY", "")
        if not self.api_key:
            logger.warning("BREVO_API_KEY not set. Email functionality will be disabled.")
        else:
            logger.info(f"Brevo API initialized with key: {self.api_key[:5]}...{self.api_key[-5:]}")
        
        # Configure API key authorization
        self.configuration = sib_api_v3_sdk.Configuration()
        self.configuration.api_key['api-key'] = self.api_key
        
        self.from_email = os.getenv("DEFAULT_FROM_EMAIL", "noreply@mrbikebd.com")
        self.from_name = os.getenv("BREVO_FROM_NAME", "MrBikeBD")
        logger.info(f"Emails will be sent from: {self.from_name} <{self.from_email}>")

    def get_api_instance(self):
        return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(self.configuration))

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None
    ) -> bool:
        """
        Send an email using Brevo SDK
        """
        if not self.api_key:
            logger.error("Cannot send email: BREVO_API_KEY not configured")
            return False
            
        api_instance = self.get_api_instance()
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[sib_api_v3_sdk.SendSmtpEmailTo(email=to_email, name=to_name or to_email)],
            reply_to=sib_api_v3_sdk.SendSmtpEmailReplyTo(email=self.from_email, name=self.from_name),
            headers={
                "accept": "application/json",
                "content-type": "application/json"
            },
            html_content=html_content,
            sender=sib_api_v3_sdk.SendSmtpEmailSender(email=self.from_email, name=self.from_name),
            subject=subject
        )

        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Email sent successfully to {to_email}. Message ID: {api_response.message_id}")
            return True
        except ApiException as e:
            logger.error(f"Brevo API Error: {e.status} {e.reason} - Body: {e.body}")
            return False
        except Exception as e:
            logger.error(f"Universal Email Error for {to_email}: {str(e)}", exc_info=True)
            return False

    def send_verification_email(self, to_email: str, token: str, to_name: Optional[str] = None) -> bool:
        """Queue email verification link"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_verification_email_sync', to_email, token, to_name)
        return True

    def send_verification_email_sync(self, to_email: str, token: str, to_name: Optional[str] = None) -> bool:
        """Actual synchronous send for verification email"""
        verify_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
        context = {'name': to_name or to_email, 'verify_url': verify_url}
        html_content = render_to_string('emails/verify_email.html', context)
        return self.send_email(to_email, "Verify Your Email - MrBikeBD", html_content, to_name)

    def send_password_reset(self, to_email: str, reset_token: str, to_name: Optional[str] = None) -> bool:
        """Queue password reset email"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_password_reset_sync', to_email, reset_token, to_name)
        return True

    def send_password_reset_sync(self, to_email: str, reset_token: str, to_name: Optional[str] = None) -> bool:
        """Actual synchronous send for password reset"""
        reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
        context = {'name': to_name or to_email, 'reset_url': reset_url}
        html_content = render_to_string('emails/reset_password.html', context)
        return self.send_email(to_email, "Password Reset Request - MrBikeBD", html_content, to_name)

    def send_welcome_email(self, to_email: str, to_name: Optional[str] = None) -> bool:
        """Queue welcome email"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_welcome_email_sync', to_email, to_name)
        return True

    def send_welcome_email_sync(self, to_email: str, to_name: Optional[str] = None) -> bool:
        context = {'name': to_name or to_email, 'login_url': f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login"}
        html_content = render_to_string('emails/welcome_email.html', context)
        return self.send_email(to_email, "Welcome to MrBikeBD!", html_content, to_name)

    def send_rejection_email(self, to_email: str, listing_title: str, reason: str, listing_url: str = "", to_name: Optional[str] = None) -> bool:
        """Queue rejection email"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_rejection_email_sync', to_email, listing_title, reason, listing_url, to_name)
        return True

    def send_rejection_email_sync(self, to_email: str, listing_title: str, reason: str, listing_url: str = "", to_name: Optional[str] = None) -> bool:
        context = {'name': to_name or to_email, 'listing_title': listing_title, 'reason': reason, 'listing_url': listing_url}
        html_content = render_to_string('emails/rejection_email.html', context)
        return self.send_email(to_email, f"Listing Update: {listing_title} - MrBikeBD", html_content, to_name)

    def send_approval_email(self, to_email: str, listing_title: str, listing_url: str, to_name: Optional[str] = None) -> bool:
        """Queue approval email"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_approval_email_sync', to_email, listing_title, listing_url, to_name)
        return True

    def send_approval_email_sync(self, to_email: str, listing_title: str, listing_url: str, to_name: Optional[str] = None) -> bool:
        context = {'name': to_name or to_email, 'listing_title': listing_title, 'listing_url': listing_url}
        html_content = render_to_string('emails/approval_email.html', context)
        return self.send_email(to_email, f"Listing Approved: {listing_title} - MrBikeBD", html_content, to_name)

    def send_login_otp(self, to_email: str, otp_code: str, to_name: Optional[str] = None) -> bool:
        """Queue login OTP email"""
        from django_q.tasks import async_task
        async_task('apps.users.tasks.send_async_email', 'send_login_otp_sync', to_email, otp_code, to_name)
        return True

    def send_login_otp_sync(self, to_email: str, otp_code: str, to_name: Optional[str] = None) -> bool:
        context = {'name': to_name or to_email, 'otp_code': otp_code}
        html_content = render_to_string('emails/login_otp.html', context)
        return self.send_email(to_email, "Login Verification Code - MrBikeBD", html_content, to_name)

# Singleton instance
email_service = BrevoEmailService()
