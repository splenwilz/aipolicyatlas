"""
Crawl API router.

Provides endpoints for triggering GitHub crawls via Celery.
Reference: https://fastapi.tiangolo.com/tutorial/bigger-applications/
"""

from fastapi import APIRouter, HTTPException, status

# Import Celery task (with fallback if Celery not available)
try:
    from app.tasks.crawl_tasks import crawl_github_policies
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    crawl_github_policies = None

router = APIRouter(prefix="/crawl", tags=["crawl"])


@router.post("/trigger")
async def trigger_crawl():
    """
    Trigger a GitHub crawl task via Celery.
    
    This endpoint:
    1. Queues a Celery task to crawl GitHub for AI policy files
    2. Returns immediately with task ID
    3. Task runs in background and stores unique data in database
    4. Deduplicates by repository full_name + file_path
    
    The crawl task will:
    - Search GitHub for AI policy files
    - Filter by star threshold
    - Store repositories and policies in database
    - Update existing records if content changed
    - Ensure data uniqueness
    
    Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html
    """
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Celery is not available. Please install dependencies with 'uv sync' and ensure Redis is running.",
        )
    
    try:
        # Queue the Celery task
        # Reference: https://docs.celeryq.dev/en/stable/userguide/calling.html
        task = crawl_github_policies.delay()
        
        return {
            "status": "queued",
            "message": "Crawl task queued successfully",
            "task_id": task.id,
            "check_status": f"/api/crawl/status/{task.id}",
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue crawl task: {str(e)}",
        )


@router.get("/status/{task_id}")
async def get_crawl_status(task_id: str):
    """
    Get the status of a crawl task.
    
    Returns the current state and result of a Celery task.
    """
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Celery is not available.",
        )
    
    from app.celery_app import celery_app
    
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == "PENDING":
            response = {
                "task_id": task_id,
                "state": task.state,
                "message": "Task is waiting to be processed",
            }
        elif task.state == "PROGRESS":
            response = {
                "task_id": task_id,
                "state": task.state,
                "info": task.info,
            }
        elif task.state == "SUCCESS":
            response = {
                "task_id": task_id,
                "state": task.state,
                "result": task.result,
            }
        else:  # FAILURE or other states
            response = {
                "task_id": task_id,
                "state": task.state,
                "error": str(task.info) if task.info else "Unknown error",
            }
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}",
        )

