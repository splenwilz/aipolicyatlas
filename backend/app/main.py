"""
FastAPI main application entry point.

Sets up the FastAPI app with all routers, middleware, and database initialization.
Reference: https://fastapi.tiangolo.com/tutorial/
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.config import settings
from app.database import async_session_maker, engine, Base
from app.routers import crawl, policies
from debug_toolbar.middleware import DebugToolbarMiddleware

# Lifespan context manager for startup/shutdown events
# Reference: https://fastapi.tiangolo.com/advanced/events/
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown."""
    # Startup: Create database tables
    # In production, use Alembic migrations instead
    # Reference: https://docs.sqlalchemy.org/en/20/core/metadata.html#sqlalchemy.schema.MetaData.create_all
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("⚠️  API endpoints will work but database operations will fail")
        print("⚠️  Make sure PostgreSQL is running and DATABASE_URL is correct in .env")
    
    yield
    
    # Shutdown: Close database engine
    await engine.dispose()


# Create FastAPI application instance
# Reference: https://fastapi.tiangolo.com/reference/fastapi/

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API for AI Policy Atlas - Discover and explore AI policies from GitHub repositories",
    lifespan=lifespan,
    debug=settings.DEBUG,  # Controlled via DEBUG environment variable
)

# Configure CORS middleware
# Reference: https://fastapi.tiangolo.com/tutorial/cors/
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add debug toolbar middleware (only in debug mode)
# Reference: https://pypi.org/project/fastapi-debug-toolbar/
if app.debug:
    app.add_middleware(DebugToolbarMiddleware)

# Include routers
# Reference: https://fastapi.tiangolo.com/tutorial/bigger-applications/
app.include_router(policies.router, prefix=settings.API_PREFIX)
app.include_router(crawl.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_version": "v1",
        "docs": "/docs",
        "health": "/health",
        "api_base": settings.API_PREFIX,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}

