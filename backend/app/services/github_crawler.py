"""
GitHub crawler service.

Fetches AI policy files from GitHub and stores them in the database.
Refactored from main.py to work with FastAPI and PostgreSQL.

Reference:
- PyGithub: https://pygithub.readthedocs.io/
- GitHub API Rate Limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
"""

import hashlib
import time
from datetime import datetime, timezone
from typing import Literal, Optional

from github import Auth, Github, GithubException, RateLimitExceededException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import Policy, Repository


# GitHub search terms for finding AI policy files
# Reference: https://docs.github.com/en/search-github/searching-on-github/searching-code
SEARCH_TERMS = [
    "filename:.cursorule",
    "filename:cursorules",
    "filename:claude.md",
    "filename:AI_RULES.md",
    "filename:AI_POLICY.md",
    "filename:CODE_OF_CONDUCT.md",
    "filename:CONTRIBUTING.md",
]


class GitHubCrawler:
    """
    Service for crawling GitHub repositories for AI policy files.
    
    Handles:
    - Searching for policy files (discovery mode)
    - Updating existing repositories (update mode)
    - Filtering by star threshold
    - Storing in PostgreSQL database
    - Deduplication by repository full_name and file_path
    - Incremental updates using last_crawled_at timestamp
    """
    
    def __init__(self):
        """Initialize GitHub client with token from settings."""
        if not settings.GITHUB_TOKEN:
            raise ValueError(
                "GITHUB_TOKEN environment variable is required. "
                "Get one from: https://github.com/settings/tokens"
            )
        
        # Create authenticated GitHub client
        # Reference: https://pygithub.readthedocs.io/en/latest/introduction.html
        # Using same pattern as original code that worked
        auth = Auth.Token(settings.GITHUB_TOKEN)
        self.github = Github(auth=auth)
    
    async def _process_policy_file(
        self,
        db: AsyncSession,
        file,
        db_repo: Repository,
        stats: dict[str, int],
        star_threshold: int,
    ) -> bool:
        """
        Process a single policy file from GitHub.
        
        Helper method that handles the logic for creating/updating policies.
        Returns True if file was processed successfully, False otherwise.
        
        Args:
            db: Database session
            file: GitHub file object
            db_repo: Repository database record
            stats: Statistics dictionary to update
            star_threshold: Minimum stars for repo
        
        Returns:
            True if processed, False if skipped or error
        """
        try:
            stats["processed"] += 1
            
            # Get repository information
            repo = file.repository
            stars = getattr(repo, "stargazers_count", 0)
            
            # Filter by star threshold
            if stars < star_threshold:
                stats["skipped"] += 1
                return False
            
            # Get default branch for file URL
            default_branch = getattr(repo, "default_branch", "main")
            file_link = (
                f"https://github.com/{repo.full_name}/blob/"
                f"{default_branch}/{file.path}"
            )
            
            # Update repository metadata
            db_repo.stars = stars
            db_repo.forks = getattr(repo, "forks_count", 0)
            db_repo.language = repo.language
            db_repo.updated_at = repo.pushed_at
            
            # Check if policy already exists
            policy_query = select(Policy).where(
                Policy.repo_id == db_repo.id,
                Policy.file_path == file.path,
            )
            policy_result = await db.execute(policy_query)
            db_policy = policy_result.scalar_one_or_none()
            
            # Decode file content
            # Reference: https://pygithub.readthedocs.io/en/latest/github_objects/ContentFile.html
            try:
                content = file.decoded_content.decode("utf-8", errors="ignore")
            except Exception as e:
                print(f"⚠️ Failed to decode content for {file.path}: {e}")
                stats["errors"] += 1
                return False
            
            # Create or update policy with uniqueness check
            # Uniqueness is ensured by:
            # 1. Repository full_name is unique (database constraint)
            # 2. Policy file_path within repo is unique (query check)
            # 3. Content hash comparison to detect actual changes
            content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
            
            # Track action for logging
            action = None
            
            if not db_policy:
                # Create new policy
                db_policy = Policy(
                    repo_id=db_repo.id,
                    filename=file.name,
                    file_path=file.path,
                    file_url=file_link,
                    content=content,
                    # Summary, tags, and ai_score will be set by AI service later
                )
                db.add(db_policy)
                stats["created"] += 1
                action = "Created"
            else:
                # Check if content actually changed before updating
                existing_content_hash = hashlib.sha256(
                    db_policy.content.encode("utf-8")
                ).hexdigest()
                
                if content_hash != existing_content_hash:
                    # Content changed - update the policy
                    db_policy.content = content
                    db_policy.file_url = file_link
                    stats["updated"] += 1
                    action = "Updated"
                else:
                    # Content unchanged - skip update
                    stats["skipped"] += 1
                    return False
            
            # Update last_crawled_at timestamp
            db_repo.last_crawled_at = datetime.now(timezone.utc)
            
            # Commit after each policy to avoid large transactions
            await db.commit()
            
            print(
                f"✅ {repo.full_name} ({stars}⭐) → {file.name} [{action}]"
            )
            return True
            
        except RateLimitExceededException:
            print("⏳ Hit rate limit — sleeping 60s...")
            time.sleep(60)
            return False
        
        except Exception as e:
            print(f"⚠️ Error processing {file.path}: {e}")
            stats["errors"] += 1
            await db.rollback()
            return False
    
    async def update_existing_repos(
        self,
        db: AsyncSession,
        star_threshold: Optional[int] = None,
    ) -> dict[str, int]:
        """
        Update existing repositories in database that may have changed.
        
        Checks repositories where:
        - last_crawled_at IS NULL (never crawled), OR
        - updated_at > last_crawled_at (repo was updated since last crawl)
        
        Then verifies with GitHub API if repository was actually pushed after our last crawl.
        Only fetches file content if repository was updated.
        
        Args:
            db: Database session
            star_threshold: Minimum stars for repo (defaults to config)
        
        Returns:
            Dictionary with crawl statistics
        """
        star_threshold = star_threshold or settings.GITHUB_STAR_THRESHOLD
        
        stats = {
            "searched": 0,
            "processed": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
            "repos_checked": 0,
        }
        
        # Query repositories that need checking:
        # 1. Never crawled (last_crawled_at IS NULL), OR
        # 2. Updated since last crawl (updated_at > last_crawled_at)
        now = datetime.now(timezone.utc)
        query = select(Repository).where(
            or_(
                Repository.last_crawled_at.is_(None),
                Repository.updated_at > Repository.last_crawled_at,
            )
        )
        
        result = await db.execute(query)
        repos_to_check = result.scalars().all()
        stats["repos_checked"] = len(repos_to_check)
        
        print(f"\n🔄 Update mode: Checking {len(repos_to_check)} repositories for updates...")
        
        for db_repo in repos_to_check:
            try:
                # Get GitHub repository
                github_repo = self.github.get_repo(db_repo.full_name)
                github_pushed_at = getattr(github_repo, "pushed_at", None)
                
                # Skip if repository wasn't pushed since last crawl
                if db_repo.last_crawled_at and github_pushed_at:
                    # Convert GitHub datetime to timezone-aware datetime if needed
                    if github_pushed_at.tzinfo is None:
                        github_pushed_at = github_pushed_at.replace(tzinfo=timezone.utc)
                    
                    if github_pushed_at <= db_repo.last_crawled_at:
                        # Repository hasn't been updated - skip
                        stats["skipped"] += 1
                        # Still update last_crawled_at to avoid re-checking too soon
                        db_repo.last_crawled_at = now
                        await db.commit()
                        continue
                
                # Repository was updated - check for policy files
                # Search for policy files in this specific repository
                for search_term in SEARCH_TERMS:
                    try:
                        # Search within this repository
                        query_str = f"{search_term} repo:{db_repo.full_name}"
                        results = self.github.search_code(query_str)
                        
                        count = 0
                        for file in results:
                            stats["searched"] += 1
                            
                            # Process the file
                            processed = await self._process_policy_file(
                                db=db,
                                file=file,
                                db_repo=db_repo,
                                stats=stats,
                                star_threshold=star_threshold,
                            )
                            
                            if processed:
                                count += 1
                    
                    except GithubException as e:
                        print(f"⚠️ GitHub query failed for {search_term} in {db_repo.full_name}: {e}")
                        stats["errors"] += 1
                        continue
                
                # Update repository metadata and last_crawled_at
                db_repo.stars = getattr(github_repo, "stargazers_count", db_repo.stars)
                db_repo.forks = getattr(github_repo, "forks_count", db_repo.forks)
                db_repo.language = getattr(github_repo, "language", db_repo.language)
                db_repo.updated_at = github_pushed_at
                db_repo.last_crawled_at = now
                await db.commit()
            
            except GithubException as e:
                print(f"⚠️ Failed to fetch repo {db_repo.full_name}: {e}")
                stats["errors"] += 1
                # Still update last_crawled_at to avoid hammering failed repos
                db_repo.last_crawled_at = now
                await db.commit()
                continue
        
        return stats
    
    async def discover_new_repos(
        self,
        db: AsyncSession,
        result_limit: Optional[int] = None,
        star_threshold: Optional[int] = None,
    ) -> dict[str, int]:
        """
        Discover new repositories by searching GitHub.
        
        Uses SEARCH_TERMS to find new policy files. Only creates new Repository records.
        This is the original crawl logic, optimized for discovery only.
        
        Args:
            db: Database session
            result_limit: Maximum files to fetch per search term (defaults to config)
            star_threshold: Minimum stars for repo (defaults to config)
        
        Returns:
            Dictionary with crawl statistics
        """
        result_limit = result_limit or settings.GITHUB_RESULT_LIMIT
        star_threshold = star_threshold or settings.GITHUB_STAR_THRESHOLD
        
        stats = {
            "searched": 0,
            "processed": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
        }
        
        now = datetime.now(timezone.utc)
        
        for query in SEARCH_TERMS:
            print(f"\n🔍 Discovery mode: Searching for: {query}")
            
            try:
                # Search GitHub code
                # Reference: https://pygithub.readthedocs.io/en/latest/github_objects/SearchCode.html
                results = self.github.search_code(query)
                stats["searched"] += results.totalCount
                
                count = 0
                for file in results:
                    if count >= result_limit:
                        break
                    
                    try:
                        # Get repository information
                        repo = file.repository
                        stars = getattr(repo, "stargazers_count", 0)
                        
                        # Filter by star threshold
                        if stars < star_threshold:
                            stats["skipped"] += 1
                            continue
                        
                        # Check if repository already exists in database
                        repo_query = select(Repository).where(
                            Repository.full_name == repo.full_name
                        )
                        repo_result = await db.execute(repo_query)
                        db_repo = repo_result.scalar_one_or_none()
                        
                        # Only process if repository is new
                        if not db_repo:
                            # Create new repository
                            db_repo = Repository(
                                name=repo.name,
                                full_name=repo.full_name,
                                stars=stars,
                                forks=getattr(repo, "forks_count", 0),
                                language=repo.language,
                                url=repo.html_url,
                                updated_at=repo.pushed_at,
                                last_crawled_at=now,  # Set initial crawl time
                            )
                            db.add(db_repo)
                            await db.flush()  # Get the ID
                            
                            # Process the policy file
                            processed = await self._process_policy_file(
                                db=db,
                                file=file,
                                db_repo=db_repo,
                                stats=stats,
                                star_threshold=star_threshold,
                            )
                            
                            if processed:
                                count += 1
                            else:
                            # Repository already exists - discovery mode skips it
                            # Update mode will handle existing repos
                                stats["skipped"] += 1
                                continue
                    
                    except RateLimitExceededException:
                        print("⏳ Hit rate limit — sleeping 60s...")
                        time.sleep(60)
                        continue
                    
                    except Exception as e:
                        print(f"⚠️ Error processing {file.path}: {e}")
                        stats["errors"] += 1
                        await db.rollback()
                        continue
            
            except GithubException as e:
                print(f"⚠️ GitHub query failed for {query}: {e}")
                stats["errors"] += 1
                continue
        
        return stats

    async def crawl(
        self,
        db: AsyncSession,
        mode: Literal["update", "discover", "both"] = "both",
        result_limit: Optional[int] = None,
        star_threshold: Optional[int] = None,
    ) -> dict[str, int]:
        """
        Crawl GitHub and store policy files in database.
        
        Supports three modes:
        - "update": Only check existing repositories for updates (efficient)
        - "discover": Only search GitHub for new repositories (uses more API calls)
        - "both": Update existing repos first, then discover new ones (default)
        
        Args:
            db: Database session
            mode: Crawl mode - "update", "discover", or "both"
            result_limit: Maximum files to fetch (only for discover mode, defaults to config)
            star_threshold: Minimum stars for repo (defaults to config)
        
        Returns:
            Dictionary with crawl statistics
        """
        combined_stats = {
            "searched": 0,
            "processed": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
            "repos_checked": 0,
        }
        
        if mode in ("update", "both"):
            update_stats = await self.update_existing_repos(
                db=db,
                star_threshold=star_threshold,
            )
            # Merge stats
            for key in combined_stats:
                combined_stats[key] += update_stats.get(key, 0)
        
        if mode in ("discover", "both"):
            discover_stats = await self.discover_new_repos(
                db=db,
                result_limit=result_limit,
                star_threshold=star_threshold,
            )
            # Merge stats
            for key in combined_stats:
                combined_stats[key] += discover_stats.get(key, 0)
        
        return combined_stats
