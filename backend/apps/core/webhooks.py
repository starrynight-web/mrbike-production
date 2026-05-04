import requests
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def trigger_revalidation(path):
    """
    Pings the Next.js revalidate endpoint to purge cache for a specific path.
    """
    secret = os.getenv("REVALIDATE_SECRET")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    if not secret:
        logger.warning("[ISR] Skip revalidation: REVALIDATE_SECRET missing")
        return False

    # Ensure path starts with /
    if not path.startswith('/'):
        path = f'/{path}'

    url = f"{frontend_url}/api/revalidate"
    params = {
        "secret": secret,
        "path": path
    }

    try:
        # Use a POST request as defined in Next.js route
        response = requests.post(url, params=params, timeout=5)
        if response.status_code == 200:
            logger.info(f"[ISR] Successfully triggered revalidation for: {path}")
            return True
        else:
            logger.error(f"[ISR] Failed to revalidate {path}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"[ISR] Connection error while revalidating {path}: {str(e)}")
        return False
