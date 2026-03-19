import requests
import logging
from django.conf import settings
from django_q.tasks import async_task

logger = logging.getLogger(__name__)

def revalidate_tags(tags):
    """
    Triggers Next.js On-Demand Revalidation for specific tags.
    Runs as a background task via Django-Q to prevent blocking the request.
    """
    if not settings.REVALIDATE_SECRET:
        logger.warning("REVALIDATE_SECRET not configured, skipping ISR revalidation")
        return

    async_task(_revalidate_task, tags)

def _revalidate_task(tags):
    """
    The actual background task that makes the HTTP call to Next.js.
    """
    if isinstance(tags, str):
        tags = [tags]
    
    frontend_url = settings.FRONTEND_URL.rstrip('/')
    url = f"{frontend_url}/api/revalidate"
    
    params = {
        "secret": settings.REVALIDATE_SECRET,
        "tags": ",".join(tags)
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            logger.info(f"Successfully revalidated tags: {tags}")
        else:
            logger.error(f"Failed to revalidate tags: {tags}. Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        logger.error(f"Error during ISR revalidation for tags {tags}: {str(e)}")
