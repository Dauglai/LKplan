from django.contrib.auth.models import User
from django.db import models


class Specialization(models.Model):
    name = models.CharField(verbose_name="Название", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    telegram = models.CharField(verbose_name="Telegram", max_length=100, null=True, blank=True)
    email = models.EmailField(verbose_name="Email", max_length=100, null=True, blank=True)
    surname = models.CharField(verbose_name="Фамилия", max_length=100, null=True, blank=True)
    name = models.CharField(verbose_name="Имя", max_length=100, null=True, blank=True)
    patronymic = models.CharField(verbose_name="Отчество", max_length=100, null=True, blank=True)
    course = models.IntegerField(verbose_name="Курс", null=True, blank=True)
    university = models.CharField(verbose_name="Название университета", max_length=100, null=True, blank=True)
    vk = models.CharField(verbose_name="Ссылка VK", max_length=100, null=True, blank=True)
    job = models.CharField(verbose_name="Место работы", max_length=100, null=True, blank=True)

    def __str__(self):
        return f'{self.surname} {self.name} {self.patronymic}'


class Contact(models.Model):
    CONTACT_CHOISES = (
        ("ВК", "ВК"),
        ("ТГ", "ТГ"),
        ("Почта", "Почта"),
        ("Телефон", "Телефон"),
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    type = models.CharField(verbose_name="Тип контакта", choices=CONTACT_CHOISES, max_length=100)
    data = models.CharField(verbose_name="Реквезит", max_length=100, )

    def __str__(self):
        return f'{self.profile.name}{self.type} {self.data}'


class Role(models.Model):
    ROLE_CHOISES = (
        ("Организатор", "Организатор"),
        ("Руководитель", "Руководитель"),
        ("Куратор", "Куратор"),
    )
    name = models.CharField(verbose_name="Название роли", choices=ROLE_CHOISES, default='На согласовании',max_length=50)
    users = models.ManyToManyField(Profile, related_name="users")

    def __str__(self):
        return f'{self.name}'


class Event(models.Model):
    STAGES = (
        ("Редактирование", "Редактирование"),
        ("Набор участников", "Набор участников"),
        ("Формирование команд", "Формирование команд"),
        ("Проведение мероприятия", "Проведение мероприятия"),
        ("Мероприятие завершено", "Мероприятие завершено"),)

    name = models.CharField(verbose_name="Название мероприятия", max_length=100)
    specializations = models.ManyToManyField(Specialization, related_name="specializations", verbose_name="Специализации")
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    stage = models.CharField(verbose_name="Этап", choices=STAGES, default='Редактирование', max_length=50)
    start = models.DateField(verbose_name="Дата начала")
    end = models.DateField(verbose_name="Дата окончания")
    end_app = models.DateField(verbose_name="Дата окончания приема заявок")

    def __str__(self):
        return f'{self.name}'


class OrgChat(models.Model):
    CHAT_CHOISES = (
        ("ВК", "ВК"),
        ("ТГ", "ТГ"),
    )

    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    type = models.CharField(verbose_name="Тип чата", choices=CHAT_CHOISES, max_length=100)
    name = models.CharField(verbose_name="Название чата", max_length=100)
    description = models.CharField(verbose_name="Описание чата", max_length=100)
    link = models.CharField(verbose_name="Ссылка на чат", max_length=100,)

    def __str__(self):
        return f'{self.name}'


class Status(models.Model):
    name = models.CharField(verbose_name="Название", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    is_positive = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name}'

class Status_order(models.Model):
    number = models.IntegerField(default=1, verbose_name="Позиция")
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    status = models.ForeignKey(Status, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.number}'

class Direction(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='directions')
    name = models.CharField(verbose_name="Название направления", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Application(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    project = models.ForeignKey("plan.Project", on_delete=models.CASCADE, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='applications', null=True, blank=True)
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, null=True, blank=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey("plan.Team", on_delete=models.CASCADE, null=True, blank=True)
    status = models.ForeignKey(Status, on_delete=models.CASCADE)
    message = models.TextField(verbose_name="Ваш текст", max_length=1000, null=True, blank=True)
    is_link = models.BooleanField(verbose_name="Состоит в чате?", default=False)
    is_approved = models.BooleanField(verbose_name="Заявка одобрена?", default=False)
    comment = models.CharField(verbose_name="Отзыв", max_length=1000, null=True, blank=True)
    date_sub = models.DateTimeField(verbose_name="Дата подачи", auto_now=True)
    date_end = models.DateTimeField(verbose_name="Дата изменения", null=True, blank=True)

    def __str__(self):
        return f'{self.user}'


class Test(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название теста", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    entry = models.IntegerField(verbose_name="Порог прохождения в %")

    def __str__(self):
        return f'{self.name}'


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Вопрос", max_length=1000)
    count = models.IntegerField(verbose_name="Количество баллов за вопрос")

    def __str__(self):
        return f'{self.name}'


class True_Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    true_answer = models.CharField(verbose_name="Правильный ответ", max_length=100)

    def __str__(self):
        return f'{self.true_answer}'


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    answer = models.CharField(verbose_name="Ответ", max_length=100)
    count = models.IntegerField(verbose_name="Полученный балл")

    def __str__(self):
        return f'{self.user}'

class Robot(models.Model):
    name = models.CharField(verbose_name="Название робота", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    #type_action
    #status
    #is_active
    #parameter

    def __str__(self):
        return f'{self.name}'

class Trigger(models.Model):
    name = models.CharField(verbose_name="Название триггера", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    #type_action
    #status
    #is_active
    #parameter

    def __str__(self):
        return f'{self.name}'

class FunctionOrder(models.Model):
    FUNCTION_CHOISES = (
        ("Робот", "Робот"),
        ("Триггер", "Триггер"),
    )

    position = models.IntegerField()
    type_function = models.CharField(verbose_name="Тип действия",choices=FUNCTION_CHOISES, max_length=10000,)
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE, null=True, blank=True,)
    trigger = models.ForeignKey(Trigger, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(verbose_name="Название функции", max_length=10000,)
    config = models.CharField(verbose_name="Конфигурация", max_length=10000,)
    def __str__(self):
        return f'{self.name}'
