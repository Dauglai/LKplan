from django.urls import path, include
from rest_framework import routers
from .views import *

urlpatterns = [
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/', TaskAPIList.as_view()),
    path('tasks/<int:pk>/', TaskAPIUpdate.as_view()),

    # 🔹 Комментарии
    path('tasks/<int:pk>/comments/', CommentAPIListCreate.as_view()),  # Список и создание
    path('comments/<int:pk>/', CommentAPIUpdate.as_view()),  # Редактирование и удаление

    # 🔹 Чек-листы
    path('tasks/<int:pk>/checklists/', ChecklistAPIListCreate.as_view()),  # Список и создание
    path('checklists/<int:pk>/', ChecklistAPIUpdate.as_view()),  # Редактирование и удаление

    # 🔹 Пункты чек-листов
    path('checklists/<int:pk>/checklistItems/', ChecklistItemAPIListCreate.as_view()),  # Список и создание
    path('checklistItems/<int:pk>/', ChecklistItemAPIUpdate.as_view()),  # Редактирование и удаление

    path('project/create/', ProjectAPICreate.as_view()),
    path('project/', ProjectAPIList.as_view()),
    path('project/<int:pk>', ProjectAPIUpdate.as_view()),
    path('teams/', TeamAPIListCreate.as_view()),
    path('teams/<int:pk>/', TeamAPIUpdate.as_view()),

    path('results/', ResultAPIListCreate.as_view()),
    path('results/<int:pk>/', ResultAPIUpdate.as_view()),
]
