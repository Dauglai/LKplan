from django.contrib.auth.models import User
from rest_framework import serializers
from crm.models import Profile
from crm.serializers import ProfileSerializer, DirectionSerializer
from .models import *


class CheckListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'description', 'is_completed']


class CheckListSerializer(serializers.ModelSerializer):
    checklistItems = CheckListItemSerializer(many=True, read_only=True)

    class Meta:
        model = Checklist
        fields = ['id', 'checklistItems', 'description']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ['id', 'name']


class ProjectSerializer(serializers.ModelSerializer):
    stages = StageSerializer(many=True, read_only=True)
    direction = serializers.PrimaryKeyRelatedField(queryset=Direction.objects.all(), write_only=True, required=True)
    directionSet = DirectionSerializer(source="direction", read_only=True)
    project_id = serializers.IntegerField(read_only=True, source="id")

    class Meta:
        model = Project
        fields = ['id', 'stages', 'direction', 'directionSet', 'project_id', 'name', 'description']


class TeamSerializer(serializers.ModelSerializer):
    # students = ProfileSerializer(many=True, read_only=True)
    students = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())

    class Meta:
        model = Team
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    creator = ProfileSerializer(read_only=True)
    checklist = CheckListSerializer(many=True, required=False)
    comment_set = CommentSerializer(many=True, read_only=True)
    resp_user = ProfileSerializer(read_only=True, source='responsible_user')
    project_info = ProjectSerializer(read_only=True, source='project')
    subtasks = serializers.SerializerMethodField()
    stage = serializers.CharField(source='stage.name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'name', 'start', 'end', 'description', 'creator', 'status', 'comment_set', 'parent_task',
            'responsible_user', 'checklist', 'resp_user', 'project_info', 'subtasks', 'stage'
        ]

    def get_subtasks(self, obj):
        """Метод для получения подзадач"""
        subtasks = obj.subtasks.all()  # Доступ к подзадачам через related_name
        return TaskSerializer(subtasks, many=True).data  # Сериализуем подзадачи
