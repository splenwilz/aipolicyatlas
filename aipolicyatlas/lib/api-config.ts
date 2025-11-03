/**
 * API Configuration
 * 
 * Centralized configuration for API base URL and versioning.
 * Uses environment variables for flexibility across development/production.
 * 
 * Reference: Next.js Environment Variables
 * https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
 */

/**
 * Base URL for the backend API
 * Defaults to localhost:8000 for development
 * Override with NEXT_PUBLIC_API_URL environment variable
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API version prefix (matches backend API_PREFIX)
 * Backend uses /api/v1 by default
 * Reference: backend/app/config.py
 */
export const API_VERSION = '/api/v1';

/**
 * Full API base URL with version prefix
 * Example: http://localhost:8000/api/v1
 */
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

