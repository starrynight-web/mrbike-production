import os
from rest_framework import permissions

class IsSuperAdminOnly(permissions.BasePermission):
    """
    Allows access ONLY to the specific super admin user defined by email.
    No other users (including is_superuser flag users) can access admin functionality.
    """
    SUPER_ADMIN_EMAIL = os.getenv('SUPER_ADMIN_EMAIL', '')

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Strict fallback: ONLY the specific designated super admin email
        return request.user.email == self.SUPER_ADMIN_EMAIL
