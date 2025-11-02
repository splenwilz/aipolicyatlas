# Celery Guide - See It In Action

## Quick Start (Easiest Way)

Run both worker and beat together in one terminal:

```bash
cd backend
./scripts/start_celery_all.sh
```

Or directly:
```bash
cd backend
uv run celery -A app.celery_app worker --beat --loglevel=info
```

You'll see output like:
```
[INFO] celery@your-machine ready.
[INFO] beat: Starting...
[INFO] beat: Scheduler: Sending crawl-github-policies
[INFO] Task app.tasks.crawl_github_policies[xxx] received
[INFO] Task app.tasks.crawl_github_policies[xxx] started
🔍 Searching for: filename:.cursorule
✅ Found: user/repo (150⭐) → AI_RULES.md [Created]
```

## Option 2: Separate Processes (Production Style)

### Terminal 1 - Celery Worker
```bash
cd backend
uv run celery -A app.celery_app worker --loglevel=info
```

### Terminal 2 - Celery Beat (Scheduler)
```bash
cd backend
uv run celery -A app.celery_app beat --loglevel=info
```

## What You'll See

### When Beat Scheduler Runs:
```
beat: Scheduler: Sending crawl-github-policies
```

This happens every 2 minutes automatically.

### When Worker Processes Tasks:
```
[INFO] Task app.tasks.crawl_github_policies[xxx] received
[INFO] Task app.tasks.crawl_github_policies[xxx] started
🔍 Searching for: filename:.cursorule
✅ user/repo (150⭐) → AI_RULES.md [Created]
[INFO] Task app.tasks.crawl_github_policies[xxx] succeeded
```

## Manual Testing

### 1. Trigger Task via API:
```bash
curl -X POST http://localhost:8000/api/crawl/trigger
```

Response:
```json
{
  "status": "queued",
  "task_id": "xxx-xxx-xxx",
  "check_status": "/api/crawl/status/xxx-xxx-xxx"
}
```

### 2. Check Task Status:
```bash
curl http://localhost:8000/api/crawl/status/xxx-xxx-xxx
```

### 3. Watch Worker Logs:
The worker terminal will show:
- Task received
- Crawling progress
- Results/stats

## Monitoring with Flower (Optional)

Install Flower for web-based monitoring:

```bash
uv pip install flower
uv run celery -A app.celery_app flower
```

Visit `http://localhost:5555` for:
- Active tasks
- Task history
- Worker status
- Scheduled tasks

## Expected Behavior

1. **Every 2 minutes**: Beat scheduler sends the crawl task
2. **Worker picks up task**: Processes GitHub crawling
3. **Stores in database**: Unique data only (deduplicated)
4. **Updates existing**: If content changed (hash comparison)
5. **Logs progress**: Shows repos found, created, updated

## Troubleshooting

### Redis Not Running:
```bash
brew services start redis  # macOS
redis-cli ping  # Should return PONG
```

### Task Stuck in PENDING:
- Check if worker is running
- Check Redis connection
- Check logs for errors

### No Tasks Executing:
- Verify Beat scheduler is running
- Check `beat_schedule` in `app/celery_app.py`
- Verify task name matches: `app.tasks.crawl_github_policies`


