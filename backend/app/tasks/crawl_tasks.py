"""
Celery tasks for GitHub crawling.

Converts async crawler service to Celery tasks.
Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html

Note: Celery workers fork processes, so we need to create a fresh event loop
for each task to avoid async SQLAlchemy greenlet issues.
"""

import asyncio
import sys
from typing import Literal, Optional

from app.celery_app import celery_app
from app.config import settings
from app.database import async_session_maker
from app.services.github_crawler import GitHubCrawler, SEARCH_TERMS


@celery_app.task(name="app.tasks.crawl_github_policies", bind=True, max_retries=3)
def crawl_github_policies(
    self,
    mode: Literal["update", "discover", "both"] = "both",
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
        # In Celery workers (forked processes), we need to create a fresh event loop
        # Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#using-asyncio-with-multiprocessing-or-os-fork
        # Reference: https://docs.python.org/3/library/asyncio-task.html#running-an-async-function
        
        async def run_crawl():
            """Run the crawl in async context."""
            # Create a fresh session for this task
            # Ensure proper cleanup by explicitly closing the session
            db = async_session_maker()
            try:
                stats = await crawler.crawl(
                    db=db,
                    mode=mode,
                    result_limit=result_limit,
                    star_threshold=star_threshold,
                )
                # Ensure all operations are committed
                await db.commit()
                return stats
            except Exception:
                # Rollback on error
                await db.rollback()
                raise
            finally:
                # Always close the session
                await db.close()
        
        # Create a new event loop for this task (required in forked Celery workers)
        # This ensures async SQLAlchemy greenlet context is properly initialized
        # Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#using-asyncio-with-multiprocessing-or-os-fork
        try:
            # Try to get existing loop (shouldn't exist in forked process)
            loop = asyncio.get_event_loop()
            if loop.is_closed():
                raise RuntimeError("Loop is closed")
        except RuntimeError:
            # No event loop exists or it's closed - create a new one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        try:
            # Run the async function
            stats = loop.run_until_complete(run_crawl())
        finally:
            # Clean up: properly close the loop
            # This prevents "Task got Future attached to different loop" errors
            try:
                # Cancel any remaining tasks
                pending = [t for t in asyncio.all_tasks(loop) if not t.done()]
                if pending:
                    for task in pending:
                        task.cancel()
                    # Wait for tasks to be cancelled (with timeout)
                    loop.run_until_complete(
                        asyncio.wait(pending, timeout=1.0, return_when=asyncio.ALL_COMPLETED)
                    )
            except Exception:
                pass
            finally:
                # Close the loop and clear reference
                try:
                    loop.close()
                except Exception:
                    pass
                asyncio.set_event_loop(None)
        
        print(f"\n✅ Crawl completed successfully! (Mode: {mode})")
        print(f"   Processed: {stats.get('processed', 0)}")
        print(f"   Created: {stats.get('created', 0)}")
        print(f"   Updated: {stats.get('updated', 0)}")
        print(f"   Skipped: {stats.get('skipped', 0)}")
        print(f"   Errors: {stats.get('errors', 0)}")
        if mode == "update" and "repos_checked" in stats:
            print(f"   Repos Checked: {stats.get('repos_checked', 0)}")
        
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

