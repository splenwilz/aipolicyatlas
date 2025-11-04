"""
Vercel serverless function entry point for FastAPI.

This file exports the FastAPI app instance for Vercel's Python runtime.
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""

from app.main import app

# Export the FastAPI app for Vercel
# Vercel's Python runtime automatically detects ASGI apps when exported as 'app'
# Alternative: export as 'handler' if 'app' doesn't work
__all__ = ["app"]

# Explicitly export as handler for Vercel compatibility
handler = app

