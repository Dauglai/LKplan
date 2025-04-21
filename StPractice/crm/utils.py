from django.contrib.contenttypes.models import ContentType
from django.utils.crypto import get_random_string
from datetime import datetime, timedelta


def generate_verification_token():
    return get_random_string(64)


def get_token_expiration():
    return datetime.now() + timedelta(hours=24)


def generate_password_reset_token():
    return get_random_string(65)


def get_password_reset_expiration():
    return datetime.now() + timedelta(hours=1)  # Токен действует 1 час


def has_role(user, role_type, obj=None):
    """
    Проверяет наличие роли у пользователя.
    Для глобальных ролей (admin) не требует объекта.
    Для объектных ролей требует указания объекта.
    """
    filters = {
        'user': user,
        'role_type': role_type,
    }

    if obj is not None:
        filters.update({
            'content_type': ContentType.objects.get_for_model(obj),
            'object_id': obj.id
        })
    else:
        filters['content_type__isnull'] = True
        filters['object_id__isnull'] = True

    from crm.models import Role
    return Role.objects.filter(**filters).exists()
