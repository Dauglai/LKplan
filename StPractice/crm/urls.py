from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
router.register(r'direction', DirectionAPIViews)
# router.register(r'A', ProjectAPIViews)
router.register(r'events', EventAPIViews)
router.register(r'application', ApplicationAPIViews)
router.register(r'app_review', App_reviewAPIViews)
router.register(r'status_app', status_AppAPIViews)
router.register(r'specialization', SpecializationAPIViews)
# router.register(r'role', RoleAPIViews)

urlpatterns = [
    # path('events/', EventAPIList.as_view()),
    # path('events/create', EventAPICreate.as_view()),
    # path('events/<int:id>', EventAPIUpdate.as_view()),
    # path('events/<int:id>', EventAPIDestroy.as_view()),
    path('project/create',ProjectAPICreate.as_view()),
    path('project/', ProjectAPIList.as_view()),
    path('project/<int:id>', ProjectAPIUpdate.as_view()),
    path('project/<int:id>', ProjectAPIDestroy.as_view()),
    path('teams/', TeamAPIList.as_view()),
    path('teams/create', TeamAPICreate.as_view()),
    path('teams/<int:id>', TeamAPIUpdate.as_view()),
    path('teams/<int:id>', TeamAPIDestroy.as_view()),
]
urlpatterns += router.urls