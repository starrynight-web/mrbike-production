import os
from rest_framework import permissions

class IsSuperAdminOnly(permissions.BasePermission):
    """
    Allows access ONLY to the specific super admin user defined by email.
    No other users (including is_superuser flag users) can access admin functionality.
    """
    SUPER_ADMIN_EMAIL = os.getenv('SUPER_ADMIN_EMAIL', 'admin_gr_s_n_r_t_e@unleft.space')

    def has_permission(self, request, view):
        # Allow access if user is authenticated AND (is a superuser OR has the specific email)
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.email == self.SUPER_ADMIN_EMAIL)
        )
