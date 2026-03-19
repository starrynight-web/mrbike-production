import bleach

def sanitize_html(content: str) -> str:
    """
    Sanitize HTML content using Bleach.
    Allows only a safe subset of tags and attributes.
    """
    if not content:
        return ""
        
    allowed_tags = [
        'p', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3'
    ]
    allowed_attrs = {
        'a': ['href', 'title', 'target'],
    }
    
    return bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )
