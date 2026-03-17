from django.core.cache import cache
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

def get_otps():
    import redis
    from django.conf import settings
    
    redis_url = settings.CACHES['default']['LOCATION']
    client = redis.from_url(redis_url)
    
    keys = client.keys('*')
    print(f"Total keys in Redis: {len(keys)}")
    
    for k in keys:
        decoded_key = k.decode()
        print(f"DEBUG: Found key in Redis: {decoded_key}")
        # Try to get it via Django cache anyway
        actual_django_key = decoded_key.split(':')[-1]
        try:
            data = cache.get(actual_django_key)
            if data:
                print(f"  -> Django Value: {data}")
        except:
            pass

if __name__ == "__main__":
    get_otps()
