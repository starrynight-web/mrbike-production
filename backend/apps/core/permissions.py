from rest_framework import permissions
from django.conf import settings

class IsSuperAdminOnly(permissions.BasePermission):
    """
    Allows access ONLY to the specific super admin user defined by email.
    No other users (including is_superuser flag users) can access admin functionality.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Allow any superuser OR the specific designated admin email
        return request.user.is_superuser or request.user.email == settings.SUPER_ADMIN_EMAIL

class IsEmailVerified(permissions.BasePermission):
    """
    Allows access only to users who have verified their email.
    """
    message = "Email verification is required to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_email_verified)

class IsSeller(permissions.BasePermission):
    """
    Allows access to users with role seller, dealer, moderator, or admin.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['seller', 'dealer', 'moderator', 'admin']

class IsDealer(permissions.BasePermission):
    """
    Allows access only to users with role dealer, moderator, or admin.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['dealer', 'moderator', 'admin']

class IsVerifiedSeller(permissions.BasePermission):
    """
    Combined permission: Email Verified AND Seller role.
    """
    def has_permission(self, request, view):
        return IsEmailVerified().has_permission(request, view) and IsSeller().has_permission(request, view)

class IsVerifiedDealer(permissions.BasePermission):
    """
    Combined permission: Email Verified AND Dealer role.
    """
    def has_permission(self, request, view):
        return IsEmailVerified().has_permission(request, view) and IsDealer().has_permission(request, view)
