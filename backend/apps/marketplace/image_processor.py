"""
Image Processing Pipeline for Used Bike Listings
Handles compression and WebP conversion for user-uploaded images
"""

from PIL import Image
from django.core.files.base import ContentFile
from django.db import models
import io
import os


class ImageProcessingService:
    """Service to process and convert images to WebP with compression"""
    
    # Configuration
    MAX_WIDTH = 2000
    MAX_HEIGHT = 2000
    WEBP_QUALITY = 85
    JPEG_QUALITY = 75
    COMPRESS_QUALITY = 60
    
    @classmethod
    def compress_and_convert(cls, image_file):
        """
        Process image: compress and convert to WebP format
        
        Args:
            image_file: Django UploadedFile or ImageFieldFile
            
        Returns:
            dict: {
                'original': file_path,
                'webp': webp_file_object,
                'compressed': jpg_file_object
            }
        """
        
        # Open image using context manager to ensure proper resource cleanup
        with Image.open(image_file) as src:
            # Create a persistent copy since PIL operations modify in-place
            img = src.copy() if src.mode == 'RGB' else src.convert('RGB')
        
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                rgb_img.paste(img, mask=img.split()[-1])
            else:
                rgb_img.paste(img)
            img = rgb_img
        
        # Resize if too large (maintain aspect ratio)
        img.thumbnail((cls.MAX_WIDTH, cls.MAX_HEIGHT), Image.Resampling.LANCZOS)
        
        # Get base filename without extension
        base_name = os.path.splitext(image_file.name)[0]
        
        # Save as WebP
        webp_data = cls._save_webp(img, base_name)
        
        # Save as compressed JPEG
        jpeg_data = cls._save_jpeg(img, base_name)
        
        return {
            'webp': webp_data,
            'compressed': jpeg_data,
        }
    
    @classmethod
    def _save_webp(cls, img, base_name):
        """Convert and save image as WebP"""
        webp_io = io.BytesIO()
        img.save(
            webp_io,
            format='WEBP',
            quality=cls.WEBP_QUALITY,
            method=6,  # Slower but better compression
            optimize=True
        )
        webp_io.seek(0)
        return {
            'name': f"{base_name}.webp",
            'content': ContentFile(webp_io.getvalue())
        }
    
    @classmethod
    def _save_jpeg(cls, img, base_name):
        """Compress and save image as JPEG"""
        jpeg_io = io.BytesIO()
        img.save(
            jpeg_io,
            format='JPEG',
            quality=cls.JPEG_QUALITY,
            optimize=True
        )
        jpeg_io.seek(0)
        return {
            'name': f"{base_name}_compressed.jpg",
            'content': ContentFile(jpeg_io.getvalue())
        }
    
    @classmethod
    def get_responsive_url(cls, image_obj, format_type='webp'):
        """
        Get responsive image URL based on client support
        
        Args:
            image_obj: ListingImage instance
            format_type: 'webp' or 'jpeg'
            
        Returns:
            str: URL to appropriate image format
        """
        if format_type == 'webp' and image_obj.webp_image:
            return image_obj.webp_image.url
        elif format_type == 'compressed' and image_obj.compressed_image:
            return image_obj.compressed_image.url
        return image_obj.original_image.url if image_obj.original_image else None


class ImageOptimizer:
    """Utility for frontend to serve optimized images"""
    
    @staticmethod
    def get_srcset_html(listing_image):
        """
        Generate HTML srcset for responsive images
        Usage: {% load img_tags %} {{ listing_image|srcset_html }}
        Safely handles missing image variants with fallback to original
        """
        # Get available image URLs with fallbacks
        webp_url = listing_image.webp_image.url if listing_image.webp_image else None
        compressed_url = listing_image.compressed_image.url if listing_image.compressed_image else None
        original_url = listing_image.original_image.url if listing_image.original_image else None
        
        # Use original as ultimate fallback
        fallback_url = compressed_url or original_url or ''
        
        if not original_url:
            # No images at all, return empty picture tag
            return '<picture><img src="" alt="Used bike image" loading="lazy" /></picture>'
        
        # Build picture element with available formats
        picture_html = '<picture>'
        
        if webp_url:
            picture_html += f'<source srcset="{webp_url}" type="image/webp">'
        
        picture_html += f'<img src="{fallback_url}" alt="Used bike image" loading="lazy" /></picture>'
        
        return picture_html
    
    @staticmethod
    def get_image_url_list(used_bike_listing, include_formats=None):
        """
        Get list of all image URLs for a listing
        
        Args:
            used_bike_listing: UsedBikeListing instance
            include_formats: List of formats to include ['webp', 'jpeg', 'original']
            
        Returns:
            dict: {
                'primary': {'webp': url, 'jpeg': url},
                'gallery': [{'webp': url, 'jpeg': url}, ...]
            }
        """
        if include_formats is None:
            include_formats = ['webp', 'jpeg']
        
        images = used_bike_listing.images.all().order_by('order')
        primary = None
        gallery = []
        
        for img in images:
            image_dict = {}
            
            if 'webp' in include_formats and img.webp_image:
                image_dict['webp'] = img.webp_image.url
            
            if 'jpeg' in include_formats and img.compressed_image:
                image_dict['jpeg'] = img.compressed_image.url
            
            if 'original' in include_formats and img.original_image:
                image_dict['original'] = img.original_image.url
            
            if img.is_primary:
                primary = image_dict
            else:
                gallery.append(image_dict)
        
        return {
            'primary': primary,
            'gallery': gallery
        }
