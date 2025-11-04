"""
Database configuration and session management.

Uses SQLAlchemy 2.0 async engine and sessions.
Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
"""

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Normalize DATABASE_URL to use asyncpg driver
# Converts postgresql:// to postgresql+asyncpg:// if needed
# Converts sslmode query params to ssl (asyncpg uses ssl, not sslmode)
# Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#async-engine
# Reference: https://github.com/MagicStack/asyncpg/issues/737
def normalize_database_url(url: str) -> str:
    """Normalize database URL for asyncpg driver."""
    # Convert postgresql:// to postgresql+asyncpg:// if needed
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Parse URL to handle query parameters
    parsed = urlparse(url)
    if parsed.query:
        # Parse query parameters
        query_params = parse_qs(parsed.query, keep_blank_values=True)
        
        # Convert sslmode to ssl (asyncpg uses ssl, not sslmode)
        if "sslmode" in query_params:
            sslmode_value = query_params.pop("sslmode")[0]
            # Map sslmode values to ssl values
            # require -> require, prefer -> prefer, etc.
            query_params["ssl"] = [sslmode_value]
        
        # Remove channel_binding as asyncpg doesn't support it
        query_params.pop("channel_binding", None)
        
        # Rebuild query string
        new_query = urlencode(query_params, doseq=True)
        # Reconstruct URL
        parsed = parsed._replace(query=new_query)
        url = urlunparse(parsed)
    
    return url

database_url = normalize_database_url(settings.DATABASE_URL)

# Create async engine for PostgreSQL
# Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#async-engine
# Using asyncpg driver for async PostgreSQL operations
# pool_pre_ping=True ensures connections are validated before use (important for Celery workers)
# Reference: https://docs.sqlalchemy.org/en/20/core/pooling.html#pool-disconnects
engine = create_async_engine(
    database_url,
    echo=True,  # Log SQL queries (disable in production)
    future=True,  # Use SQLAlchemy 2.0 style
    pool_pre_ping=True,  # Verify connections before using (prevents "operation in progress" errors)
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_size=20,  # Increase pool size to handle concurrent requests (default: 5)
    max_overflow=20,  # Allow overflow connections (default: 10)
    pool_timeout=30,  # Timeout for getting connection from pool (default: 30)
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


