"""
Database configuration and session management.

Uses SQLAlchemy 2.0 async engine and sessions.
Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Create async engine for PostgreSQL
# Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#async-engine
# Using asyncpg driver for async PostgreSQL operations
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    future=True,  # Use SQLAlchemy 2.0 style
)

# Create async session factory
# expire_on_commit=False allows accessing objects after commit
# Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#using-async-sessionmaker
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


async def get_db() -> AsyncSession:
    """
    Dependency function to get database session.
    
    Yields a database session for use in FastAPI route handlers.
    Session is automatically closed after the request completes.
    Reference: https://fastapi.tiangolo.com/tutorial/dependencies/
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


