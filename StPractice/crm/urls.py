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
    path('send-message/', TelegramBotAPI.as_view(), name='send-message'),


]
urlpatterns += router.urls
