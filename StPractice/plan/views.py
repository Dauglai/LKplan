from django.http import HttpResponseRedirect
from django.shortcuts import render
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import generics, viewsets, pagination, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from crm.serializers import ProfileSerializer, Profile
from .models import *
from .permissions import IsAuthorOrReadOnly
from .serializers import *
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter
from django_filters import BaseInFilter


class NumberInFilter(BaseInFilter, filters.NumberFilter):
    pass


class ProfileSearchAPIView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'surname']

class ResultFilter(filters.FilterSet):
    team = filters.NumberFilter(field_name='team__id')

    class Meta:
        model = Result
        fields = '__all__'

class TeamFilter(filters.FilterSet):
    project = filters.NumberFilter(field_name='project__id')

    class Meta:
        model = Team
        fields = '__all__'


class TaskFilter(filters.FilterSet):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains') # Фильтрация по названию
    status = filters.CharFilter(field_name='status', lookup_expr='exact') # Фильтрация по статусу
    creator = filters.NumberFilter(field_name='creator__user_id') # Фильтрация по создателю
    responsible_user = filters.NumberFilter(field_name='responsible_user__user_id') # Фильтрация по проекту
    project = filters.NumberFilter(field_name='project__id') # Фильтрация по проекту
    deadline = filters.DateFilter(field_name='end') # Фильтрация по дедлайну
    created_after = filters.DateFilter(field_name='start', lookup_expr='gte')  # Начальная дата
    created_before = filters.DateFilter(field_name='end', lookup_expr='lte')  # Конечная дата
    task_id = filters.NumberFilter(field_name='id') # Фильтрация по id
    team = filters.NumberFilter(method='filter_by_team') # Фильтрация по команде

    def filter_by_team(self, queryset, name, value):
        # Фильтрация по команде
        team = Team.objects.filter(id=value).first()
        if not team:
            return queryset.none()
        return queryset.filter(project=team.project)

    class Meta:
        model = Task
        fields = [
            'name', 'status', 'deadline', 'creator',
            'responsible_user', 'project', 'created_after',
            'created_before', 'task_id', 'team'
        ]


class TaskAPIListPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class TaskAPIList(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TaskFilter
    pagination_class = TaskAPIListPagination


class TaskAPICreate(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user.profile)


class TaskAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)

class CommentAPIListCreate(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('pk')
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise NotFound({"error": "Task not found."})  # Возвращает 404 вместо ошибки сервера
        return Comment.objects.filter(task=task)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('pk')
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise NotFound({"error": "Task not found."})
        serializer.save(author=self.request.user.profile, task=task)

class CommentAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)

class CommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        comments = Comment.objects.filter(task=task)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user.profile, task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChecklistAPIListCreate(generics.ListCreateAPIView):
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        task_id = self.kwargs.get('pk')
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise NotFound({"error": "Task not found."})  # Возвращает 404 вместо ошибки сервера
        return Checklist.objects.filter(task=task)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('pk')
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            raise NotFound({"error": "Task not found."})
        serializer.save(task=task)


class ChecklistAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Checklist.objects.all()
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)


class ChecklistItemAPIListCreate(generics.ListCreateAPIView):
    serializer_class = CheckListItemSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        try:
            checklist = Checklist.objects.get(pk=pk)
        except Checklist.DoesNotExist:
            raise NotFound({"error": "Checklist not found."})  # Возвращает 404 вместо ошибки сервера
        return ChecklistItem.objects.filter(checklist=checklist)

    def perform_create(self, serializer):
        pk = self.kwargs.get('pk')
        try:
            checklist = Checklist.objects.get(pk=pk)
        except Checklist.DoesNotExist:
            raise NotFound({"error": "Checklist not found."})
        serializer.save(checklist=checklist)


class ChecklistItemAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChecklistItem.objects.all()
    serializer_class = CheckListItemSerializer
    permission_classes = (IsAuthenticated,)


class ProjectAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ProjectAPIList(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated,)


class ProjectAPICreate(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectCreateSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        project = serializer.save()

        # Этапы по умолчанию
        default_stages = [
            {"name": "Запланировано", "position": 1, "color": "Серый"},
            {"name": "В работе", "position": 2, "color": "Жёлтый"},
            {"name": "На проверке", "position": 3, "color": "Красный"},
            {"name": "Завершено", "position": 4, "color": "Зелёный"},
        ]

        # Создаём стадии
        for stage_data in default_stages:
            Stage.objects.create(project=project, **stage_data)


class TeamAPIListCreate(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_class = TeamFilter

class TeamAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)


class ResultAPIListCreate(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResultFilter


class ResultAPIUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)