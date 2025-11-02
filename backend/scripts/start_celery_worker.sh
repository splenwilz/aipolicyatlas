#!/bin/bash
# Start Celery worker
# Reference: https://docs.celeryq.dev/en/stable/userguide/daemonizing.html

cd "$(dirname "$0")/.." || exit 1

echo "Starting Celery worker..."
uv run celery -A app.celery_app worker --loglevel=info


