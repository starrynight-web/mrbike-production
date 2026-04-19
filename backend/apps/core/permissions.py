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

def IsStaffWithRole(role_keys):
    """
    Factory that returns a permission class that allows super admin
    OR a staff member with a specific role (or one of several roles).
    """
    if isinstance(role_keys, str):
        role_keys = [role_keys]

    class _Permission(permissions.BasePermission):
        def has_permission(self, request, view):
            if not (request.user and request.user.is_authenticated):
                return False
            
            # Super admin always passes
            if request.user.email == os.getenv('SUPER_ADMIN_EMAIL'):
                return True
                
            # Check staff profile
            try:
                # Check if any of the user's sections overlap with the required role_keys
                user_sections = request.user.staff_profile.sections or []
                return request.user.staff_profile.is_active and any(s in role_keys for s in user_sections)
            except Exception:
                return False
                
    return _Permission

class IsAnyStaffOrSuperAdmin(permissions.BasePermission):
    """
    Allows access to super admin OR any active staff member.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        if request.user.email == os.getenv('SUPER_ADMIN_EMAIL'):
            return True
            
        try:
            return request.user.staff_profile.is_active
        except Exception:
            return False
