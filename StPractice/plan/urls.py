from django.urls import path, include
from rest_framework import routers
from .views import *

urlpatterns = [
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/', TaskAPIList.as_view()),
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/<int:pk>/', TaskAPIUpdate.as_view()),
    path('tasks_delete/<int:pk>/', TaskAPIDestroy.as_view()),
    path('tasks/<int:id>/comments/', CommentAPIListCreate.as_view()),

    path('project/create/', ProjectAPICreate.as_view()),
    path('project/', ProjectAPIList.as_view()),
    path('project/<int:pk>', ProjectAPIUpdate.as_view()),
    path('project/delete/<int:pk>', ProjectAPIDestroy.as_view()),
    path('teams/', TeamAPIList.as_view()),
    path('teams/create/', TeamAPICreate.as_view()),
    path('teams/<int:pk>', TeamAPIUpdate.as_view()),
    path('teams/delete/<int:pk>', TeamAPIDestroy.as_view()),

]
