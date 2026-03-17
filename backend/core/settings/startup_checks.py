import os
from django.core.exceptions import ImproperlyConfigured

def check_env_vars(debug=False):
    """
    Checks for required environment variables and raises ImproperlyConfigured
    if critical ones are missing in production.
    """
    REQUIRED_VARS = [
        "SECRET_KEY",
        "DATABASE_URL",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "BREVO_API_KEY",
        "REDIS_URL",
    ]
    
    missing_vars = []
    
    for var in REQUIRED_VARS:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        if not debug:
            # In production, missing ANY of these is a failure
            raise ImproperlyConfigured(
                f"Missing required environment variables in production: {', '.join(missing_vars)}"
            )
        
        # Recommendation for Direct Supabase connection (Port 5432)
        db_url = os.getenv("DATABASE_URL", "")
        if ":6543" in db_url:
             print("WARNING: Using transaction pooler (Port 6543). Direct connection (Port 5432) is recommended for production consistency.")
        elif ":5432" not in db_url and "supabase" in db_url:
             print("WARNING: Supabase connection might not be using direct Port 5432.")
        else:
            # In development, we just warn (handled in settings files)
            pass

    return missing_vars
