# AI Policy Atlas Backend

FastAPI backend for the AI Policy Atlas platform. Provides REST API endpoints for fetching, searching, and managing AI policy files from GitHub repositories.

## Features

- ✅ FastAPI with async PostgreSQL support
- ✅ SQLAlchemy 2.0 ORM with async sessions
- ✅ Alembic for database migrations
- ✅ GitHub API integration for crawling policy files
- ✅ RESTful API endpoints matching frontend requirements
- ✅ CORS configuration for frontend integration
- ✅ Environment-based configuration

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL database (local or remote)
- GitHub Personal Access Token
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   uv sync
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and GitHub token
   ```

3. **Create database:**
   ```bash
   # Create PostgreSQL database
   createdb aipolicyatlas
   ```

4. **Run migrations:**
   ```bash
   uv run alembic upgrade head
   ```

5. **Start the server:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

### Policies

- `GET /api/policies` - Get paginated list of policies
  - Query params: `page`, `page_size`, `sort_by` (votes, recent, ai-score)
  
- `GET /api/policies/{id}` - Get single policy by ID

- `GET /api/search/all` - Search policies with filters
  - Query params: `q` (search query), `language`, `tag`, `min_score`, `max_score`, `sort_by`, `page`, `page_size`

### Crawler

- `POST /api/crawl/trigger` - Trigger GitHub crawl to fetch and index policy files

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session management
│   ├── models.py            # SQLAlchemy models (Repository, Policy)
│   ├── schemas.py           # Pydantic schemas for API validation
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── policies.py      # Policy API endpoints
│   │   └── crawl.py         # Crawler API endpoints
│   └── services/
│       ├── __init__.py
│       └── github_crawler.py  # GitHub crawling service
├── alembic/                 # Database migrations
│   ├── env.py              # Alembic configuration
│   └── versions/           # Migration files
├── alembic.ini             # Alembic configuration file
├── pyproject.toml          # Project dependencies
└── .env.example            # Environment variables template
```

## Environment Variables

See `.env.example` for all available configuration options:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `GITHUB_TOKEN` - GitHub Personal Access Token (required)
- `GITHUB_STAR_THRESHOLD` - Minimum stars for repos (default: 50)
- `GITHUB_RESULT_LIMIT` - Max files per crawl (default: 100)
- `API_PREFIX` - API route prefix (default: /api)
- `CORS_ORIGINS` - Allowed CORS origins (JSON array)

## Database Migrations

### Create a new migration:

```bash
uv run alembic revision --autogenerate -m "description"
```

### Apply migrations:

```bash
uv run alembic upgrade head
```

### Rollback migration:

```bash
uv run alembic downgrade -1
```

## Celery Setup

### Prerequisites

Install and start Redis (required for Celery broker):

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

### Running Celery Worker

Start the Celery worker to process background tasks:

```bash
# Option 1: Using script
./scripts/start_celery_worker.sh

# Option 2: Direct command
uv run celery -A app.celery_app worker --loglevel=info
```

### Running Celery Beat (Periodic Tasks)

Start Celery Beat to schedule periodic crawls (runs every 2 minutes):

```bash
# Option 1: Using script
./scripts/start_celery_beat.sh

# Option 2: Direct command
uv run celery -A app.celery_app beat --loglevel=info
```

**Note**: In production, run Beat on only one server to avoid duplicate task execution. 
**Note**: Current schedule is every 2 minutes (120 seconds). Adjust in `app/celery_app.py` if needed.

### Running Both Worker and Beat Together

For development, you can run both in one process:

```bash
uv run celery -A app.celery_app worker --beat --loglevel=info
```

### Monitoring Celery Tasks

Install Flower for web-based monitoring:

```bash
uv pip install flower
uv run celery -A app.celery_app flower
```

Then visit `http://localhost:5555` to monitor tasks.

## Development

### Running with auto-reload:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

### Running tests (when implemented):

```bash
uv run pytest
```

## Architecture Notes

### Database Models

- **Repository**: Stores GitHub repository metadata
- **Policy**: Stores AI policy file content and metadata

### Fetching and Storing Strategy

1. **Discovery**: GitHub Search API finds files by filename patterns
2. **Fetch**: Retrieve file content and repository metadata
3. **Store**: Save to PostgreSQL with deduplication (by repo full_name + file_path)
4. **Update**: Update existing records if content changes

The crawler is triggered via `/api/crawl/trigger` endpoint. In production, consider:
- Background task queue (Celery, RQ)
- Scheduled crawls (cron jobs)
- Incremental updates (only fetch updated files)

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PyGithub Documentation](https://pygithub.readthedocs.io/)
- [Project Blueprint](../plan/blueprint.md)

