# Testing the Incremental Crawler with curl

This guide shows how to test the new incremental update system using curl commands.

## Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --port 8000
   ```

2. **Run database migration:**
   ```bash
   cd backend
   uv run alembic upgrade head
   ```
   This adds the `last_crawled_at` column to the `repositories` table.

3. **Celery worker running (optional, for background tasks):**
   ```bash
   cd backend
   uv run celery -A app.celery_app worker --loglevel=info
   ```

4. **Redis running** (for Celery):
   ```bash
   redis-server
   ```

## Test Commands

### 1. Check API Health

```bash
# Basic health check
curl http://localhost:8000/health

# API info
curl http://localhost:8000/
```

**Expected response:**
```json
{"status": "healthy"}
```

---

### 2. Test Update Mode (Most Efficient)

Update mode checks existing repositories for changes:

```bash
# Update mode only (checks existing repos)
curl -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=update" | jq .

# Discovery mode only (searches for new repos)
curl -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=discover" | jq .

# Both modes (default)
curl -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=both" | jq .
# or simply:
curl -X POST http://localhost:8000/api/v1/crawl/trigger | jq .
```

**Expected response:**
```json
{
  "status": "queued",
  "message": "Crawl task queued successfully (mode: update)",
  "task_id": "abc123-def456-...",
  "mode": "update",
  "check_status": "/api/v1/crawl/status/abc123-def456-..."
}
```

---

### 3. Trigger Crawl and Get Task ID

```bash
# Trigger crawl (runs in "both" mode by default)
RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/crawl/trigger)

# Extract task ID
TASK_ID=$(echo $RESPONSE | jq -r '.task_id')

echo "Task ID: $TASK_ID"
```

**Expected response:**
```json
{
  "status": "queued",
  "message": "Crawl task queued successfully",
  "task_id": "abc123-def456-...",
  "check_status": "/api/v1/crawl/status/abc123-def456-..."
}
```

---

### 4. Check Crawl Status

```bash
# Replace TASK_ID with actual task ID from step 3
TASK_ID="abc123-def456-..."  # Your task ID here

