from django.contrib.auth.models import User
from rest_framework import serializers
from crm.models import Profile
from crm.serializers import ProfileSerializer, DirectionSerializer
from .models import *


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class MeetingRespondSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingRespond
        fields = '__all__'


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['name', 'link', 'team']


class CheckListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'


class CheckListSerializer(serializers.ModelSerializer):
    checklistItems = CheckListItemSerializer(many=True, read_only=True, source='items')

    class Meta:
        model = Checklist
        fields = ['id', 'checklistItems', 'name']


class CommentSerializer(serializers.ModelSerializer):
    author_info = ProfileSerializer(read_only=True, source="author")

    class Meta:
        model = Comment
        fields = ['id', 'author_info', 'content', 'task', 'author']


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class StageSerializer(serializers.ModelSerializer):
    taskIds = serializers.SerializerMethodField()

    class Meta:
        model = Stage
        fields = ['id', 'name', 'color', 'position', 'taskIds', 'project']

    def get_taskIds(self, obj):
        return list(obj.task_set.values_list('id', flat=True))


class ProjectSerializer(serializers.ModelSerializer):
    stages = StageSerializer(many=True, read_only=True)
    direction = serializers.PrimaryKeyRelatedField(queryset=Direction.objects.all(), write_only=True, required=True)
    directionSet = DirectionSerializer(source="direction", read_only=True)
    project_id = serializers.IntegerField(read_only=True, source="id")

    class Meta:
        model = Project
        fields = ['id', 'stages', 'direction', 'directionSet', 'project_id', 'name', 'description']


class TeamSerializer(serializers.ModelSerializer):
    students_info = ProfileSerializer(many=True, read_only=True, source="students")
    #students = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())
    project_info = ProjectSerializer( read_only=True)
    curator_info = ProfileSerializer(read_only=True, source="curator")

    class Meta:
        model = Team
        fields = ['id', 'name', 'students_info', 'project', 'curator_info', 'is_agreed', 'curator', 'students', 'project_info', 'chat']


class TaskSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True, source="creator")
    comment_set = CommentSerializer(many=True, read_only=True)
    resp_user = ProfileSerializer(read_only=True, source='responsible_user')
    project_info = ProjectSerializer(read_only=True, source='project')
    subtasks = serializers.SerializerMethodField()
    stage = StageSerializer(read_only=True, source='status')
    team = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'name', 'start', 'end', 'description', 'status', 'comment_set', 'parent_task',
            'responsible_user', 'resp_user', 'project_info', 'subtasks', 'stage', 'author', 'team', 'performers',
            'is_completed', 'created_at'
        ]

    def get_subtasks(self, obj):
        """Метод для получения подзадач"""
        subtasks = obj.subtasks.all()  # Доступ к подзадачам через related_name
        return TaskSerializer(subtasks, many=True).data  # Сериализуем подзадачи


    def get_team(self, obj):
        team = obj.project.team_set.filter(students=obj.creator).first()
        if team:
            return TeamSerializer(team).data
        return None