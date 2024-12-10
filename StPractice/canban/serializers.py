from tkinter.tix import CheckList

from rest_framework import serializers
from .models import *


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class CheckListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'

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

