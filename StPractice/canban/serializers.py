from django.contrib.auth.models import User
from rest_framework import serializers
from crm.models import Profile
from crm.serializers import ProjectSerializer, ProfileSerializer
from .models import *


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
        model = Comment
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    creator = ProfileSerializer(read_only=True)
    checklist = CheckListSerializer(many=True, required=False)
    comment_set = CommentSerializer(many=True, read_only=True)
    result_set = ResultSerializer(many=True, read_only=True)
    resp_user = ProfileSerializer(read_only=True, source='responsible_user')

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'name', 'datetime', 'dateCloseTask', 'description', 'creator', 'status', 'comment_set',
            'result_set', 'parent_task',
            'responsible_user', 'checklist', 'resp_user'
        ]

    def create(self, validated_data):
        checklist_data = validated_data.pop('checklist', [])
        tags_data = validated_data.pop('tags', [])
        task = Task.objects.create(**validated_data)
        for item_data in checklist_data:
            ChecklistItem.objects.create(task=task, **item_data)
        if tags_data:
            task.tags.set(tags_data)
        return task

    def update(self, instance, validated_data):
        checklist_data = validated_data.pop('checklist', None)
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if checklist_data is not None:
            self.update_checklist(instance, checklist_data)
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
