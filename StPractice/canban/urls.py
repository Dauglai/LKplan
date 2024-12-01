from django.urls import path, include
from .views import *

urlpatterns = [
    path('tasks/create/', TaskAPICreate.as_view()),
    path('tasks/', TaskAPIList.as_view()),

]