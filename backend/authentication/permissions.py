from rest_framework import permissions

class IsOwnerRole(permissions.BasePermission):
    """Allows access only to Owner / Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['owner', 'admin'] or request.user.is_staff))


# Alias for backward compatibility
IsAdminUserRole = IsOwnerRole


class IsOperationManagerRole(permissions.BasePermission):
    """Allows access to Operation Manager and Owner/Admin."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['owner', 'admin', 'operation_manager'])


class IsCCDRole(permissions.BasePermission):
    """Allows access to CCD staff."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ccd')


class IsPsychologistRole(permissions.BasePermission):
    """Allows access to Psychologists."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'psychologist')


class DenyCCDConfidential(permissions.BasePermission):
    """Strictly denies access to CCD staff for confidential therapy notes."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'ccd':
            return False  # HTTP 403 Forbidden for CCD on confidential endpoints
        return True
