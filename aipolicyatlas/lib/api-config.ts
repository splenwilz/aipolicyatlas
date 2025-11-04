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
 * API version prefix (matches backend API_PREFIX)
 * Backend uses /api/v1 by default
 * Reference: backend/app/config.py
 */
export const API_VERSION = '/api/v1';

/**
 * Get the base URL for the backend API
 * Validates that NEXT_PUBLIC_API_URL is set when accessed
 * 
 * @returns The API base URL
 * @throws Error if NEXT_PUBLIC_API_URL is not set
 */
function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiBaseUrl) {
    const isVercel = process.env.VERCEL === '1';
    const envHint = isVercel
      ? '\n\nFor Vercel deployments:\n' +
        '1. Go to Project Settings → Environment Variables\n' +
        '2. Add NEXT_PUBLIC_API_URL for "Production" environment\n' +
        '3. Redeploy your application after setting the variable\n' +
        '4. Make sure the variable name is exactly "NEXT_PUBLIC_API_URL" (case-sensitive)'
      : '\n\nFor local development:\n' +
        '1. Create a .env.local file in the project root\n' +
        '2. Add: NEXT_PUBLIC_API_URL=http://localhost:8000';
    
    throw new Error(
      'NEXT_PUBLIC_API_URL environment variable is required. ' +
      'This variable must be set before building the application.\n' +
      'Example values:\n' +
      '  - Development: http://localhost:8000\n' +
      '  - Production: https://api.yourdomain.com' +
      envHint
    );
  }
  
  return apiBaseUrl;
}

/**
 * Base URL for the backend API
 * Must be set via NEXT_PUBLIC_API_URL environment variable
 * 
 * Example values:
 * - Development: http://localhost:8000
 * - Production: https://api.yourdomain.com
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Full API base URL with version prefix
 * Example: http://localhost:8000/api/v1 or https://api.yourdomain.com/api/v1
 */
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

