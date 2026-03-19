from rest_framework.throttling import SimpleRateThrottle

class EmailRateThrottle(SimpleRateThrottle):
    """
    Limits the number of requests associated with a specific email address.
    """
    scope = 'email_throttle'

    def get_cache_key(self, request, view):
        email = request.data.get('email')
        if not email:
            return None

        return self.cache_format % {
            'scope': self.scope,
            'ident': email.lower()
        }
