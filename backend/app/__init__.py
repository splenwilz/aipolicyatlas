"""
AI Policy Atlas Backend Application

FastAPI backend for the AI Policy Atlas platform.
"""

# Import celery app to ensure it's loaded (optional for API-only mode)
try:
    from app.celery_app import celery_app  # noqa: F401
    __all__ = ["celery_app"]
except ImportError:
    # Celery not installed or not needed for API-only mode
    celery_app = None
    __all__ = []
