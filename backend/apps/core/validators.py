import re
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags, escape

class DataValidator:
    """
    Utility class for validating and sanitizing user input.
    """
    
    @staticmethod
    def sanitize_string(value):
        """
        Removes HTML tags and escapes special characters.
        """
        if not value or not isinstance(value, str):
            return value
        
        # Remove HTML tags
        clean_text = strip_tags(value)
        # Escape HTML special characters
        return escape(clean_text).strip()

    @staticmethod
    def validate_phone(value):
        """
        Validates Bangladesh phone numbers (e.g., 01712345678).
        """
        if not value:
            return value
            
        pattern = r'^(?:\+8801|01)[3-9]\d{8}$'
        if not re.match(pattern, value):
            raise ValidationError("Invalid Bangladesh phone number format.")
        return value

    @classmethod
    def sanitize_dict(cls, data):
        """
        Recursively sanitizes all string values in a dictionary.
        """
        if not isinstance(data, dict):
            return data
            
        sanitized = {}
        for k, v in data.items():
            if isinstance(v, str):
                sanitized[k] = cls.sanitize_string(v)
            elif isinstance(v, dict):
                sanitized[k] = cls.sanitize_dict(v)
            elif isinstance(v, list):
                sanitized[k] = [cls.sanitize_dict(i) if isinstance(i, dict) else cls.sanitize_string(i) if isinstance(i, str) else i for i in v]
            else:
                sanitized[k] = v
        return sanitized
