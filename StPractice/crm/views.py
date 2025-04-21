import json
import time
from datetime import datetime

from django.core.mail import send_mail
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets, pagination
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.views import complete

from .serializers import *
from .models import *
from .permissions import *
from django_filters import BaseInFilter
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter
from django_filters.rest_framework.backends import DjangoFilterBackend
from django.contrib.auth import logout, authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import httpx
import requests
from django.conf import settings

from rest_framework_simplejwt.tokens import RefreshToken

from .utils import generate_password_reset_token


def get_jwt_tokens(user):
    token = RefreshToken.for_user(user)
    return {
        'refresh': str(token),
        'access': str(token.access_token),
    }


class TelegramBotAPI(APIView):
    """
    API для отправки сообщений через Telegram бота
    POST /api/send-message/
    {
        "chat_id": "123456789",
        "message": "Текст сообщения",
        "parse_mode": "HTML"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TelegramMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        bot_token = settings.TELEGRAM_BOT_TOKEN

        try:
            response = httpx.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                json={
                    "chat_id": data['chat_id'],
                    "text": data['message'],
                    "parse_mode": data['parse_mode']
                },
                timeout=10
            )
            response.raise_for_status()

            return Response({
                "status": "success",
                "message_id": response.json()['result']['message_id']
            }, status=status.HTTP_200_OK)

        except httpx.HTTPStatusError as e:
            return Response({
                "status": "error",
                "detail": f"HTTP error: {e.response.text}"
            }, status=e.response.status_code)

        except Exception as e:
            return Response({
                "status": "error",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def bot_webhook(request):
    data = request.data  # Данные от пользователя (JSON, FormData и т.д.)
    user_message = data.get('text', '')

    # Обработка сообщения (логика бота)
    response_text = f"Вы написали: {user_message}"

    return Response({'response': response_text})


class VKMessagesAPI(APIView):
    """
    API для отправки сообщений через ВКонтакте
    POST /api/vk/send-message/
    {
        "recipient_id": 123456789,
        "message": "Текст сообщения",
        "keyboard": {"buttons": [...]},  # опционально
        "attachment": "photo123_456"     # опционально
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VKMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        vk_config = settings.VK_CONFIG

        try:
            response = self.send_vk_message(
                recipient_id=data['recipient_id'],
                message=data['message'],
                keyboard=data.get('keyboard'),
                attachment=data.get('attachment'),
                access_token=vk_config['ACCESS_TOKEN'],
                api_version=vk_config['API_VERSION']
            )

            if 'error' in response:
                return Response(response['error'], status=status.HTTP_400_BAD_REQUEST)

            return Response({'message_id': response['response']}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_vk_message(self, recipient_id, message, access_token, api_version, **kwargs):
        params = {
            'access_token': access_token,
            'v': api_version,
            'random_id': self.generate_random_id(),
            'message': message,
        }

        # Определяем тип получателя
        if recipient_id > 2000000000:
            params['peer_id'] = recipient_id  # для бесед
        else:
            params['user_id'] = recipient_id  # для пользователей

        if kwargs.get('keyboard'):
            params['keyboard'] = json.dumps(kwargs['keyboard'])

        if kwargs.get('attachment'):
            params['attachment'] = kwargs['attachment']

        response = requests.post(
            'https://api.vk.com/method/messages.send',
            params=params
        )
        return response.json()

    @staticmethod
    def generate_random_id():
        return int(time.time() * 1000)


class NumberInFilter(BaseInFilter, filters.NumberFilter):
    pass


class EventAPIListPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Пользователь успешно зарегистрирован"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'пост'}, status=405)


@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)
    return JsonResponse({'error': 'Only POST'}, status=405)


class EventAPIViews(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)


class EventAPIList(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)
    # filter_backends = [SearchFilter]
    # search_fields = ['name']


class EventAPICreate(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventCreateSerializer
    permission_classes = (IsAuthenticated,)


class EventAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)


class EventAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)


class DirectionAPIViews(viewsets.ModelViewSet):
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer
    permission_classes = (IsAuthenticated,)


