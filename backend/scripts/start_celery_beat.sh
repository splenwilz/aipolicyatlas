#!/bin/bash
# Start Celery Beat scheduler for periodic tasks
# Reference: https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html

cd "$(dirname "$0")/.." || exit 1

echo "Starting Celery Beat scheduler..."
uv run celery -A app.celery_app beat --loglevel=info


