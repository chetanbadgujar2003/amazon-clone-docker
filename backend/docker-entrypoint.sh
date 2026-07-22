#!/bin/sh
set -e

mkdir -p /app/media /app/staticfiles

if [ "$DJANGO_MIGRATE" != "0" ]; then
  python manage.py makemigrations --noinput
  python manage.py migrate --noinput
fi

if [ "$DJANGO_COLLECT_STATIC" != "0" ]; then
  python manage.py collectstatic --noinput
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3} --log-level info
