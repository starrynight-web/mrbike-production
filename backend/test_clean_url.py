import os
import sys
import django
import cloudinary.utils

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

def get_clean_url(image_field):
    if not image_field:
        return None
        
    # First, try native url attribute (most reliable if it's a true CloudinaryResource)
    if hasattr(image_field, 'url') and image_field.url:
        url = image_field.url
        # Ensure it's secure
        if url.startswith('http://'):
            url = url.replace('http://', 'https://')
        return url
        
    # Fallback to string processing
    public_id = str(image_field)
    if not public_id or public_id == 'None':
        return None
        
    # Strip any image/upload/ prefixes if mistakenly stored in DB
    if "image/upload/" in public_id:
        public_id = public_id.split("image/upload/")[-1]
        
    # Strip version tags (e.g., v123456789/)
    import re
    public_id = re.sub(r'^v\d+/', '', public_id)
    
    # Strip file extensions as Cloudinary transformations work best without them
    if '.' in public_id:
        public_id = public_id.rsplit('.', 1)[0]
        
    try:
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            secure=True,
            transformation=[{'quality': 'auto', 'fetch_format': 'auto'}]
        )
        return url
    except Exception:
        return None

def test():
    bad_str = "image/upload/v1741700412/mrbikebd/used-bikes/xnt1rpfpsivty87m"
    url = get_clean_url(bad_str)
    print(f"Clean URL: {url}")

if __name__ == "__main__":
    test()
