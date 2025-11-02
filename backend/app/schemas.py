"""
Pydantic schemas for API request/response validation.

These schemas define the structure of data exchanged with the frontend.
Reference: https://docs.pydantic.dev/latest/concepts/models/
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RepositoryBase(BaseModel):
    """Base repository schema with common fields."""
    name: str
    full_name: str
    stars: int
    forks: int
    language: Optional[str] = None
    url: str
    updated_at: Optional[datetime] = None


class Repository(RepositoryBase):
    """Repository response schema."""
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PolicyBase(BaseModel):
    """Base policy schema with common fields."""
    filename: str
    file_path: str
    file_url: str
    content: str
    summary: Optional[str] = None
    tags: list[str] = []
    ai_score: Optional[float] = None
    language: str = "en"


class PolicyCreate(PolicyBase):
    """Schema for creating a new policy."""
    repo_id: UUID


class PolicyUpdate(BaseModel):
    """Schema for updating a policy (all fields optional)."""
    summary: Optional[str] = None
    tags: Optional[list[str]] = None
    ai_score: Optional[float] = None
    upvotes_count: Optional[int] = None
    downvotes_count: Optional[int] = None


class Policy(PolicyBase):
    """Policy response schema matching frontend expectations."""
    id: UUID
    repo_id: UUID
    upvotes_count: int = 0
    downvotes_count: int = 0
    created_at: datetime
    repo: Repository  # Include repository details (denormalized for easier access)
    
    model_config = ConfigDict(from_attributes=True)


class PolicyListResponse(BaseModel):
    """Paginated list response for policies."""
    items: list[Policy]
    total: int
    page: int
    page_size: int
    total_pages: int


class SearchQuery(BaseModel):
    """Search query parameters."""
    q: Optional[str] = None  # Search query string
    language: Optional[str] = None  # Filter by repo language
    tag: Optional[str] = None  # Filter by tag
    min_score: Optional[float] = None  # Minimum AI score
    max_score: Optional[float] = None  # Maximum AI score
    sort_by: Optional[str] = "recent"  # Sort by: "votes", "recent", "ai-score"
    page: int = 1
    page_size: int = 20


