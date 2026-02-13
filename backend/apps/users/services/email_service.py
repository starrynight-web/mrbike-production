"""
Brevo Email Service for MrBikeBD
Handles transactional emails (password reset, OTP, etc.)
"""
import os
import requests
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class BrevoEmailService:
    """Email service using Brevo (formerly Sendinblue) API"""
    
    BASE_URL = "https://api.brevo.com/v3/smtp/email"
    
    def __init__(self):
        self.api_key = os.getenv("BREVO_API_KEY", "")
        if not self.api_key:
            logger.warning("BREVO_API_KEY not set. Email functionality will be disabled.")
        
        self.from_email = os.getenv("BREVO_FROM_EMAIL", "noreply@mrbikebd.com")
        self.from_name = os.getenv("BREVO_FROM_NAME", "MrBikeBD")
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None
    ) -> bool:
        """
        Send an email using Brevo API
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body of the email
            to_name: Optional recipient name
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.api_key:
            logger.error("Cannot send email: BREVO_API_KEY not configured")
            return False
        
        headers = {
            "accept": "application/json",
            "api-key": self.api_key,
            "content-type": "application/json"
        }
        
        payload = {
            "sender": {
                "email": self.from_email,
                "name": self.from_name
            },
            "to": [
                {
                    "email": to_email,
                    "name": to_name or to_email
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }
        
        try:
            response = requests.post(
                self.BASE_URL,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(
                    f"Failed to send email to {to_email}. "
                    f"Status: {response.status_code}, Response: {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_password_reset(self, to_email: str, reset_token: str, to_name: Optional[str] = None) -> bool:
        """Send password reset email"""
        reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1a73e8; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background: #f9f9f9; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 30px; 
                    background: #1a73e8; 
                    color: white !important; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello{' ' + to_name if to_name else ''},</p>
                    <p>We received a request to reset your password for your MrBikeBD account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="{reset_url}" class="button">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                </div>
                <div class="footer">
                    <p>© 2026 MrBikeBD. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=to_email,
            subject="Password Reset Request - MrBikeBD",
            html_content=html_content,
            to_name=to_name
        )
    
    def send_otp(self, to_email: str, otp_code: str, to_name: Optional[str] = None) -> bool:
        """Send OTP verification email"""
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1a73e8; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background: #f9f9f9; }}
                .otp-code {{ 
                    font-size: 32px; 
                    font-weight: bold; 
                    letter-spacing: 8px; 
                    color: #1a73e8; 
                    text-align: center; 
                    padding: 20px; 
                    background: white; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verification Code</h1>
                </div>
                <div class="content">
                    <p>Hello{' ' + to_name if to_name else ''},</p>
                    <p>Your verification code for MrBikeBD is:</p>
                    <div class="otp-code">{otp_code}</div>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2026 MrBikeBD. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=to_email,
            subject="Your Verification Code - MrBikeBD",
            html_content=html_content,
            to_name=to_name
        )

# Singleton instance
email_service = BrevoEmailService()
