from django.contrib.auth.models import User
from django.db import models

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Навык")
    def __str__(self):
        return self.name

class Profile(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    photo = models.ImageField(blank=True, null=True)
    telegram = models.CharField(verbose_name="Telegram", max_length=100, null=True, blank=True)
    email = models.EmailField(verbose_name="Email", max_length=100, null=True, blank=True)
    surname = models.CharField(verbose_name="Фамилия", max_length=100)
    name = models.CharField(verbose_name="Имя", max_length=100)
    patronymic = models.CharField(verbose_name="Отчество", max_length=100, null=True, blank=True)
    course = models.IntegerField(verbose_name="Курс")
    university = models.CharField(verbose_name="Название универститета", max_length=100, null=True, blank=True)
    skills = models.ManyToManyField(Skill)

    def __str__(self):
        return f'{self.surname} {self.name} {self.patronymic}'


class Role(models.Model):
    ROLE_CHOISES = (
        ("Организатор", "Организатор"),
        ("Руководитель", "Руководитель"),
        ("Куратор", "Куратор"),
        ("Тимлид", "Тимлид"),
        ("Разработчик", "Разработчик"),
        ("Аналитик", "Аналитик"),
        ("Дизайнер", "Дизайнер"),
    )
    name = models.CharField(verbose_name="Название роли", choices=ROLE_CHOISES, default='На согласовании', max_length=50)
    users = models.ManyToManyField(Profile, related_name="users")

    def __str__(self):
        return f'{self.name}'


class Efficiency(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    count = models.IntegerField(default=0, verbose_name="Количество задач,выполненных в срок")
    rating = models.FloatField(verbose_name="Средний рейтинг")

    def __str__(self):
        return f'{self.user}'


class Project(models.Model):
    name = models.CharField(verbose_name="Название проекта", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE,
                               related_name="projects_authored")  # Уникальный related_name
    supervisor = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True,
                                   related_name="supervised_projects")
    curators = models.ManyToManyField(Profile, related_name="curated_projects")
    students = models.ManyToManyField(Profile, related_name="student_projects")
    link = models.CharField(verbose_name="Ссылка на организационный чат", max_length=100, null=True, blank=True)
    start = models.DateField(auto_now=True)
    end = models.DateField(verbose_name="Дата окончания", null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Direction(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название проекта", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    link = models.CharField(verbose_name="Ссылка на организационный чат", max_length=1000, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class Team(models.Model):
    name = models.CharField(verbose_name="Название", max_length=100)
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE)
    students = models.ManyToManyField(Profile)
    curator = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True, related_name="curator")

    def __str__(self):
        return f'{self.name}'


class Application(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    dateTime = models.DateTimeField(auto_now=True)
    message = models.TextField(verbose_name="Ваш текст", max_length=1000)


    def __str__(self):
        return f'{self.user}'

class App_review(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    is_approved = models.BooleanField(verbose_name="Заявка одобрена?", default=False)
    comment = models.CharField(verbose_name="Отзыв",max_length=1000)
    test_count = models.IntegerField(default=0)
    dateTime = models.DateTimeField(auto_now=True)

class Test(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Название теста", max_length=100)
    description = models.TextField(verbose_name="Описание", max_length=10000, null=True, blank=True)
    entry = models.IntegerField(verbose_name="Порог прохождения в %" )


    def __str__(self):
        return f'{self.name}'


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    name = models.CharField(verbose_name="Вопрос", max_length=1000)
    count = models.IntegerField(verbose_name="Количество баллов за вопрос" )

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
