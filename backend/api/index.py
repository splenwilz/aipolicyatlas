"""
Vercel serverless function entry point for FastAPI.

This file exports the FastAPI app instance for Vercel's Python runtime.
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""

import sys
import traceback

try:
    from app.main import app
    
    # Vercel's Python runtime automatically detects ASGI apps
    # Export as both 'app' and 'handler' for compatibility
    handler = app
    
    # Print startup info for debugging (visible in Vercel logs)
    print("✅ FastAPI app imported successfully")
    print(f"✅ App routes: {[route.path for route in app.routes]}")
    
except Exception as e:
    # Print detailed error for debugging
    print(f"❌ Failed to import FastAPI app: {e}")
    print(f"❌ Error type: {type(e).__name__}")
    traceback.print_exc()
    sys.exit(1)

