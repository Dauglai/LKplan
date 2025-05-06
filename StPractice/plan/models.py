from datetime import datetime
from django.db import models
from django.utils.termcolors import RESET
from crm.models import Profile, Direction


class Project(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название проекта", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Team(models.Model):
    curator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='curator')
    name = models.CharField(verbose_name="Название", max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    students = models.ManyToManyField(Profile, blank=True, related_name="teams")
    is_agreed = models.BooleanField(default=False)
    chat = models.CharField(verbose_name="Ссылка на командный чат", max_length=1000, null=True, blank=True)
    drive = models.CharField(verbose_name="Ссылка на гугл диск", max_length=1000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'

class Result(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    is_final = models.BooleanField(verbose_name="Конечный результат", default=False)
    name = models.CharField(verbose_name="Название ссылки",max_length=100)
    link = models.CharField(verbose_name="Ссылка",max_length=10000)

    def __str__(self):
        return f'{self.name}'


class Stage(models.Model):

    Color_CHOISES = (
        ("#D9D9D9", "Серый"),
        ("#AE4B88", "Розовый"),  # Сделано
        ("#4B56AE", "Фиолетовый"),  # В работе
        ("#6BAE4B", "Салатовый"),  # Запланировано
        ("#AE644B", "Коричневый"),  # Неактивные
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="stages")
    name = models.CharField(verbose_name="Название этапа", max_length=256)
    position = models.IntegerField(default=1)
    color = models.CharField(verbose_name="Цвет", max_length=256, default="#D9D9D9", choices=Color_CHOISES )

    def __str__(self):
        return self.name

class Meeting(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="meetings")
    name = models.CharField(max_length=256, verbose_name="Название")
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    datetime = models.DateTimeField(verbose_name="Дата и время начала")
    participants = models.ManyToManyField(Profile, related_name="participants", verbose_name="Участники")

    def __str__(self):
        return f'{self.name}'

class MeetingRespond(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="meeting")
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="author")
    reason = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    attending = models.BooleanField(verbose_name="Приду/Не приду", default=False)


class Task(models.Model):
    creator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="tasks_creators", verbose_name="Создатель задачи")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, verbose_name="Проект")
    status = models.ForeignKey(Stage, on_delete=models.CASCADE, verbose_name="Статус", blank=True, null=True)
    name = models.CharField(verbose_name="Название",max_length=256)
    description = models.TextField(verbose_name="Описание", max_length=10000)
    responsible_user = models.ForeignKey(Profile, on_delete=models.CASCADE,  verbose_name="Ответственный")
    performers = models.ManyToManyField(Profile, related_name="performers", verbose_name="Исполнители")
    creation = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    start = models.DateTimeField(verbose_name="Дата создания", )
    end = models.DateTimeField(verbose_name="Время закрытия задачи")
    is_completed = models.BooleanField(default=False, verbose_name="Задача завершена")
    parent_task = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="subtasks",  # Связь для доступа к подзадачам
        blank=True,
        null=True,
        verbose_name="Родительская задача",
    )

    def __str__(self):
        return self.name

class Checklist(models.Model):
    task = models.ForeignKey(Task, related_name="checklist", on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название", max_length=500)

    def __str__(self):
        return f"{self.name}"


class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(verbose_name="Описание пункта", max_length=500)
    is_completed = models.BooleanField(verbose_name="Выполнено", default=False)
    responsible = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    datetime = models.DateTimeField(verbose_name="Дата и время", blank=True,null=True)

    def __str__(self):
        return f"{self.description} - {'Выполнено' if self.is_completed else 'Не выполнено'}"


class Comment(models.Model):
    task = models.ForeignKey(Task, related_name="comments", on_delete=models.CASCADE, null=True, blank=True)
    meeting = models.ForeignKey(Meeting, related_name="comments", on_delete=models.CASCADE, null=True, blank=True)
    is_go = models.BooleanField(verbose_name="Приду",default=False)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="Текст", max_length=10000)
    datetime = models.DateTimeField(auto_now_add=True)