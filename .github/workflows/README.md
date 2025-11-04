# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automatically triggering crawls in production.

## Workflows

### 1. `crawl-update.yml`
- **Schedule**: Runs every 2 hours
- **Purpose**: Updates existing repositories (checks for changes)
- **Mode**: `update` (efficient, minimal API calls)

### 2. `crawl-discover.yml`
- **Schedule**: Runs daily at 02:00 UTC
- **Purpose**: Discovers new repositories from GitHub
- **Mode**: `discover` (searches for new policy files)

## Setup

### 1. Configure GitHub Secret

Add your production API URL as a GitHub secret:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `API_URL`
5. Value: Your production API URL (e.g., `https://your-api.vercel.app`)

### 2. Update Workflow Files

If you don't set the `API_URL` secret, update the default value in both workflow files:

```yaml
API_URL: ${{ secrets.API_URL || 'https://your-api.vercel.app' }}
```

Replace `https://your-api.vercel.app` with your actual production API URL.

## Manual Triggering

Both workflows can be triggered manually:

1. Go to **Actions** tab in your GitHub repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Choose the mode (update, discover, or both)
5. Click **Run workflow**

## Schedule Customization

You can customize the schedule by editing the cron expressions:

- **Update workflow**: Currently `0 */2 * * *` (every 2 hours)
- **Discover workflow**: Currently `0 2 * * *` (daily at 02:00 UTC)

Cron format: `minute hour day month day-of-week`

Examples:
- `0 */2 * * *` - Every 2 hours
- `0 2 * * *` - Daily at 02:00 UTC
- `0 0,12 * * *` - Twice daily at 00:00 and 12:00 UTC
- `0 0 * * 0` - Weekly on Sunday at 00:00 UTC

## Monitoring

Check the workflow runs in the **Actions** tab to see:
- When crawls were triggered
- Success/failure status
- Response from the API

## Notes

- Workflows run on GitHub's servers, so they're free for public repositories
- Maximum frequency: Once per 5 minutes (GitHub Actions limit)
- For more frequent updates, consider using a dedicated cron service or running Celery Beat on a separate platform

