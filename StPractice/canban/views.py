from django.http import HttpResponseRedirect
from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import *
from .permissions import IsAuthorOrReadOnly
from .serializers import *

class TaskAPIList(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

class TaskAPICreate(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)


class TaskAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class TaskAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)

class CheckListAPIViews(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)

class StatusAPIViews(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = (IsAuthenticated,)

class CustomizationAPIViews(viewsets.ModelViewSet):
    queryset = Customization.objects.all()
    serializer_class = CustomizationSerializer
    permission_classes = (IsAuthenticated,)


class TagAPIViews(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = (IsAuthenticated,)



class ResultAPICreate(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)


class ResultAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class ResultAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class GradeAPICreate(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)


class GradeAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class GradeAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class CommentAPICreate(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)


class CommentAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class CommentAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)
