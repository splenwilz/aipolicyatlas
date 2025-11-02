"""
Database models for AI Policy Atlas.

Matches the schema defined in plan/blueprint.md section 8.
Reference: https://docs.sqlalchemy.org/en/20/orm/quickstart.html
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    ARRAY,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Repository(Base):
    """
    Repository model - stores GitHub repository metadata.
    
    Matches the 'repositories' table schema from blueprint.md.
    Reference: https://docs.sqlalchemy.org/en/20/orm/mapped_sql_expr.html
    """
    __tablename__ = "repositories"
    
    # Primary key - UUID type for better distributed system support
    # Reference: https://www.postgresql.org/docs/current/datatype-uuid.html
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    
    # Repository name (e.g., "awesome-project")
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Full repository name including owner (e.g., "owner/awesome-project")
    full_name: Mapped[str] = mapped_column(String(512), nullable=False, unique=True, index=True)
    
    # GitHub stars count
    stars: Mapped[int] = mapped_column(Integer, nullable=False, default=0, index=True)
    
    # GitHub forks count
    forks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Primary programming language
    language: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    
    # GitHub repository URL
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    
    # Last update timestamp from GitHub
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    
    # Timestamp when record was created in our database
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    
    # Relationship to policies (one-to-many)
    # Reference: https://docs.sqlalchemy.org/en/20/orm/relationships.html
    policies: Mapped[list["Policy"]] = relationship(
        "Policy",
        back_populates="repo",
        cascade="all, delete-orphan",  # Delete policies if repo is deleted
    )


class Policy(Base):
    """
    Policy model - stores AI policy file content and metadata.
    
    Matches the 'policies' table schema from blueprint.md.
    """
    __tablename__ = "policies"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    
    # Foreign key to repositories table
    repo_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Original filename (e.g., "AI_RULES.md", "CODE_OF_CONDUCT.md")
    filename: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    
    # File path in repository
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    
    # Direct GitHub file URL
    file_url: Mapped[str] = mapped_column(String(512), nullable=False)
    
    # Full markdown content of the policy
    # Using Text type for unlimited length
    # Reference: https://docs.sqlalchemy.org/en/20/core/type_basics.html#sqlalchemy.types.Text
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # AI-generated summary (150-300 words)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # AI-extracted tags (array of strings)
    # Reference: https://docs.sqlalchemy.org/en/20/core/type_basics.html#sqlalchemy.types.ARRAY
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    
    # AI quality score (0-100)
    ai_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    
    # Vote counts (upvotes and downvotes)
    upvotes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, index=True)
    downvotes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Detected language of the policy content
    language: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, default="en")
    
    # Timestamp when policy was added to the system
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    
    # Relationship to repository (many-to-one)
    repo: Mapped["Repository"] = relationship(
        "Repository",
        back_populates="policies",
    )


