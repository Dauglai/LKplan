# from tkinter.tix import CheckList

# from Tools.scripts.generate_token import update_file
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
    author = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'name', 'surname', 'patronymic', 'course',
            'university', 'telegram', 'email', 'author', 'user_id',
        ]

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
    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False,
        allow_empty=True
    )
    responsible_user = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Profile.objects.all(), required=False
    )
    grade_set = GradeSerializer(many=True, read_only=True)
    custom_set = CustomizationSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'team', 'name', 'datetime', 'description', 'author', 'status', 'comment_set',
            'result_set', 'responsible_user', 'tags', 'dateCloseTask',
            'responsible_users_set', 'tag_set', 'grade_set', 'custom_set', 'checklist'
        ]

    def create(self, validated_data):
        checklist_data = validated_data.pop('checklist', [])
        responsible_users_data = validated_data.pop('responsible_users', [])
        tags_data = validated_data.pop('tags', [])
        task = Task.objects.create(**validated_data)
        for item_data in checklist_data:
            ChecklistItem.objects.create(task=task, **item_data)
        if responsible_users_data:
            task.responsible_users.set(responsible_users_data)
        if tags_data:
            task.tags.set(tags_data)
        return task


    def update(self, instance, validated_data):
        checklist_data = validated_data.pop('checklist', None)
        responsible_users_data = validated_data.pop('responsible_users', None)
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if checklist_data is not None:
            self.update_checklist(instance, checklist_data)
        if responsible_users_data is not None:
            instance.responsible_users.set(responsible_users_data)
        if tags_data is not None:
            instance.tags.set(tags_data)

        return instance

    def delete(self, instance):
        instance.delete()

    def update_checklist(self, instance, checklist_data):
        existing_items = {item.id: item for item in instance.checklist.all()}
        updated_item_ids = []

        for item_data in checklist_data:
            item_id = item_data.get('id')
            if item_id and item_id in existing_items:
                checklist_item = existing_items[item_id]
                for key, value in item_data.items():
                    setattr(checklist_item, key, value)
                checklist_item.save()
                updated_item_ids.append(item_id)
            else:
                ChecklistItem.objects.create(task=instance, **item_data)
        for item_id, checklist_item in existing_items.items():
            if item_id not in updated_item_ids:
                checklist_item.delete()

