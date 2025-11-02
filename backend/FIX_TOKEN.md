# Fix: Bad Credentials Error

## The Problem

The code is **IDENTICAL** to your original working code. The issue is:

1. **Environment variable overriding .env file**: Pydantic-settings loads environment variables FIRST, then `.env` file
2. If you have `GITHUB_TOKEN` set in your shell, it overrides the `.env` value
3. The environment variable is likely an old/expired token

## The Solution

### Option 1: Unset the environment variable (Recommended)

```bash
unset GITHUB_TOKEN
```

Then restart Celery worker.

### Option 2: Set environment variable to correct token

```bash
export GITHUB_TOKEN='your_new_token_here'
```

### Option 3: Use .env only (remove from shell)

Add this to your `~/.zshrc` or `~/.bashrc`:

```bash
unset GITHUB_TOKEN  # Remove any set token
```

## Verify

Run this test script:

```bash
cd backend
uv run python3 test_original_pattern.py
```

If it works, Celery will work too.

## Code Comparison

**Your Original (Working):**
```python
GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE"
auth = Auth.Token(GITHUB_TOKEN)
g = Github(auth=auth)
results = g.search_code(query)
```

**My Code (Identical Pattern):**
```python
auth = Auth.Token(settings.GITHUB_TOKEN)
self.github = Github(auth=auth)
results = self.github.search_code(query)
```

**The pattern is EXACTLY the same!** The only difference is where the token comes from.


