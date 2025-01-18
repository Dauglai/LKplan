from django.urls import path, include
from rest_framework import routers

from .views import *

router = routers.SimpleRouter()
router.register(r'tag', TagAPIViews)
router.register(r'customization', CustomizationAPIViews)
router.register(r'status', StatusAPIViews)

urlpatterns = [
    path('/', include(router.urls)),
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/', TaskAPIList.as_view()),
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/<int:pk>/', TaskAPIUpdate.as_view()),
    path('tasks_delete/<int:pk>/', TaskAPIDestroy.as_view()),
    path('tasks/<int:id>/results/', ResultAPIListCreate.as_view()),
    path('tasks/<int:id>/comments/', CommentAPIListCreate.as_view()),

]
