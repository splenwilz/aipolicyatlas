# GitHub Token Setup

## Issue: Bad Credentials (401)

The GitHub token in your `.env` file has expired or is invalid.

## Solution: Get a New Token

### Step 1: Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `AI Policy Atlas Crawler`
4. Select scopes:
   - ✅ `public_repo` (Access public repositories)
   - ✅ `read:org` (Read org membership) - optional but recommended
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Update .env File

```bash
cd backend
# Edit .env and replace the GITHUB_TOKEN value
GITHUB_TOKEN=your_new_token_here
```

Or use this command (replace YOUR_TOKEN_HERE):
```bash
cd backend
sed -i '' 's/GITHUB_TOKEN=.*/GITHUB_TOKEN=YOUR_TOKEN_HERE/' .env
```

### Step 3: Restart Celery Worker

After updating the token, restart the Celery worker to pick up the new token:

```bash
# Stop current worker (CTRL+C)
# Then restart:
uv run celery -A app.celery_app worker --beat --loglevel=info
```

### Step 4: Verify Token Works

The worker will now show:
```
✅ GitHub authenticated as: your-username
```

Instead of:
```
⚠️ GitHub query failed: 401 Bad credentials
```

## Token Requirements

- **Classic token** or **Fine-grained token** (classic is easier)
- **Expiration**: Set to "No expiration" for production, or set a reminder
- **Scopes**: Minimum `public_repo` for public repository access

## Security Notes

- ⚠️ Never commit `.env` file to git (it's in `.gitignore`)
- ⚠️ Never share your token publicly
- ⚠️ Regenerate token if it's exposed


