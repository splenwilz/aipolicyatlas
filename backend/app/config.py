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
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aipolicyatlas"
    
    # GitHub API configuration
    GITHUB_TOKEN: str = ""  # GitHub Personal Access Token
    # GitHub API rate limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
    GITHUB_STAR_THRESHOLD: int = 50  # Minimum stars for a repo to be indexed
    GITHUB_RESULT_LIMIT: int = 100  # Max files to fetch per crawl run
    
    # API configuration
    # API versioning: /api/v1 allows for future version migrations
    # Reference: https://fastapi.tiangolo.com/advanced/versioning/
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Application metadata
    PROJECT_NAME: str = "AI Policy Atlas API"
    VERSION: str = "0.1.0"
    
    # Celery configuration
    # Reference: https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/index.html
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"  # Redis broker URL
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"  # Redis result backend
    
    # Crawler schedule configuration
    # Update existing repositories (frequent, checks for changes)
    CRAWL_UPDATE_INTERVAL: int = 120  # Every 120 seconds (2 minutes)
    # Discover new repositories (less frequent, searches GitHub)
    CRAWL_DISCOVERY_INTERVAL: int = 86400  # Every 86400 seconds (24 hours / daily)
    CRAWL_DISCOVERY_TIME: str = "02:00"  # Daily discovery time (UTC), format: "HH:MM"
    
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

