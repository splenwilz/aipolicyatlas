"""
Vercel serverless function entry point for FastAPI.

This file exports the FastAPI app instance for Vercel's Python runtime.
Reference: https://vercel.com/docs/functions/serverless-functions/runtimes/python
"""

import sys
import traceback
import os

# Print environment info for debugging
print("=" * 50)
print("🚀 Vercel Serverless Function Starting")
print("=" * 50)
print(f"Python version: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print(f"Environment variables present: DATABASE_URL={bool(os.getenv('DATABASE_URL'))}")

try:
    print("\n📦 Importing FastAPI app...")
    from app.main import app
    
    # Vercel's Python runtime automatically detects ASGI apps
    # Export as both 'app' and 'handler' for compatibility
    handler = app
    
    # Print startup info for debugging (visible in Vercel logs)
    print("✅ FastAPI app imported successfully")
    print(f"✅ App routes registered: {len(app.routes)} routes")
    for route in app.routes[:10]:  # Print first 10 routes
        if hasattr(route, 'path'):
            print(f"   - {route.path}")
    if len(app.routes) > 10:
        print(f"   ... and {len(app.routes) - 10} more routes")
    print("=" * 50)
    
except ImportError as e:
    # Print detailed import error
    print(f"❌ Import Error: {e}")
    print(f"❌ Failed to import module: {e.name if hasattr(e, 'name') else 'unknown'}")
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    # Print detailed error for debugging
    print(f"❌ Failed to initialize FastAPI app: {e}")
    print(f"❌ Error type: {type(e).__name__}")
    print(f"❌ Error message: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

