from rest_framework import permissions

class IsSuperAdminOnly(permissions.BasePermission):
    """
    Allows access only to the specific super admin user defined by email.
    """
    SUPER_ADMIN_EMAIL = 'admin_gr_s_n_r_t_e@unleft.space'

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_staff and 
            request.user.email == self.SUPER_ADMIN_EMAIL
        )
