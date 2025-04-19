from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
router.register(r'direction', DirectionAPIViews)
# router.register(r'A', ProjectAPIViews)
# router.register(r'events', EventAPIViews)
# router.register(r'application', ApplicationAPIViews)
# router.register(r'app_review', App_reviewAPIViews)
router.register(r'status_app', status_AppAPIViews)
router.register(r'specialization', SpecializationAPIViews)
# router.register(r'role', RoleAPIViews)

urlpatterns = [
    path('events/', EventAPIList.as_view()),
    path('events/create/', EventAPICreate.as_view()),
    path('events/<int:pk>', EventAPIUpdate.as_view()),
    path('events/delete/<int:pk>', EventAPIDestroy.as_view()),
    path('application/', ApplicationAPIList.as_view()),
    path('application/create/', ApplicationAPICreate.as_view()),
    path('application/<int:pk>', ApplicationAPIUpdate.as_view()),
    path('application/delete/<int:pk>', ApplicationAPIDestroy.as_view()),
    path('profile/', ProfileAPI.as_view()),
    path('profile/update/', ProfileAPIUpdate.as_view()),
    path('profiles/', ProfilesAPIList.as_view()),
    path('profiles/<int:pk>', ProfilesAPIUpdate.as_view()),
    path('orgChat/create', OrgChatCreateAPIView.as_view()),
    path('orgChat/list', OrgChatListAPIView.as_view()),
    path('orgChat/detail/<int:pk>', OrgChatDetailAPIView.as_view()),
    path('send-message/tg/', TelegramBotAPI.as_view(), name='send-message'),
    path('send-message/vk/', VKMessagesAPI.as_view(), name='vk-send-message'),
    path('bot/tg/webhook/', bot_webhook, name='bot_webhook'),
    path('google/callback', google_auth_callback, name='google_auth_callback'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
urlpatterns += router.urls
