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
        # Update existing repositories (frequent, every 2 minutes)
        # Only checks repos that may have changed (efficient, uses minimal API calls)
        "update-existing-repos": {
            "task": "app.tasks.crawl_github_policies",
            "schedule": float(settings.CRAWL_UPDATE_INTERVAL),  # Default: 120 seconds (2 minutes)
            "kwargs": {"mode": "update"},  # Only update mode, no discovery
        },
        # Discover new repositories (less frequent, daily)
        # Searches GitHub for new policy files (uses more API calls)
        "discover-new-repos": {
            "task": "app.tasks.crawl_github_policies",
            "schedule": crontab(
                hour=int(settings.CRAWL_DISCOVERY_TIME.split(":")[0]),
                minute=int(settings.CRAWL_DISCOVERY_TIME.split(":")[1]),
            ),  # Default: 02:00 UTC daily
            "kwargs": {"mode": "discover"},  # Only discovery mode
        },
    },
)

# Auto-discover tasks from app.tasks module
# Reference: https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-modules
celery_app.autodiscover_tasks(["app.tasks"])

