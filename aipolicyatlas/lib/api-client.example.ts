/**
 * API Client Usage Examples
 * 
 * This file demonstrates how to use the apiFetch utilities in Next.js Server Components.
 * Delete this file once you're familiar with the API client.
 * 
 * Reference: Next.js Server Components
 * https://nextjs.org/docs/app/building-your-application/rendering/server-components
 */

import { apiGet, apiPost, apiFetch, ApiError } from './api-client';

/**
 * Example 1: Basic GET request in a Server Component
 * 
 * This is the most common use case - fetching data to render in a page.
 */
export async function ExampleServerComponent() {
  try {
    // Fetch policies with automatic caching (Next.js deduplicates identical requests)
    const policies = await apiGet('/policies', {
      cache: 'force-cache', // Cache indefinitely
    });

    return (
      <div>
        <h1>Policies</h1>
        {/* Render policies */}
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API-specific errors
      console.error(`API Error: ${error.status} - ${error.message}`);
    }
    throw error; // Let Next.js error boundary handle it
  }
}

/**
 * Example 2: GET request with query parameters
 * 
 * Note: apiFetch doesn't auto-append query params - build the URL yourself
 */
export async function ExampleWithQueryParams() {
  const page = 1;
  const pageSize = 20;

  try {
    const policies = await apiGet(
      `/policies?page=${page}&page_size=${pageSize}&sort_by=votes`,
      {
        cache: 'no-store', // Always fetch fresh data
      }
    );

    return <div>{/* Render */}</div>;
  } catch (error) {
    // Error handling...
    throw error;
  }
}

/**
 * Example 3: POST request
 */
export async function ExamplePostRequest() {
  try {
    const result = await apiPost(
      '/crawl/trigger',
      {}, // Request body (empty in this case)
      {
        timeout: 10000, // 10 second timeout
      }
    );

    return <div>{/* Render result */}</div>;
  } catch (error) {
    if (error instanceof ApiError && error.status === 408) {
      // Handle timeout
      return <div>Request took too long. Please try again.</div>;
    }
    throw error;
  }
}

/**
 * Example 4: Advanced fetch with custom options
 */
export async function ExampleAdvancedFetch() {
  try {
    const data = await apiFetch('/policies/123', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer token', // Custom header
      },
      cache: 'no-store',
      next: {
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    return <div>{/* Render */}</div>;
  } catch (error) {
    // Error handling...
    throw error;
  }
}

/**
 * Example 5: Error handling patterns
 */
export async function ExampleErrorHandling() {
  try {
    const data = await apiGet('/policies');
    return <div>{/* Success */}</div>;
  } catch (error) {
    if (error instanceof ApiError) {
      // API returned an error response
      if (error.status === 404) {
        return <div>Not found</div>;
      }
      if (error.status === 500) {
        return <div>Server error. Please try again later.</div>;
      }
      // Other error statuses
      return <div>Error: {error.message}</div>;
    }

    // Network or other errors
    return <div>Something went wrong. Please try again.</div>;
  }
}

