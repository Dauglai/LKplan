from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from .models import Event, Direction
from plan.models import Project
from .utils import has_role


def role_required(role_type, model=None):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            obj = None
            if model:
                obj_id = kwargs.get(f'{model}_id')
                if model == 'event':
                    obj = get_object_or_404(Event, id=obj_id)
                elif model == 'direction':
                    obj = get_object_or_404(Direction, id=obj_id)
                elif model == 'project':
                    obj = get_object_or_404(Project, id=obj_id)

            if has_role(request.user, role_type, obj):
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden("Доступ запрещен")

        return wrapper

    return decorator
