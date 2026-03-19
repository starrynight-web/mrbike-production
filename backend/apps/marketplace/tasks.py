import logging
import io
import cloudinary.uploader
from django.core.files.base import ContentFile
from .models import UsedBikeListing, ListingImage
from .image_processor import ImageProcessingService

logger = logging.getLogger(__name__)

def process_listing_image(listing_id, image_bytes, filename, is_primary, order):
    """
    Background task to process and upload listing images.
    """
    from apps.users.services.email_service import email_service
    
    try:
        listing = UsedBikeListing.objects.get(id=listing_id)
        # ... processing remains same ...
        image_file = io.BytesIO(image_bytes)
        image_file.name = filename
        processed = ImageProcessingService.compress_and_convert(image_file)
        
        orig_result = cloudinary.uploader.upload(
            image_bytes,
            folder='mrbikebd/used-bikes/originals/',
            resource_type='image'
        )
        
        webp_io = io.BytesIO(processed['webp']['content'])
        webp_result = cloudinary.uploader.upload(
            webp_io,
            folder='mrbikebd/used-bikes/webp/',
            resource_type='image',
            public_id=f"{orig_result['public_id'].split('/')[-1]}_webp"
        )
        
        comp_io = io.BytesIO(processed['compressed']['content'])
        comp_result = cloudinary.uploader.upload(
            comp_io,
            folder='mrbikebd/used-bikes/compressed/',
            resource_type='image',
            public_id=f"{orig_result['public_id'].split('/')[-1]}_compressed"
        )
        
        ListingImage.objects.create(
            listing=listing,
            original_image=orig_result['public_id'],
            webp_image=webp_result['public_id'],
            compressed_image=comp_result['public_id'],
            is_primary=is_primary,
            order=order,
            file_size_original=len(image_bytes),
            file_size_webp=len(processed['webp']['content']),
            file_size_compressed=len(processed['compressed']['content'])
        )
        
        logger.info(f"Successfully processed image {order} for listing {listing_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to process image {order} for listing {listing_id}: {e}", exc_info=True)
        # In a real environment, we'd check attempt count from task metadata
        # For now, we log the failure clearly.
        return False
