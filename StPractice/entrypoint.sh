#!/bin/sh

# Ожидание доступности MySQL
until nc -z db 3306; do
  echo "Waiting for MySQL..."
  sleep 1
done

python manage.py migrate --noinput
exec "$@"