"""
Celery tasks package.

This module is automatically discovered by Celery.
Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html
"""

from app.tasks.crawl_tasks import crawl_github_policies  # noqa: F401

__all__ = ["crawl_github_policies"]


