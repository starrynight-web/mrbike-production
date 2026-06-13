import hashlib
from django.core.cache import cache
from rest_framework.response import Response

def get_cache_version_key(model_prefix):
    """
    Returns the current cache version for a given model prefix.
    """
    version_key = f"{model_prefix}_cache_version"
    version = cache.get(version_key)
    if version is None:
        version = 1
        cache.set(version_key, version, None)  # Never expires
    return version

def invalidate_model_cache(model_prefix):
    """
    Increments the cache version, effectively invalidating all keys 
    tied to this version. Old keys will be LRU evicted by Redis.
    """
    version_key = f"{model_prefix}_cache_version"
    try:
        cache.incr(version_key)
    except ValueError:
        # If it doesn't exist, set it to 2
        cache.set(version_key, 2, None)

def generate_cache_key(model_prefix, view_name, **kwargs):
    """
    Generates a versioned cache key.
    kwargs usually contains query parameters or object IDs.
    """
    version = get_cache_version_key(model_prefix)
    
    # Create a deterministic string from kwargs
    sorted_kwargs = sorted(kwargs.items())
    kwarg_string = "&".join(f"{k}={v}" for k, v in sorted_kwargs)
    
    # Hash the kwarg string to keep the key length manageable
    kwarg_hash = hashlib.md5(kwarg_string.encode('utf-8')).hexdigest()
    
    return f"{model_prefix}_v{version}_{view_name}_{kwarg_hash}"

def cache_aside_get(cache_key):
    """
    Attempts to retrieve data from cache.
    Returns Response object if found, otherwise None.
    """
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data)
    return None

def cache_aside_set(cache_key, data, timeout=60 * 15):
    """
    Saves serialized data to cache.
    Default timeout is 15 minutes to save memory on the 30MB Redis instance.
    """
    cache.set(cache_key, data, timeout)
