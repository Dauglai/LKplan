from rest_framework import permissions

from crm.models import Team, Project


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.creator == request.user.profile


class IsCuratorAuthorOrReadonly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        if isinstance(obj, Team):
            curators = obj.project.curators.all()
            for curator in curators:
                if curator.user_id == request.user.id:
                    return True
            return obj.project.creator == request.user.profile
        if isinstance(obj, Project):
            curators = obj.curators.all()
            for curator in curators:
                if curator.user_id == request.user.id:
                    return True
            return obj.creator == request.user.profile
