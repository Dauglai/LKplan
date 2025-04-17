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
