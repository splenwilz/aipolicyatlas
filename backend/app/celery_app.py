"""
Celery application configuration.

Sets up Celery for background tasks and periodic scheduling.
Reference: https://docs.celeryq.dev/en/stable/userguide/configuration.html
"""

from celery import Celery
from celery.schedules import crontab

from app.config import settings

# Create Celery app instance
# Reference: https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html
celery_app = Celery(
    "aipolicyatlas",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Celery configuration
# Reference: https://docs.celeryq.dev/en/stable/userguide/configuration.html
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    
    # Worker settings
    worker_prefetch_multiplier=1,  # Disable prefetching for better task distribution
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks to prevent memory leaks
    
    # Periodic task schedule (Celery Beat)
    # Reference: https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
    beat_schedule={
        # Crawl GitHub repositories every 2 minutes
        "crawl-github-policies": {
            "task": "app.tasks.crawl_github_policies",
            "schedule": 120.0,  # Every 120 seconds (2 minutes)
            # Alternative: crontab(minute='*/2') for every 2 minutes on the clock
        },
    },
)

# Auto-discover tasks from app.tasks module
# Reference: https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-modules
celery_app.autodiscover_tasks(["app.tasks"])

