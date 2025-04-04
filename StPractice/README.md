# Django REST Framework Application

Проект на базе Django REST Framework с использованием Docker и MySQL.

## 🛠 Требования

- Docker (версия 20.10.0+)
- Docker Compose (версия 2.0.0+)

## 🚀 Быстрый старт

1. **Клонирование репозитория**

```bash
git clone https://github.com/...
cd ...
```

2. **Настройка окружения**

Создайте файл `.env` в корне проекта:

```ini
# Django
SECRET_KEY = ваш-secret-key
DEBUG = 0
ALLOWED_HOSTS = localhost,127.0.0.1

# MySQL
MYSQL_DATABASE = yourdb
MYSQL_USER = youruser
MYSQL_PASSWORD = yourpass
MYSQL_ROOT_PASSWORD = rootpass
```

3. **Сборка и запуск**

```bash
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost:8000

## ⚙ Конфигурация

### Основные переменные окружения

| Переменная               | Описание                       | Пример значения       |
|--------------------------|--------------------------------|-----------------------|
| `SECRET_KEY`             | Ключ безопасности Django       | ваш-secret-key        |
| `DEBUG`                  | Режим отладки (0/1)            | 0                     |
| `DJANGO_SETTINGS_MODULE` | Конфигурационный файл настроек | your_project.settings |
| `MYSQL_DATABASE`         | Имя базы данных                | yourdb                |
| `MYSQL_USER`             | Пользователь БД                | youruser              |
| `MYSQL_PASSWORD`         | Пароль пользователя БД         | yourpass              |

### Команды управления

- Запуск в фоновом режиме:

```bash
docker-compose up -d
```

- Остановка контейнеров:

```bash
docker-compose down
```

- Просмотр логов:

```bash
docker-compose logs -f web
```

- Выполнение миграций (если не сработали автоматически):

```bash
docker-compose exec web python manage.py migrate
```

- Создание суперпользователя:

```bash
docker-compose exec web python manage.py createsuperuser
```

## 🗄 Структура проекта

```
.
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── requirements.txt
└── your_project/
    ├── settings/
    │   ├── __init__.py
    │   ├── base.py
    │   ├── production.py
    │   └── development.py
    └── wsgi.py
```

## 🔧 Настройка для разработки

1. Измените в `.env`:

```ini
DEBUG = 1
DJANGO_SETTINGS_MODULE = your_project.settings.development
```

2. Пересоберите контейнеры:

```bash
docker-compose up --build
```

## 🚨 Устранение неполадок

### Ошибки подключения к MySQL

- Проверьте логи БД:

```bash
docker-compose logs -f db
```

- Убедитесь что в настройках Django указан правильный хост:

```python
'HOST': 'db'  # Должно соответствовать имени сервиса в docker-compose
```

### Проблемы с миграциями

- Принудительно выполните миграции:

```bash
docker-compose exec web python manage.py migrate --fake-initial
```

