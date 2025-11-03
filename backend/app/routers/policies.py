"""
Policies API router.

Provides endpoints for fetching and searching policies.
Reference: https://fastapi.tiangolo.com/tutorial/bigger-applications/
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Policy, Repository
from app.schemas import Policy as PolicySchema, PolicyListResponse, SearchQuery

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("", response_model=PolicyListResponse)
async def get_policies(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("recent", description="Sort by: votes, recent, ai-score"),
    language: str | None = Query(None, description="Filter by repository language"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated list of policies.
    
    Supports:
    - Sorting by: votes, recent, ai-score
    - Filtering by repository language
    
    Reference: https://fastapi.tiangolo.com/tutorial/query-params/
    """
    # Base query with eager loading of repository relationship
    # Join Repository if language filter is needed
    # Reference: https://docs.sqlalchemy.org/en/20/orm/loading_relationships.html
    if language:
        query = select(Policy).options(selectinload(Policy.repo)).join(Repository)
    else:
        query = select(Policy).options(selectinload(Policy.repo))
    
    # Filter by repository language (exact match)
    if language:
        query = query.where(Repository.language == language)
    
    # Apply sorting
    if sort_by == "votes":
        # Calculate net votes: upvotes - downvotes, descending
        # Using func.max() workaround for SQLAlchemy expression
        query = query.order_by(
            (Policy.upvotes_count - Policy.downvotes_count).desc()
        )
    elif sort_by == "recent":
        query = query.order_by(Policy.created_at.desc())
    elif sort_by == "ai-score":
        query = query.order_by(
            Policy.ai_score.desc().nulls_last()  # NULLs at the end
        )
    else:
        # Default to recent
        query = query.order_by(Policy.created_at.desc())
    
    # Get total count (before pagination)
    # Build count query with same conditions as main query (excluding sorting/pagination)
    if language:
        count_query = select(func.count()).select_from(Policy).join(Repository).where(
            Repository.language == language
        )
    else:
        count_query = select(func.count()).select_from(Policy)
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination
    # Reference: https://docs.sqlalchemy.org/en/20/orm/queryguide/select.html#limiting-or-offsetting
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    policies = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return PolicyListResponse(
        items=policies,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{policy_id}", response_model=PolicySchema)
async def get_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single policy by ID.
    
    Returns 404 if policy not found.
    """
    # Query with eager loading of repository
    query = select(Policy).options(selectinload(Policy.repo)).where(
        Policy.id == policy_id
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy with id {policy_id} not found",
        )
    
    return policy


@router.get("/search/all", response_model=PolicyListResponse)
async def search_policies(
    q: str | None = Query(None, description="Search query (filename, summary, tags)"),
    language: str | None = Query(None, description="Filter by repository language"),
    tag: str | None = Query(None, description="Filter by tag"),
    min_score: float | None = Query(None, ge=0, le=100, description="Minimum AI score"),
    max_score: float | None = Query(None, ge=0, le=100, description="Maximum AI score"),
    sort_by: str = Query("recent", description="Sort by: votes, recent, ai-score"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Search policies with filters.
    
    Supports:
    - Full-text search in filename, summary, and tags
    - Filter by repository language
    - Filter by tag
    - Filter by AI score range
    - Multiple sort options
    
    Reference: https://fastapi.tiangolo.com/tutorial/query-params-strategies/
    """
    # Base query with eager loading
    # Join Repository early if we need it for search or language filter
    # SQLAlchemy will handle duplicate joins gracefully
    needs_repo_join = bool(q or language)
    if needs_repo_join:
        query = select(Policy).options(selectinload(Policy.repo)).join(Repository)
    else:
        query = select(Policy).options(selectinload(Policy.repo))
    
    # Apply text search
    if q:
        # Search in filename, summary, tags, and repository language
        # Reference: https://www.postgresql.org/docs/current/functions-array.html
        search_pattern = f"%{q.lower()}%"
        
        # Create search conditions including repository language
        search_conditions = [
                Policy.filename.ilike(search_pattern),
                Policy.summary.ilike(search_pattern),
                # For array search, we'll check if any tag contains the query
                # This is a simplified approach - in production, use proper full-text search
                func.array_to_string(Policy.tags, ",").ilike(search_pattern),
            # Search in repository language
            Repository.language.ilike(search_pattern),
        ]
        
        query = query.where(or_(*search_conditions))
    
    # Filter by repository language (exact match)
    if language:
        query = query.where(Repository.language == language)
    
    # Filter by tag
    if tag:
        # PostgreSQL array contains operator
        # Reference: https://www.postgresql.org/docs/current/functions-array.html#ARRAY-OPERATORS
        query = query.where(Policy.tags.contains([tag]))
    
    # Filter by AI score range
    if min_score is not None:
        query = query.where(Policy.ai_score >= min_score)
    if max_score is not None:
        query = query.where(Policy.ai_score <= max_score)
    
    # Apply sorting (same as get_policies)
    if sort_by == "votes":
        query = query.order_by(
            (Policy.upvotes_count - Policy.downvotes_count).desc()
        )
    elif sort_by == "recent":
        query = query.order_by(Policy.created_at.desc())
    elif sort_by == "ai-score":
        query = query.order_by(Policy.ai_score.desc().nulls_last())
    else:
        query = query.order_by(Policy.created_at.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    policies = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return PolicyListResponse(
        items=policies,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/meta/languages")
async def get_available_languages(db: AsyncSession = Depends(get_db)):
    """
    Get all unique repository languages from the database.
    
    Returns a list of distinct languages that can be used for filtering.
    Only includes repositories that have policies associated with them.
    
    Reference: https://docs.sqlalchemy.org/en/20/core/functions.html#sqlalchemy.func.distinct
    """
    # Query distinct languages from repositories that have policies
    # Join with policies to ensure we only get languages that actually have policies
    query = select(func.distinct(Repository.language)).join(
        Policy, Repository.id == Policy.repo_id
    ).where(
        Repository.language.isnot(None)
    ).order_by(Repository.language)
    
    result = await db.execute(query)
    languages = result.scalars().all()
    
    # Filter out None values and return sorted list
    return {"languages": [lang for lang in languages if lang]}


@router.get("/meta/tags")
async def get_available_tags(db: AsyncSession = Depends(get_db)):
    """
    Get all unique tags from policies in the database.
    
    Returns a list of distinct tags that can be used for filtering.
    Uses PostgreSQL unnest to expand array values.
    
    Reference: https://www.postgresql.org/docs/current/functions-array.html
    Reference: https://docs.sqlalchemy.org/en/20/core/functions.html#sqlalchemy.func.unnest
    """
    # Query distinct tags from policies
    # unnest expands the tags array into rows, then we get distinct values
    # Only include policies that have tags
    # Execute raw SQL for unnest since SQLAlchemy's func.unnest needs special handling
    query_text = text("""
        SELECT DISTINCT unnest(tags) as tag
        FROM policies
        WHERE cardinality(tags) > 0
        ORDER BY tag
    """)
    
    result = await db.execute(query_text)
    tags = [row.tag for row in result if row.tag]
    
    # Return sorted list (already sorted by SQL query)
    return {"tags": tags}

