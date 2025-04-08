# Базовый образ для сборки
FROM python:3.11-slim-bookworm as builder

# Установка системных зависимостей для MySQL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Создание виртуального окружения
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Установка зависимостей Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Финальный образ
FROM python:3.11-slim-bookworm

# Установка runtime зависимостей для MySQL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client \
    netcat-openbsd \
    default-libmysqlclient-dev \
    pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копирование виртуального окружения из builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
COPY . /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=StPractice.settings

RUN python manage.py collectstatic --noinput

COPY --chmod=+x entrypoint.sh .




EXPOSE 8000

RUN useradd -m django_user && chown -R django_user:django_user /app
USER django_user

ENTRYPOINT ["./entrypoint.sh"]

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "your_project.wsgi:application"]