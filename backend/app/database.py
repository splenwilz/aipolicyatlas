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

# Normalize database URL (lazy - only when needed)
def get_database_url() -> str:
    """Get normalized database URL."""
    return normalize_database_url(settings.DATABASE_URL)

# Create async engine for PostgreSQL
# Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#async-engine
# Using asyncpg driver for async PostgreSQL operations
# 
# For serverless (Vercel): Use smaller pool sizes and shorter timeouts
# Serverless functions are stateless and don't need large connection pools
# pool_pre_ping=True ensures connections are validated before use
# Reference: https://docs.sqlalchemy.org/en/20/core/pooling.html#pool-disconnects
# 
# Note: Engine creation is wrapped in try/except to prevent crashes during import
# The engine itself doesn't connect until first use, but creation can still fail
try:
    database_url = get_database_url()
    # Create engine with minimal configuration for serverless
    # asyncpg doesn't need connect_args - connection params come from the URL
    # Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#async-engine
    engine = create_async_engine(
        database_url,
        echo=False,  # Disable SQL logging in production
        future=True,  # Use SQLAlchemy 2.0 style
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        pool_size=5,  # Smaller pool for serverless
        max_overflow=5,  # Smaller overflow for serverless
        pool_timeout=10,  # Shorter timeout for serverless
    )
    print("✅ Database engine created successfully")
except Exception as e:
    print(f"⚠️  Database engine creation failed: {e}")
    print(f"⚠️  Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    engine = None  # Set to None so app can still start

# Create async session factory
# expire_on_commit=False allows accessing objects after commit
# Reference: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#using-async-sessionmaker
# Only create if engine was created successfully
if engine is not None:
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
else:
    # Create a dummy session maker that will fail gracefully
    async_session_maker = None
    print("⚠️  Session maker not created - database operations will fail")


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
    if async_session_maker is None:
        raise RuntimeError("Database not configured. Check DATABASE_URL environment variable.")
    
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


