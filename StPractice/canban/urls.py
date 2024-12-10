from django.urls import path, include
from rest_framework import routers

from .views import *

router = routers.SimpleRouter()
router.register(r'checklist', CheckListAPIViews)
router.register(r'tag', TagAPIViews)
router.register(r'customization', CustomizationAPIViews)
router.register(r'status', StatusAPIViews)

urlpatterns = [
    path('tasks/', include(router.urls)),
    path('profile/', ProfileAPIList.as_view()),
    path('profile/update/', ProfileAPIUpdate.as_view()),
    path('tasks/create/', TaskAPICreate.as_view()),

    path('tasks/', TaskAPIList.as_view()),
    path('tasks/create', TaskAPICreate.as_view()),
    path('tasks/<int:id>', TaskAPIUpdate.as_view()),
    path('tasks_delete/<int:id>', TaskAPIDestroy.as_view()),
    path('tasks/<int:id>/results/', ResultAPIListCreate.as_view()),
    path('tasks/<int:id>/grades/', GradeAPIListCreate.as_view()),
    path('tasks/<int:id>/comments/', GradeAPIListCreate.as_view()),

]