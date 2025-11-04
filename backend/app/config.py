"""
Configuration settings for the application.

Uses Pydantic Settings for type-safe configuration management.
Reference: https://docs.pydantic.dev/latest/concepts/pydantic_settings/
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env file explicitly BEFORE Pydantic loads settings
# This ensures .env file takes precedence over environment variables
# Reference: https://github.com/pydantic/pydantic-settings#environment-variable-names
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    # override=True ensures .env file values override shell environment variables
    load_dotenv(env_path, override=True)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database configuration
    # PostgreSQL connection string (async)
    # Format: postgresql+asyncpg://user:password@host:port/dbname
    # Reference: https://docs.sqlalchemy.org/en/20/core/engines.html#postgresql
    # Set via DATABASE_URL environment variable
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/aipolicyatlas")
    
    # GitHub API configuration
    # Set via GITHUB_TOKEN environment variable (required for GitHub API access)
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    # GitHub API rate limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
    # Set via GITHUB_STAR_THRESHOLD environment variable
    GITHUB_STAR_THRESHOLD: int = int(os.getenv("GITHUB_STAR_THRESHOLD", "50"))
    # Set via GITHUB_RESULT_LIMIT environment variable
    GITHUB_RESULT_LIMIT: int = int(os.getenv("GITHUB_RESULT_LIMIT", "100"))
    
    # API configuration
    # API versioning: /api/v1 allows for future version migrations
    # Reference: https://fastapi.tiangolo.com/advanced/versioning/
    # Set via API_PREFIX environment variable
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")
    # Set via CORS_ORIGINS environment variable (comma-separated list)
    # Example: CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    
    # Application metadata
    # Set via PROJECT_NAME environment variable
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI Policy Atlas API")
    # Set via VERSION environment variable
    VERSION: str = os.getenv("VERSION", "0.1.0")
    # Debug mode - enable for detailed error messages and debug toolbar
    # Set via DEBUG environment variable (default: False for production)
    # Set DEBUG=true in Vercel environment variables to enable debugging
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    
    # Celery configuration
    # Reference: https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/index.html
    # For Upstash Redis (TLS-enabled), use: rediss://default:<TOKEN>@<HOST>:6379/0?ssl_cert_reqs=required
    # For local Redis (no TLS), use: redis://localhost:6379/0
    # Reference: https://upstash.com/docs/redis/integrations/celery
    # 
    # CELERY_BROKER_URL: Message broker (queue) where tasks are sent and workers pick them up
    # Set via CELERY_BROKER_URL environment variable (defaults to localhost for development)
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    # CELERY_RESULT_BACKEND: Storage for task results (can be same as broker or different)
    # If not set, defaults to same as CELERY_BROKER_URL
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND") or os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    
    # Crawler schedule configuration
    # Update existing repositories (frequent, checks for changes)
    # Set via CRAWL_UPDATE_INTERVAL environment variable (default: 120 seconds / 2 minutes)
    CRAWL_UPDATE_INTERVAL: int = int(os.getenv("CRAWL_UPDATE_INTERVAL", "120"))
    # Discover new repositories (less frequent, searches GitHub)
    # Set via CRAWL_DISCOVERY_INTERVAL environment variable (default: 86400 seconds / 24 hours)
    CRAWL_DISCOVERY_INTERVAL: int = int(os.getenv("CRAWL_DISCOVERY_INTERVAL", "86400"))
    # Set via CRAWL_DISCOVERY_TIME environment variable (default: "02:00" UTC)
    # Format: "HH:MM" (24-hour format)
    CRAWL_DISCOVERY_TIME: str = os.getenv("CRAWL_DISCOVERY_TIME", "02:00")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore extra environment variables
        # Force .env file to take precedence over environment variables
        # This ensures .env file is used even if GITHUB_TOKEN is set in shell
        env_ignore_empty=True,
    )


# Global settings instance
settings = Settings()

