"""
FastAPI main application entry point.

Sets up the FastAPI app with all routers, middleware, and database initialization.
Reference: https://fastapi.tiangolo.com/tutorial/
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import async_session_maker, engine
from app.routers import crawl, policies

# Only import debug toolbar if debug mode is enabled
if settings.DEBUG:
    from debug_toolbar.middleware import DebugToolbarMiddleware

# Note: Lifespan events removed for serverless compatibility
# Vercel serverless functions don't reliably handle FastAPI lifespan events
# Database connections are established lazily on first request
# Reference: https://fastapi.tiangolo.com/advanced/events/
# For serverless: Avoid lifespan events - they can cause FUNCTION_INVOCATION_FAILED

# Create FastAPI application instance
# Reference: https://fastapi.tiangolo.com/reference/fastapi/
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API for AI Policy Atlas - Discover and explore AI policies from GitHub repositories",
    # lifespan removed for Vercel serverless compatibility
    debug=settings.DEBUG,  # Controlled via DEBUG environment variable
)

# Print startup info (runs at module import, safe for serverless)
print("🚀 FastAPI app initialized")
print(f"📋 API Prefix: {settings.API_PREFIX}")
print(f"🔧 Debug Mode: {settings.DEBUG}")

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
if app.debug and settings.DEBUG:
    try:
        from debug_toolbar.middleware import DebugToolbarMiddleware
        app.add_middleware(DebugToolbarMiddleware)
    except ImportError:
        print("⚠️  Debug toolbar not available")

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

