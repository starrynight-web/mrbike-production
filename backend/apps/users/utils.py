import hashlib
import secrets

def generate_unique_username(identifier: str, UserModel, max_attempts: int = 10) -> str:
    """Generate a deterministic, unique username based on an identifier (email/phone).
    Appends a short deterministic hex suffix if collision occurs.
    """
    base = (identifier.split('@')[0] if '@' in (identifier or '') else identifier or '')[:30]
    username = base or 'user'
    attempt = 0
    while UserModel.objects.filter(username=username).exists() and attempt < max_attempts:
        seed = f"{identifier}-{attempt}"
        suffix = hashlib.sha256(seed.encode()).hexdigest()[:4]
        username = f"{base}-{suffix}"
        attempt += 1
    if UserModel.objects.filter(username=username).exists():
        # fallback: append random token
        username = f"{base}-{secrets.token_hex(3)}"
    return username
