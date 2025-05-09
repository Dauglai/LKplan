from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class TelegramMessageSerializer(serializers.Serializer):
    chat_id = serializers.CharField(required=True)
    message = serializers.CharField(required=True)
    parse_mode = serializers.ChoiceField(
        choices=['HTML', 'MarkdownV2', None],
        required=False,
        default=None
    )


class VKMessageSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField(required=True)
    message = serializers.CharField(required=True, max_length=4096)
    keyboard = serializers.JSONField(required=False)
    attachment = serializers.CharField(required=False)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['username'],
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
            'user_id',
        ]


class ContentTypeField(serializers.Field):
    def to_representation(self, value):
        if not value:
            return None
        # Преобразование объекта ContentType в строку "app_label.model"
        return f"{value.app_label}.{value.model}"

    def to_internal_value(self, data):
        if not data:
            return None
        # Преобразование строки "app_label.model" в объект ContentType
        try:
            app_label, model = data.split('.')
            content_type = ContentType.objects.get(
                app_label=app_label,
                model=model
            )
            return content_type
        except (ValueError, ContentType.DoesNotExist):
            raise serializers.ValidationError("Invalid content_type format. Use 'app_label.model'.")


class RoleSerializer(serializers.ModelSerializer):
    content_type = ContentTypeField(
        required=False,
        allow_null=True,
    )

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
    leader_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source='leader',
        write_only=True,
        required=False
    )

    class Meta:
        model = Direction
        fields = ['id', 'event', 'name', 'description', 'leader', 'leader_id']
        extra_kwargs = {
            'leader': {'read_only': True}
        }


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
    # creator = ProfileSerializer(read_only=True)

    specializationsSet = SpecializationSerializer(read_only=True, many=True, source="specializations")
    statusesSet = Status_AppSerializer(read_only=True, many=True, source="statuses")
    directions = DirectionSerializer(read_only=True, many=True)
    applications = ApplicationSerializer(read_only=True, many=True)
    event_id = serializers.IntegerField(read_only=True, source="id")

    class Meta:
        model = Event
        fields = [
            "name",
            "specializations",
            "description",
            "stage",
            "start",
            "end",
            "end_app",
            "specializationsSet",
            "statusesSet", "directions",
            "applications", "event_id"]


class EventCreateSerializer(serializers.ModelSerializer):
    # user = ProfileSerializer(read_only=True)
    # specializations = SpecializationSerializer(read_only=True, many=True)
    # statuses = Status_AppSerializer(read_only=True, many=True)

    class Meta:
        model = Event
        fields = ["id",
                  "name",

                  "specializations",

                  "description",

                  "stage",
                  "start",
                  "end", "end_app"]


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class StatusOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status_order
        fields = '__all__'
        extra_kwargs = {
            'number': {'min_value': 1}
        }

    def validate(self, data):
        # Проверка уникальности позиции для события
        if Status_order.objects.filter(
                event=data['event'],
                number=data['number']
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "Позиция с таким номером уже существует для этого события"
            )
        return data

    def create(self, validated_data):
        # Сдвигаем позиции при создании новой записи
        instance = super().create(validated_data)
        self._reorder_statuses(instance.event, instance.number)
        return instance

    def update(self, instance, validated_data):
        # Сдвигаем позиции при обновлении номера
        new_number = validated_data.get('number', instance.number)
        if new_number != instance.number:
            self._reorder_statuses(instance.event, new_number, exclude_pk=instance.pk)
        return super().update(instance, validated_data)

    def _reorder_statuses(self, event, new_number, exclude_pk=None):
        """Пересчет порядковых номеров"""
        qs = Status_order.objects.filter(event=event).exclude(pk=exclude_pk)
        qs.filter(number__gte=new_number).update(number=models.F('number') + 1)


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = '__all__'


class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = '__all__'


class FunctionOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = FunctionOrder
        fields = '__all__'
        extra_kwargs = {
            'position': {'min_value': 1}
        }

    def validate(self, data):
        # Проверка соответствия типа функции и объекта
        if data.get('type_function') == 'robot' and not data.get('robot'):
            raise serializers.ValidationError("Для типа 'робот' необходимо указать робота")
        if data.get('type_function') == 'trigger' and not data.get('trigger'):
            raise serializers.ValidationError("Для типа 'триггер' необходимо указать триггер")

        # Валидация уникальности позиции в рамках статус-заказа
        if FunctionOrder.objects.filter(
                status_order=data['status_order'],
                position=data['position']
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Позиция с таким номером уже существует в этом статус-заказе")

        return data

    def create(self, validated_data):
        # Сдвигаем позиции при создании новой записи
        instance = super().create(validated_data)
        self._reorder_functions(instance.status_order, instance.position)
        return instance

    def update(self, instance, validated_data):
        # Сдвигаем позиции при обновлении номера
        new_position = validated_data.get('position', instance.position)
        if new_position != instance.position:
            self._reorder_functions(instance.status_order, new_position, exclude_pk=instance.pk)
        return super().update(instance, validated_data)

    def _reorder_functions(self, status_order, new_position, exclude_pk=None):
        """Пересчет порядковых номеров"""
        qs = FunctionOrder.objects.filter(status_order=status_order).exclude(pk=exclude_pk)
        qs.filter(position__gte=new_position).update(position=models.F('position') + 1)


class OrgChatSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        help_text="ID связанного мероприятия"
    )

    class Meta:
        model = OrgChat
        fields = [
            'id',
            'event',
            'type',
            'name',
            'description',
            'link'
        ]
        extra_kwargs = {
            'type': {'help_text': "Тип чата: ВК или ТГ"},
            'link': {'max_length': 100}
        }


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
