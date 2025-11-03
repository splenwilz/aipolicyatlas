"""
Alembic environment configuration for async SQLAlchemy.

Configured to work with async PostgreSQL using asyncpg.
Reference: https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-migration-script
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Import our models and database base
# This ensures all models are registered with SQLAlchemy metadata
from app.database import Base
from app.models import Policy, Repository  # noqa: F401

# Import settings to get database URL
from app.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate
# Reference: https://alembic.sqlalchemy.org/en/latest/autogenerate.html
target_metadata = Base.metadata


def get_url() -> str:
    """
    Get database URL from settings.
    
    Alembic requires a synchronous database URL, but we use async.
    We'll use the same URL format but Alembic will handle it.
    """
    # Remove +asyncpg from URL for Alembic (it uses sync connection)
    url = settings.DATABASE_URL.replace("+asyncpg", "")
    return url


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Run migrations with the given connection."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Run migrations in 'online' mode with async engine.
    
    Reference: https://alembic.sqlalchemy.org/en/latest/cookbook.html#connection-sharing
    """
    try:
        # Create async engine
        connectable = create_async_engine(
            settings.DATABASE_URL,
            poolclass=pool.NullPool,
        )

        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

        await connectable.dispose()
    except Exception as e:
        print(f"Error running migrations: {e}")
        raise


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
