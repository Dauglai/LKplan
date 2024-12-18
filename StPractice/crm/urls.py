from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
router.register(r'direction', DirectionAPIViews)
router.register(r'project', ProjectAPIViews)
router.register(r'events', EventAPIViews)
urlpatterns = [
    # path('events/', EventAPIList.as_view()),
    # path('events/create', EventAPICreate.as_view()),
    # path('events/<int:id>', EventAPIUpdate.as_view()),
    # path('events/<int:id>', EventAPIDestroy.as_view()),
    path('teams/', TeamAPIList.as_view()),
    path('teams/create', TeamAPICreate.as_view()),
    path('teams/<int:id>', TeamAPIUpdate.as_view()),
    path('teams/<int:id>', TeamAPIDestroy.as_view()),
]
urlpatterns += router.urls