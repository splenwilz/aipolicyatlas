"""
Celery tasks for GitHub crawling.

Converts async crawler service to Celery tasks.
Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html
"""

import asyncio
from typing import Optional

from app.celery_app import celery_app
from app.config import settings
from app.database import async_session_maker
from app.services.github_crawler import GitHubCrawler, SEARCH_TERMS


@celery_app.task(name="app.tasks.crawl_github_policies", bind=True, max_retries=3)
def crawl_github_policies(
    self,
    result_limit: Optional[int] = None,
    star_threshold: Optional[int] = None,
) -> dict:
    """
    Celery task to crawl GitHub for AI policy files.
    
    This task:
    1. Runs the GitHub crawler
    2. Ensures unique data storage (deduplication handled in crawler)
    3. Updates existing records if content changed
    4. Handles errors and retries
    
    Args:
        result_limit: Maximum files to fetch per search term
        star_threshold: Minimum stars for repositories
    
    Returns:
        Dictionary with crawl statistics
    
    Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html#basics
    """
    try:
        # Check if GitHub token is configured
        if not settings.GITHUB_TOKEN:
            error_msg = "GITHUB_TOKEN environment variable is not set"
            print(f"❌ {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "stats": {},
            }
        
        # Initialize crawler (validates token)
        try:
            crawler = GitHubCrawler()
        except ValueError as e:
            # Token validation failed - don't retry, just return error
            error_msg = str(e)
            print(f"❌ {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "stats": {},
                "note": "Token validation failed. Please update GITHUB_TOKEN in .env file",
            }
        
        # Run async crawl in sync context
        # Reference: https://docs.python.org/3/library/asyncio-task.html#running-an-async-function
        async def run_crawl():
            """Run the crawl in async context."""
            async with async_session_maker() as db:
                stats = await crawler.crawl(
                    db=db,
                    result_limit=result_limit,
                    star_threshold=star_threshold,
                )
                return stats
        
        # Execute async function
        stats = asyncio.run(run_crawl())
        
        print(f"\n✅ Crawl completed successfully!")
        print(f"   Processed: {stats.get('processed', 0)}")
        print(f"   Created: {stats.get('created', 0)}")
        print(f"   Updated: {stats.get('updated', 0)}")
        print(f"   Skipped: {stats.get('skipped', 0)}")
        print(f"   Errors: {stats.get('errors', 0)}")
        
        return {
            "status": "success",
            "message": "Crawl completed successfully",
            "stats": stats,
        }
    
    except ValueError as e:
        # Don't retry on validation errors (invalid token, etc.)
        error_msg = str(e)
        print(f"❌ {error_msg}")
        return {
            "status": "error",
            "message": error_msg,
            "stats": {},
            "note": "This error will not retry. Please fix the configuration and trigger manually.",
        }
    
    except Exception as e:
        error_msg = f"Crawl failed: {str(e)}"
        print(f"❌ {error_msg}")
        
        # Retry on failure (up to max_retries)
        # Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html#retrying
        try:
            raise self.retry(exc=e, countdown=60)  # Retry after 60 seconds
        except self.MaxRetriesExceededError:
            return {
                "status": "error",
                "message": error_msg,
                "stats": {},
            }