curl http://localhost:8000/api/v1/crawl/status/$TASK_ID | jq .
```

**Status responses:**

**Pending:**
```json
{
  "task_id": "...",
  "state": "PENDING",
  "message": "Task is waiting to be processed"
}
```

**In Progress:**
```json
{
  "task_id": "...",
  "state": "PROGRESS",
  "info": {...}
}
```

**Success:**
```json
{
  "task_id": "...",
  "state": "SUCCESS",
  "result": {
    "status": "success",
    "message": "Crawl completed successfully",
    "stats": {
      "searched": 10,
      "processed": 5,
      "created": 2,
      "updated": 1,
      "skipped": 2,
      "errors": 0,
      "repos_checked": 3
    }
  }
}
```

---

### 5. Test Different Crawl Modes

Test each mode individually:

```bash
# 1. Update mode (efficient, checks existing repos only)
echo "🔄 Testing UPDATE mode..."
TASK_UPDATE=$(curl -s -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=update")
TASK_ID_UPDATE=$(echo $TASK_UPDATE | jq -r '.task_id')
echo "Task ID: $TASK_ID_UPDATE"
sleep 10
curl -s "http://localhost:8000/api/v1/crawl/status/$TASK_ID_UPDATE" | jq '.result.stats'
echo ""

# 2. Discovery mode (searches for new repos)
echo "🔍 Testing DISCOVERY mode..."
TASK_DISCOVER=$(curl -s -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=discover")
TASK_ID_DISCOVER=$(echo $TASK_DISCOVER | jq -r '.task_id')
echo "Task ID: $TASK_ID_DISCOVER"
sleep 10
curl -s "http://localhost:8000/api/v1/crawl/status/$TASK_ID_DISCOVER" | jq '.result.stats'
echo ""

# 3. Both modes (default)
echo "🔄🔍 Testing BOTH modes..."
TASK_BOTH=$(curl -s -X POST "http://localhost:8000/api/v1/crawl/trigger?mode=both")
TASK_ID_BOTH=$(echo $TASK_BOTH | jq -r '.task_id')
echo "Task ID: $TASK_ID_BOTH"
sleep 10
curl -s "http://localhost:8000/api/v1/crawl/status/$TASK_ID_BOTH" | jq '.result.stats'
```

---

### 6. Verify Database Has `last_crawled_at`

You can check if repositories have the new field by querying policies and checking the related repo:

```bash
# Get a policy to see its repository info
curl "http://localhost:8000/api/v1/policies?page=1&page_size=1" | jq '.items[0]'

# Or query a specific policy's repository
curl "http://localhost:8000/api/v1/policies/{policy_id}" | jq '.repo'
```

---

### 7. Complete Test Script

Save this as `test_crawler.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

echo "🔍 Testing Incremental Crawler..."
echo ""

# 1. Health check
echo "1️⃣  Checking API health..."
curl -s $BASE_URL/../health | jq .
echo ""

# 2. Trigger crawl (update mode for efficiency)
echo "2️⃣  Triggering crawl (update mode)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/crawl/trigger?mode=update")
TASK_ID=$(echo $RESPONSE | jq -r '.task_id')
MODE=$(echo $RESPONSE | jq -r '.mode')

if [ "$TASK_ID" == "null" ] || [ -z "$TASK_ID" ]; then
    echo "❌ Failed to trigger crawl"
    echo $RESPONSE | jq .
    exit 1
fi

echo "✅ Task queued: $TASK_ID (mode: $MODE)"
echo ""

# 3. Wait and check status
echo "3️⃣  Checking crawl status (waiting 5 seconds)..."
sleep 5

STATUS=$(curl -s $BASE_URL/crawl/status/$TASK_ID)
STATE=$(echo $STATUS | jq -r '.state')

echo "Status: $STATE"
echo ""

# 4. Show detailed stats if completed
if [ "$STATE" == "SUCCESS" ]; then
    echo "📊 Crawl Statistics:"
    echo $STATUS | jq '.result.stats'
    
    REPOS_CHECKED=$(echo $STATUS | jq -r '.result.stats.repos_checked // 0')
    if [ "$REPOS_CHECKED" != "null" ] && [ "$REPOS_CHECKED" -gt 0 ]; then
        echo ""
        echo "✅ Update mode worked! Checked $REPOS_CHECKED repositories"
    fi
elif [ "$STATE" == "PENDING" ] || [ "$STATE" == "PROGRESS" ]; then
    echo "⏳ Task still running. Check again with:"
    echo "   curl $BASE_URL/crawl/status/$TASK_ID"
fi
```

Make it executable:
```bash
chmod +x test_crawler.sh
./test_crawler.sh
```

---

### 8. Monitor Multiple Updates

Test that update mode is working efficiently:

```bash
# Trigger initial crawl (both modes)
curl -X POST http://localhost:8000/api/v1/crawl/trigger

# Wait 30 seconds, then trigger again
sleep 30
curl -X POST http://localhost:8000/api/v1/crawl/trigger

# Check the second crawl's stats
# It should show fewer API calls if update mode is working correctly
```

**Expected behavior:**
- First crawl: More `searched` and `processed` (discovery + update)
- Second crawl: Fewer `searched` (only update mode, only changed repos)

---

### 9. Test with jq for Better Output

Install jq if not available:
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

Then use it to format responses:
```bash
curl -s http://localhost:8000/api/v1/crawl/status/$TASK_ID | jq '.result.stats'
```

---

## Troubleshooting

### Error: "Celery is not available"
- Make sure Redis is running: `redis-server`
- Make sure Celery worker is running

### Error: Task stays in PENDING
- Check Celery worker logs
- Make sure worker is connected to Redis
- Check `CELERY_BROKER_URL` in `.env`

### No repositories found
- Check `GITHUB_TOKEN` is set in `.env`
- Check `GITHUB_STAR_THRESHOLD` (default: 50 stars)
- First crawl may take time to discover repos

### Migration fails
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run: `cd backend && uv run alembic upgrade head`

---

## Expected Results

### First Run (Both Modes)
- `repos_checked`: 0 (no repos in DB yet)
- `searched`: High (discovery mode searches GitHub)
- `created`: New repositories and policies

### Subsequent Runs (Update Mode)
- `repos_checked`: Number of repos that may have changed
- `searched`: Lower (only searches within changed repos)
- `updated`: Only policies that actually changed
- `skipped`: Many (repos that haven't changed)

This shows the incremental update is working efficiently! 🎉