class ApplicationFilter(filters.FilterSet):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    # deadline = filters.DateFilter(field_name='deadline')
    user = filters.NumberFilter(field_name='user__user_id')  # фильтр по автору
    created_after = filters.DateFilter(field_name='datetime', lookup_expr='gte')  # начальная дата
    created_before = filters.DateFilter(field_name='datetime', lookup_expr='lte')  # конечная дата
    is_approved = filters.BooleanFilter(field_name='is_approved')
    is_link = filters.BooleanFilter(field_name='is_link')
    project = filters.NumberFilter(field_name='project__id')
    team = filters.NumberFilter(field_name='team__id')
    specialization = filters.NumberFilter(field_name='specialization__id')

    class Meta:
        model = Application
        fields = ['name', 'status', 'created_after', 'created_before', "is_approved", "is_link", "project", "team",
                  "specialization"]


class ApplicationAPIViews(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = (IsAuthenticated,)


class ApplicationAPIList(generics.ListAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = (IsAuthenticated,)
    filterset_class = ApplicationFilter
    # filter_backends = [SearchFilter]
    # search_fields = ['name']


class ApplicationAPICreate(generics.CreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationCreateSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.profile)


class ApplicationAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationUpdateSerializer
    permission_classes = (IsAuthenticated,)


class ApplicationAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = (IsAuthenticated,)


# class App_reviewAPIViews(viewsets.ModelViewSet):
#     queryset = App_review.objects.all()
#     serializer_class = App_reviewSerializer
#     permission_classes = (IsAuthenticated,)

class status_AppAPIViews(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = Status_AppSerializer
    permission_classes = (IsAuthenticated,)


class SpecializationAPIViews(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = (IsAuthenticated,)


class RoleAPIViews(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = (IsAuthenticated,)


class ProfileAPIViews(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)


class ProfileAPI(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Возвращает профиль текущего пользователя
        return Profile.objects.filter(user=self.request.user)


class ProfileAPIUpdate(generics.RetrieveUpdateAPIView):
    # queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Возвращает профиль текущего пользователя
        return Profile.objects.get(user=self.request.user)


class ProfilesAPIList(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [SearchFilter]
    search_fields = ['name', 'surname', 'course']


#
#
# # Импорт необходимых модулей
# import json
# from rest_framework.permissions import AllowAny, IsAuthenticated  # Права доступа DRF
# from rest_framework.views import APIView  # Базовый класс для API view
# from rest_framework.response import Response  # DRF Response объект
# from rest_framework import status, generics, viewsets, pagination  # Компоненты DRF
# from .serializers import *  # Локальные сериализаторы
# from .models import *  # Локальные модели
# from .permissions import *  # Кастомные permissions
# from django_filters import BaseInFilter  # Базовые фильтры
# from django_filters import rest_framework as filters  # Интеграция фильтров с DRF
# from rest_framework.filters import SearchFilter  # Поисковый фильтр
# from django_filters.rest_framework.backends import DjangoFilterBackend  # Бэкенд фильтров
# from django.contrib.auth import logout, authenticate, login  # Аутентификация Django
# from django.http import JsonResponse  # JSON-ответы
# from django.views.decorators.csrf import csrf_exempt  # Отключение CSRF защиты
#
#
# # Кастомный фильтр для поиска по списку чисел
# class NumberInFilter(BaseInFilter, filters.NumberFilter):
#     pass
#
#
# # Пагинация для списка событий
# class EventAPIListPagination(pagination.PageNumberPagination):
#     page_size = 10  # Количество элементов на странице
#     page_size_query_param = 'page_size'  # Параметр для изменения размера страницы
#     max_page_size = 100  # Максимальный размер страницы
#
#
# # Регистрация пользователя
# class RegisterView(APIView):
#     permission_classes = [AllowAny]  # Доступ без аутентификации
#
#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)  # Валидация данных
#         if serializer.is_valid():
#             serializer.save()  # Создание пользователя
#             return Response({"message": "Пользователь успешно зарегистрирован"},
#                             status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
# # Вход пользователя (CSRF отключен для внешних запросов)
# @csrf_exempt
# def login_view(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)  # Парсинг JSON
#         username = data.get('username')
#         password = data.get('password')
#         user = authenticate(request, username=username, password=password)  # Аутентификация
#         if user:
#             login(request, user)  # Создание сессии
#             return JsonResponse({'message': 'Login successful'}, status=200)
#         return JsonResponse({'error': 'Invalid credentials'}, status=401)
#     return JsonResponse({'error': 'пост'}, status=405)
#
#
# # Выход пользователя
# @csrf_exempt
# def logout_view(request):
#     if request.method == 'POST':
#         logout(request)  # Завершение сессии
#         return JsonResponse({'message': 'Logout successful'}, status=200)
#     return JsonResponse({'error': 'Only POST'}, status=405)
#
#
# # CRUD для событий (ModelViewSet)
# class EventAPIViews(viewsets.ModelViewSet):
#     queryset = Event.objects.all()  # Базовый QuerySet
#     serializer_class = EventSerializer  # Сериализатор
#     permission_classes = (IsAuthenticated,)  # Требуется аутентификация
#
#
# # Список событий с пагинацией
# class EventAPIList(generics.ListAPIView):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     permission_classes = (IsAuthenticated,)
#     # pagination_class = EventAPIListPagination  # Раскомментировать для пагинации
#
#
# # Создание события
# class EventAPICreate(generics.CreateAPIView):
#     queryset = Event.objects.all()
#     serializer_class = EventCreateSerializer  # Специальный сериализатор для создания
#     permission_classes = (IsAuthenticated,)
#
#     def perform_create(self, serializer):
#         serializer.save(creator=self.request.user.profile)  # Привязка к текущему пользователю
#
#
# # Обновление события
# class EventAPIUpdate(generics.RetrieveUpdateAPIView):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     permission_classes = (IsAuthorOrReadOnly,)  # Кастомное право доступа
#
#
# # Удаление события
# class EventAPIDestroy(generics.RetrieveDestroyAPIView):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     permission_classes = (IsAuthorOrReadOnly,)
#
#
# # Фильтр для заявок
# class ApplicationFilter(filters.FilterSet):
#     name = filters.CharFilter(field_name='name', lookup_expr='icontains')  # Поиск по части имени
#     status = filters.CharFilter(field_name='status', lookup_expr='iexact')  # Точный поиск статуса
#     created_after = filters.DateFilter(field_name='datetime', lookup_expr='gte')  # Диапазон дат
#     created_before = filters.DateFilter(field_name='datetime', lookup_expr='lte')
#     is_approved = filters.BooleanFilter(field_name='is_approved')  # Булевы фильтры
#     is_link = filters.BooleanFilter(field_name='is_link')
#     project = filters.NumberFilter(field_name='project__id')  # Фильтр по внешним ключам
#     team = filters.NumberFilter(field_name='team__id')
#     specialization = filters.NumberFilter(field_name='specialization__id')
#
#     class Meta:
#         model = Application
#         fields = ['name', 'status', 'created_after', 'created_before',
#                   "is_approved", "is_link", "project", "team", "specialization"]
#
#
# # Профиль текущего пользователя
# class ProfileAPI(generics.ListAPIView):
#     serializer_class = ProfileSerializer
#     permission_classes = (IsAuthenticated,)
#
#     def get_queryset(self):
#         return Profile.objects.filter(user=self.request.user)  # Только свой профиль
#
#
# # Обновление профиля
# class ProfileAPIUpdate(generics.RetrieveUpdateAPIView):
#     serializer_class = ProfileSerializer
#     permission_classes = (IsAuthorOrReadOnly,)
#
#     def get_object(self):
#         return Profile.objects.get(user=self.request.user)  # Получение текущего профиля
#
#
# # Управление статусами заказов
# class StatusOrderViewSet(viewsets.ModelViewSet):
#     queryset = Status_order.objects.all()
#     serializer_class = StatusOrderSerializer
#
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         event_id = self.request.query_params.get('event_id')  # Фильтр по event_id
#         if event_id:
#             queryset = queryset.filter(event_id=event_id)
#         return queryset.order_by('number')  # Сортировка по номеру
#
#     def perform_destroy(self, instance):
#         super().perform_destroy(instance)
#         # Корректировка номеров после удаления
#         Status_order.objects.filter(
#             event=instance.event,
#             number__gt=instance.number
#         ).update(number=models.F('number') - 1)
#
#
# # Управление роботами
# class RobotViewSet(viewsets.ModelViewSet):
#     queryset = Robot.objects.all()
#     serializer_class = RobotSerializer
#     filterset_fields = ['type_action', 'status']  # Автоматическая фильтрация

class ProfilesAPIUpdate(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)


class OrgChatCreateAPIView(generics.CreateAPIView):
    queryset = OrgChat.objects.all()
    serializer_class = OrgChatSerializer
    permission_classes = [IsAuthenticated]


class OrgChatListAPIView(generics.ListAPIView):
    queryset = OrgChat.objects.all()
    serializer_class = OrgChatSerializer
    permission_classes = [IsAuthenticated]


class OrgChatDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrgChat.objects.all()
    serializer_class = OrgChatSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])
def google_auth_callback(request):
    user = request.user
    # Генерация токена (JWT)
    tokens = get_jwt_tokens(user)

    # Перенаправление на фронтенд с токеном
    frontend_url = f'https://meetuppoint.ru/login-success?access={tokens["access"]}&refresh={tokens["refresh"]}'
    return redirect(frontend_url)


@permission_classes([AllowAny])
class EmailVerificationView(APIView):
    @swagger_auto_schema(
        operation_description="Верификация email по токену",
        manual_parameters=[
            openapi.Parameter(
                'token',
                openapi.IN_QUERY,
                description="Токен верификации, отправленный на email",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            302: openapi.Response(
                description="Перенаправление на страницу статуса верификации",
                examples={
                    "application/json": {
                        "redirect": "https://meetuppoint.ru/email-verified?status={success|expired|invalid}"
                    }
                }
            )
        }
    )
    def get(self, request):

        token = request.GET.get('token')
        try:
            contact = Contact.objects.get(verified_token=token, type="Почта")

            # Проверка срока действия токена (24 часа)
            if (timezone.now() - contact.token_created_at).total_seconds() > 86400:
                return redirect('https://meetuppoint.ru/email-verified?status=expired')

            contact.is_verified = True
            contact.verified_token = None
            contact.token_created_at = None
            contact.save()
            return redirect('https://meetuppoint.ru/email-verified?status=success')

        except Contact.DoesNotExist:
            return redirect('https://meetuppoint.ru/email-verified?status=invalid')


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="""
        Запрос на сброс пароля. При успешном запросе на указанный email будет отправлена ссылка для сброса пароля.
        Ссылка действительна в течение 1 часа.

        Требования к email:
        - Должен быть валидным email адресом
        - Должен соответствовать зарегистрированному пользователю
        """,

        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format='email',
                    description="Email пользователя для сброса пароля",
                    example="user@example.com"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Письмо для сброса пароля отправлено",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Статус операции",
                            example="reset email sent"
                        )
                    }
                )
            ),
            404: openapi.Response(
                description="Пользователь не найден",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Сообщение об ошибке",
                            example="User not found"
                        )
                    }
                )
            ),
            400: openapi.Response(
                description="Неверные входные данные",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'email': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(type=openapi.TYPE_STRING),
                            description="Ошибки валидации email"
                        )
                    }
                )
            )
        }
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(username=email)
            profile = Profile.objects.get(user=user)

            # Генерация и сохранение токена
            profile.password_reset_token = generate_password_reset_token()
            profile.password_reset_token_created = timezone.now()
            profile.save()

            # Отправка письма
            reset_url = '/password-reset/confirm/' + f'?token={profile.password_reset_token}'
            full_url = f"https://meetuppoint.ru{reset_url}"

            send_mail(
                'Восстановление пароля',
                f'Для сброса пароля перейдите по ссылке: {full_url}',
                'no-reply@meetuppoint.ru',
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({'status': 'reset email sent'})

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Подтверждение сброса пароля по токену",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['token', 'new_password'],
            properties={
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Токен сброса пароля, полученный по email",
                    example="nH1NveX7WYUDhQXYG7fvSTuWED4bHCciY43XpOC4m6utZMKosljUcrHBmX3mm2mac"
                ),
                'new_password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format='password',
                    description="Новый пароль (должен соответствовать требованиям безопасности)",
                    min_length=8,
                    example="SecurePassword123!"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Пароль успешно обновлен",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Статус операции",
                            example="password updated"
                        )
                    }
                )
            ),
            400: openapi.Response(
                description="Ошибки при сбросе пароля",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Сообщение об ошибке",
                            enum=['Token expired', 'Invalid token', 'Invalid password'],
                            example="Token expired"
                        ),
                        'details': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            description="Детали ошибок валидации",
                            properties={
                                'new_password': openapi.Schema(
                                    type=openapi.TYPE_ARRAY,
                                    items=openapi.Schema(type=openapi.TYPE_STRING),
                                    description="Ошибки валидации пароля"
                                )
                            }
                        )
                    }
                )
            )
        }
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            profile = Profile.objects.get(password_reset_token=token)
            user = profile.user

            # Проверка срока действия токена
            if (timezone.now() - profile.password_reset_token_created).total_seconds() > 3600:
                return Response({'error': 'Token expired'}, status=400)

            # Обновление пароля
            user.set_password(new_password)
            profile.password_reset_token = None
            profile.password_reset_token_created = None
            user.save()
            profile.save()

            return Response({'status': 'password updated'})

        except User.DoesNotExist or Profile.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=400)
