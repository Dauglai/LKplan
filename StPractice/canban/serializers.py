from tkinter.tix import CheckList

from django.contrib.auth.models import User
from rest_framework import serializers
from crm.models import Profile
from crm.serializers import ProjectSerializer
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = [ 'name', 'surname', 'patronymic', 'course', 'university', 'telegram', 'email', 'photo', 'user', ]


class CheckListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'description', 'is_completed']

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = '__all__'

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True)
    checklist = CheckListSerializer(many=True, required=False)
    comment_set = CommentSerializer(many=True, read_only=True)
    result_set = ResultSerializer(many=True, read_only=True)
    responsible_users_set = ProfileSerializer(many=True, read_only=True, source='responsible_users')
    tag_set = TagSerializer(many=True, read_only=True)
    grade_set = GradeSerializer(many=True, read_only=True)
    custom_set = CustomizationSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'name', 'datetime', 'deadline', 'description', 'author', 'status', 'comment_set',
            'result_set', 'responsible_users', 'tags', 'deadline',
            'responsible_users_set', 'tag_set', 'grade_set', 'custom_set', 'checklist'
        ]

    def create(self, validated_data):
        # Извлечение данных из запроса
        checklist_data = validated_data.pop('checklist', [])
        responsible_users_data = validated_data.pop('responsible_users', [])
        tags_data = validated_data.pop('tags', [])

        # Создание задачи
        task = Task.objects.create(**validated_data)

        # Обработка чек-листа
        for item_data in checklist_data:
            ChecklistItem.objects.create(task=task, **item_data)

        # Обработка Many-to-Many полей
        if responsible_users_data:
            task.responsible_users.set(responsible_users_data)
        if tags_data:
            task.tags.set(tags_data)

        return task

