"""
Policies API router.

Provides endpoints for fetching and searching policies.
Reference: https://fastapi.tiangolo.com/tutorial/bigger-applications/
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
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
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated list of policies.
    
    Supports sorting by:
    - votes: Net votes (upvotes - downvotes)
    - recent: Most recently created
    - ai-score: Highest AI quality score
    
    Reference: https://fastapi.tiangolo.com/tutorial/query-params/
    """
    # Base query with eager loading of repository relationship
    # Reference: https://docs.sqlalchemy.org/en/20/orm/loading_relationships.html
    query = select(Policy).options(selectinload(Policy.repo))
    
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
    query = select(Policy).options(selectinload(Policy.repo))
    
    # Apply text search
    if q:
        # Search in filename, summary, and tags (using PostgreSQL array contains)
        # Reference: https://www.postgresql.org/docs/current/functions-array.html
        search_pattern = f"%{q.lower()}%"
        query = query.where(
            or_(
                Policy.filename.ilike(search_pattern),
                Policy.summary.ilike(search_pattern),
                # For array search, we'll check if any tag contains the query
                # This is a simplified approach - in production, use proper full-text search
                func.array_to_string(Policy.tags, ",").ilike(search_pattern),
            )
        )
    
    # Filter by repository language
    if language:
        query = query.join(Repository).where(Repository.language == language)
    
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


