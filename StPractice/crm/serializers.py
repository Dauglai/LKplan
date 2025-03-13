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
        model = Status
        fields = '__all__'


class SupervisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
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





class EventAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class ApplicationSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    event = EventAppSerializer(read_only=True)
    direction = DirectionSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    status = Status_AppSerializer(read_only=True)

    class Meta:
        model = Application
        fields = "__all__"
        # ref_name = "AppEventSer"


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), required=False)
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(), required=False)
    direction = serializers.PrimaryKeyRelatedField(queryset=Direction.objects.all(), required=False)
    specialization = serializers.PrimaryKeyRelatedField(queryset=Specialization.objects.all(), required=False)
    status = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), required=False)

    class Meta:
        model = Application
        fields = "__all__"


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



class EventSerializer(serializers.ModelSerializer):
    creator = ProfileSerializer(read_only=True)
    supervisorOne = ProfileSerializer(read_only=True, source="supervisor")
    specializationsSet = SpecializationSerializer(read_only=True, many=True, source="specializations")
    statusesSet = Status_AppSerializer(read_only=True, many=True, source="statuses")
    directions = DirectionSerializer(read_only=True, many=True)
    applications = ApplicationSerializer(read_only=True, many=True)
    event_id = serializers.IntegerField(read_only=True, source="id")

    class Meta:
        model = Event
        fields = ["creator",
                  "name",
                  "supervisor",
                  "specializations",
                  "statuses",
                  "description",
                  "link",
                  "stage",
                  "start",
                  "end", "supervisorOne",
                  "specializationsSet",
                  "statusesSet", "directions",
                  "applications", "event_id"]


class EventCreateSerializer(serializers.ModelSerializer):
    # user = ProfileSerializer(read_only=True)
    # specializations = SpecializationSerializer(read_only=True, many=True)
    # statuses = Status_AppSerializer(read_only=True, many=True)

    class Meta:
        model = Event
        fields = '__all__'

