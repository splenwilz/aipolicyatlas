"""
Vercel serverless function entry point for FastAPI.

This file exports the FastAPI app instance for Vercel's Python runtime.
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""

from app.main import app

# Export the FastAPI app for Vercel
# Vercel will automatically handle ASGI apps
__all__ = ["app"]

