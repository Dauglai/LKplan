from django.http import HttpResponseRedirect
from django.shortcuts import render
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import generics, viewsets, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from crm.serializers import ProfileSerializer, Profile, Team
from .models import *
from .permissions import IsAuthorOrReadOnly
from .serializers import *
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter
from django_filters import BaseInFilter


class NumberInFilter(BaseInFilter, filters.NumberFilter):
    pass


class TaskAPIListPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProfileSearchAPIView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'surname']


class TaskFilter(filters.FilterSet):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    author = filters.NumberFilter(field_name='author__author__id')
    responsible_users = filters.NumberFilter(field_name='responsible_users__author__id')
    project = filters.NumberFilter(field_name='project__id')
    deadline = filters.DateFilter(field_name='deadline')
    created_after = filters.DateFilter(field_name='datetime', lookup_expr='gte')  # Начальная дата
    created_before = filters.DateFilter(field_name='datetime', lookup_expr='lte')  # Конечная дата
    task_id = filters.NumberFilter(field_name='id')
    team = filters.NumberFilter(method='filter_by_team')

    def filter_by_team(self, queryset, name, value):
        team = Team.objects.filter(id=value).first()
        if not team:
            return queryset.none()
        return queryset.filter(project=team.project)

    class Meta:
        model = Task
        fields = [
            'name', 'status', 'deadline', 'author',
            'responsible_users', 'project', 'created_after',
            'created_before', 'task_id', 'team'
        ]


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


class TaskAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class TaskAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthorOrReadOnly,)





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


class ResultAPIListCreate(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthenticated,)


class ResultAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class GradeAPIListCreate(generics.ListCreateAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = (IsAuthenticated,)


class CommentAPIListCreate(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)


class CheckListAPIListCreate(generics.ListCreateAPIView):
    queryset = ChecklistItem.objects.all()
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)


class CheckListAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = ChecklistItem.objects.all()
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)


class CheckListAPIDelete(generics.RetrieveDestroyAPIView):
    queryset = ChecklistItem.objects.all()
    serializer_class = CheckListSerializer
    permission_classes = (IsAuthenticated,)

