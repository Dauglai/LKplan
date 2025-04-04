# Импорт стандартного административного интерфейса Django
from django.contrib import admin

# Импорт функций для работы с URL-маршрутизацией
from django.urls import path, include, re_path

# Импорт системы роутеров Django REST Framework
from rest_framework import routers

# Импорт компонентов для генерации Swagger/OpenAPI документации
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Импорт системы разрешений Django REST Framework
from rest_framework import permissions

# Импорт JWT-аутентификации из simplejwt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # Получение JWT токена
    TokenRefreshView,  # Обновление JWT токена
    TokenVerifyView,  # Валидация JWT токена
)

# Импорт кастомных представлений из приложения crm
from crm.views import RegisterView, login_view, logout_view

# Конфигурация Swagger/OpenAPI документации
schema_view = get_schema_view(
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        description="Test description",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,)
)

# Основной список URL-маршрутов проекта
urlpatterns = [
    # OAuth2 аутентификация через drf_social_oauth2
    path('api/auth/', include('drf_social_oauth2.urls')),

    # Социальная аутентификация через social_django
    path('api/auth/', include('social_django.urls', namespace='social')),

    # Административная панель Django
    path('admin/', admin.site.urls),

    # JWT-аутентификация
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Получение токена
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Обновление токена

    # Регистрация пользователя
    path('api/register/', RegisterView.as_view(), name='register'),

    # Включение URL-ов из приложений
    path('api/', include('crm.urls')),  # Маршруты CRM-системы
    path('api/', include('plan.urls')),  # Маршруты модуля планирования

    # Swagger документация в форматах JSON/YAML
    re_path(
        r'^swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(cache_timeout=0),
        name='schema-json'
    ),

    # Swagger UI интерфейс
    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),

    # Redoc документация
    path(
        'redoc/',
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc'
    ),
]

# Особенности конфигурации:
# 1. Использование двух систем аутентификации (JWT и OAuth2)
# 2. Интеграция Swagger для API документации
# 3. Модульная структура с включением URL из приложений
# 4. Закомментированные пути (token/verify, login/logout) можно активировать при необходимости
# 5. Настройки безопасности: public документация с AllowAny разрешением
# 6. Версионирование API через default_version
# 7. Использование re_path для работы с регулярными выражениями в URL
