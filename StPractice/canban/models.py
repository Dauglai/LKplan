from django.db import models
from django.utils.termcolors import RESET

from crm.models import Profile, Direction


class Task(models.Model):
    name = models.CharField(verbose_name="Название", max_length=256)
    description = models.TextField(verbose_name="Название", max_length=10000)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="tasks_authored")
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE)
    responsible_users = models.ManyToManyField(Profile, related_name='responsible_users')
    datetime = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(verbose_name="Крайний срок выполнения", blank=True, null=True)

    def __str__(self):
        return self.name


class ChecklistItem(models.Model):
    task = models.ForeignKey(Task, related_name="checklist", on_delete=models.CASCADE)
    description = models.CharField(verbose_name="Описание пункта", max_length=500)
    is_completed = models.BooleanField(verbose_name="Выполнено", default=False)

    def __str__(self):
        return f"{self.description} - {'Выполнено' if self.is_completed else 'Не выполнено'}"


class Customization(models.Model):
    task = models.ForeignKey(Task, related_name="customization", on_delete=models.CASCADE)
    photo = models.ImageField()

class Status(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название этапа", max_length=256)

    def __str__(self):
        return self.name

class Tag(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название тэга", max_length=256)
    def __str__(self):
        return self.name



class Result(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    text = models.TextField(verbose_name="Описание", max_length=10000)
    file = models.FileField(verbose_name="Файл", upload_to="results", blank=True, null=True)

    def __str__(self):
        return self.text


class Grade(models.Model):
    result = models.ForeignKey(Result, on_delete=models.CASCADE)
    grade = models.IntegerField(default=0, verbose_name="Оценка")
    review = models.TextField(verbose_name="Отзыв", max_length=10000)

    def __str__(self):
        return self.grade


class Comment(models.Model):
    task = models.ForeignKey(Task, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="Текст", max_length=10000)