import os
import sys
import django
import cloudinary.utils

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from cloudinary import CloudinaryResource

def test_cloudinary_logic():
    # Mock a CloudinaryResource
    res = CloudinaryResource(
        public_id='mrbikebd/used-bikes/my_bike_123',
        format='jpg',
        version=1234567890,
        type='upload',
        resource_type='image'
    )
    
    out_lines = []
    out_lines.append("--- CloudinaryResource Tests ---")
    out_lines.append(f"res.url = {res.url}")
    out_lines.append(f"str(res) = {str(res)}")
    out_lines.append(f"res.public_id = {res.public_id}")
    
    # Simulate get_image_url from bikes serializer
    public_id = str(res)
    url, options = cloudinary.utils.cloudinary_url(
        public_id,
        secure=True,
        transformation=[{'quality': 'auto', 'fetch_format': 'auto'}]
    )
    out_lines.append(f"Generated URL from str(res): {url}")
    
    # Simulate passing full path in public_id
    full_path_str = f"image/upload/v{res.version}/{res.public_id}.{res.format}"
    bad_url, _ = cloudinary.utils.cloudinary_url(
        full_path_str,
        secure=True
    )
    out_lines.append(f"Generated URL from full path: {bad_url}")

    with open("out.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))

if __name__ == "__main__":
    test_cloudinary_logic()
