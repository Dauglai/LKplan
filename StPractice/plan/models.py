from django.db import models
from django.utils.termcolors import RESET
from crm.models import Profile, Direction


class Project(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название проекта", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Result(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название ссылки", max_length=100)
    link = models.TextField(verbose_name="Ссылка", max_length=10000)


class Team(models.Model):
    curator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='curator')
    name = models.CharField(verbose_name="Название", max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    students = models.ManyToManyField(Profile, blank=True, related_name="teams")
    is_agreed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.name}'


class Stage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="stages")
    name = models.CharField(verbose_name="Название этапа", max_length=255)

    def __str__(self):
        return self.name


class Task(models.Model):
    creator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="tasks_creators",
                                verbose_name="Создатель задачи")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, verbose_name="Проект")
    status = models.ForeignKey(Stage, on_delete=models.CASCADE, verbose_name="Статус")
    name = models.CharField(verbose_name="Название", max_length=255)
    description = models.TextField(verbose_name="Описание", max_length=10000)
    responsible_user = models.ForeignKey(Profile, on_delete=models.CASCADE, verbose_name="Ответственный")
    start = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    end = models.DateTimeField(verbose_name="Время закрытия задачи", blank=True, null=True)
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
    name = models.TextField(verbose_name="Описание пункта", max_length=500)
    description = models.TextField(verbose_name="Описание пункта", max_length=500)

    def __str__(self):
        return f"{self.description}"


class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE)
    description = models.TextField(verbose_name="Описание пункта", max_length=500)
    is_completed = models.BooleanField(verbose_name="Выполнено", default=False)

    def __str__(self):
        return f"{self.description} - {'Выполнено' if self.is_completed else 'Не выполнено'}"


class Comment(models.Model):
    task = models.ForeignKey(Task, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="Текст", max_length=10000)
    file = models.FileField(verbose_name="Файл", upload_to="comments", null=True, blank=True)
