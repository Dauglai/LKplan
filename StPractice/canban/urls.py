from django.urls import path, include
from rest_framework import routers

from .views import *

router = routers.SimpleRouter()
router.register(r'tag', TagAPIViews)
router.register(r'customization', CustomizationAPIViews)
router.register(r'status', StatusAPIViews)

task_router = routers.SimpleRouter()
task_router.register(r'checklist', CheckListAPIViews)
urlpatterns = [
    path('/', include(router.urls)),
    path('tasks/<int:pk>/', include(task_router.urls)),
    path('profile/', ProfileAPIList.as_view()),
    path('profile/update/', ProfileAPIUpdate.as_view()),
    path('tasks/create/', TaskAPICreate.as_view()),

    path('tasks/', TaskAPIList.as_view()),
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/<int:pk>/', TaskAPIUpdate.as_view()),
    path('tasks_delete/<int:pk>/', TaskAPIDestroy.as_view()),
    path('tasks/<int:id>/results/', ResultAPIListCreate.as_view()),
    path('tasks/<int:id>/grades/', GradeAPIListCreate.as_view()),
    path('tasks/<int:id>/comments/', GradeAPIListCreate.as_view()),

]