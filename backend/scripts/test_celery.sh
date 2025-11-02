#!/bin/bash
# Quick test script to verify Celery is working

echo "=== Testing Celery Setup ==="
echo ""

# Check Redis
echo "1. Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis is running"
else
    echo "   ❌ Redis is not running"
    echo "   Start it with: brew services start redis"
    exit 1
fi

# Check Celery app
echo "2. Checking Celery app..."
if uv run python3 -c "from app.celery_app import celery_app; print('OK')" > /dev/null 2>&1; then
    echo "   ✅ Celery app loads successfully"
else
    echo "   ❌ Celery app failed to load"
    exit 1
fi

# Test task import
echo "3. Checking Celery tasks..."
if uv run python3 -c "from app.tasks.crawl_tasks import crawl_github_policies; print('OK')" > /dev/null 2>&1; then
    echo "   ✅ Tasks import successfully"
else
    echo "   ❌ Tasks failed to import"
    exit 1
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To see Celery in action, run these commands in separate terminals:"
echo ""
echo "Terminal 1 - Celery Worker:"
echo "  cd backend && uv run celery -A app.celery_app worker --loglevel=info"
echo ""
echo "Terminal 2 - Celery Beat (Scheduler):"
echo "  cd backend && uv run celery -A app.celery_app beat --loglevel=info"
echo ""
echo "Terminal 3 - Trigger task manually (optional):"
echo "  curl -X POST http://localhost:8000/api/crawl/trigger"
echo ""
echo "The crawl task will run automatically every 2 minutes via Beat."
