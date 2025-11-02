#!/bin/bash
# Start both Celery worker and beat together for development
# Reference: https://docs.celeryq.dev/en/stable/userguide/daemonizing.html

cd "$(dirname "$0")/.." || exit 1

echo "Starting Celery worker with beat scheduler..."
echo "This will run both worker and beat in one process."
echo ""
echo "The crawl task will run automatically every 2 minutes."
echo ""
echo "Press CTRL+C to stop"
echo ""

uv run celery -A app.celery_app worker --beat --loglevel=info


