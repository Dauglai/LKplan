from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    # user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'telegram',
            'email',
            'surname',
            'name',
            'patronymic',
            'course',
            'university',
            'vk',
            'job',
            'specializations',
            'user_id',
        ]


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'


# class EfficiencySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Efficiency
#         fields = '__all__'

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'


class Status_AppSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status_App
        fields = '__all__'


class SupervisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    creator = ProfileSerializer(read_only=True)
    supervisor = ProfileSerializer(read_only=True)
    specializations = SpecializationSerializer(read_only=True, many=True)
    statuses = Status_AppSerializer(read_only=True, many=True)

    class Meta:
        model = Event
        fields = '__all__'

    def update(self, instance, validated_data):
        specializations_data = validated_data.pop('specializations', [])
        statuses_data = validated_data.pop('statuses', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if specializations_data is not None:
            instance.specializations.set(specializations_data)
        if statuses_data is not None:
            instance.statuses.set(statuses_data)
        return instance

    def delete(self, instance):
        instance.delete()


class EventCreateSerializer(serializers.ModelSerializer):
    # user = ProfileSerializer(read_only=True)
    # specializations = SpecializationSerializer(read_only=True, many=True)
    # statuses = Status_AppSerializer(read_only=True, many=True)

    class Meta:
        model = Event
        fields = '__all__'


class ApplicationCreateSerializer(serializers.ModelSerializer):
    # user = ProfileSerializer(read_only=True)
    # specializations = SpecializationSerializer(read_only=True, many=True)
    # statuses = Status_AppSerializer(read_only=True, many=True)

    class Meta:
        model = Application
        fields = '__all__'


class DirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direction
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    # curators = ProfileSerializer(many=True,read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
    # def create(self, validated_data):
    #     curators_data = validated_data.pop('curators', [])
    #     project = Project.objects.create(**validated_data)
    #     for curator_data in curators_data:
    #         Profile.objects.create(**curator_data)
    #     return project


class TeamSerializer(serializers.ModelSerializer):
    # students = ProfileSerializer(many=True,read_only=True)
    class Meta:
        model = Team
        fields = '__all__'
    # def create(self, validated_data):
    #     students_data = validated_data.pop('students', [])

    #     team = Team.objects.create(**validated_data)
    #     # team.students.set(students_data)
    #     return team


class ApplicationSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    direction = DirectionSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    status = Status_AppSerializer(read_only=True)

    class Meta:
        model = Application
        fields = '__all__'


# class App_reviewSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = App_review
#         fields = '__all__'


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'


class TrueAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = True_Answer
        fields = '__all__'


class ProjectCreateSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Project
        fields = '__all__'


class TeamCreateSerializer(serializers.ModelSerializer):
    # author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Team
        fields = '__all__'
# class App_reviewSerializer(serializers.ModelSerializer):
#         class Meta:
#             model = App_review
#             fields = '__all__'
