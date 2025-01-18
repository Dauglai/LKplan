from django.db import models
from django.utils.termcolors import RESET
from crm.models import Profile, Project

class Tag(models.Model):
    name = models.CharField(verbose_name="Название тэга", max_length=256)
    def __str__(self):
        return self.name

class Status(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название этапа", max_length=256)

    def __str__(self):
        return self.name


class Task(models.Model):
    creator = models.ForeignKey(Profile,on_delete=models.CASCADE,related_name="tasks_creators",verbose_name="Создатель задачи")
    project = models.ForeignKey(Project,on_delete=models.CASCADE,verbose_name="Проект")
    status = models.ForeignKey(Status,on_delete=models.CASCADE,verbose_name="Статус" )
    name = models.CharField(verbose_name="Название",max_length=256)
    description = models.TextField(verbose_name="Описание", max_length=10000)
    responsible_user = models.ForeignKey(Profile, on_delete=models.CASCADE,  verbose_name="Ответственный")
    datetime = models.DateTimeField(auto_now_add=True,verbose_name="Дата создания")
    dateCloseTask = models.DateTimeField(verbose_name="Время закрытия задачи",blank=True,null=True)
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


class ChecklistItem(models.Model):
    task = models.ForeignKey(Task, related_name="checklist", on_delete=models.CASCADE)
    description = models.CharField(verbose_name="Описание пункта", max_length=500)
    is_completed = models.BooleanField(verbose_name="Выполнено", default=False)

    def __str__(self):
        return f"{self.description} - {'Выполнено' if self.is_completed else 'Не выполнено'}"


class Customization(models.Model):
    task = models.ForeignKey(Task, related_name="customization", on_delete=models.CASCADE)
    photo = models.ImageField()



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