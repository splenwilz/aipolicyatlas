/**
 * Reusable API Client for Server Components
 * 
 * Provides type-safe, error-handling fetch utilities for Next.js Server Components.
 * Uses native fetch API extended by Next.js for automatic request deduplication and caching.
 * 
 * Reference: Next.js Data Fetching
 * https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
 * 
 * Reference: MDN Fetch API
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

import { API_URL } from './api-config';

/**
 * Custom error class for API-related errors
 * Provides more context than generic Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type for fetch request options
 * Extends RequestInit from fetch API
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 */
export type FetchOptions = RequestInit & {
  /**
   * Custom timeout in milliseconds
   * Uses AbortController to cancel requests after timeout
   * Reference: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
   */
  timeout?: number;
};

/**
 * Type-safe fetch function for internal API calls
 * 
 * Features:
 * - Automatic base URL prefixing
 * - Error handling with status codes
 * - Optional timeout support
 * - Type-safe response parsing
 * - Next.js fetch caching support (via options)
 * 
 * @param endpoint - API endpoint path (e.g., '/policies', '/policies/123')
 * @param options - Fetch options (method, headers, body, timeout, cache, etc.)
 * @returns Promise resolving to parsed JSON response
 * @throws {ApiError} When request fails or returns non-2xx status
 * 
 * @example
 * // GET request
 * const policies = await apiFetch('/policies', { cache: 'force-cache' });
 * 
 * @example
 * // POST request
 * const result = await apiFetch('/crawl/trigger', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Remove leading slash if present to avoid double slashes
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;

  // Construct full URL
  const url = `${API_URL}/${normalizedEndpoint}`;

  // Extract timeout from options (if provided)
  // Default timeout: 30 seconds for API calls
  // This prevents hanging requests if backend is unreachable
  const { timeout = 30000, ...fetchOptions } = options;

  // Setup AbortController for timeout support
  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;

  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
  }

  try {
    // Perform fetch with timeout signal
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      // Default headers - can be overridden by options
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Clear timeout if request completed
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Parse response body
    let data: T;
    const contentType = response.headers.get('content-type');

    // Handle different response types
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // For non-JSON responses, return text
      data = (await response.text()) as unknown as T;
    }

    // Check if response is successful (2xx status codes)
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return data;
  } catch (error) {
    // Clear timeout on error
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        `Request timeout after ${timeout}ms`,
        408,
        'Request Timeout'
      );
    }

    // Handle network errors (ETIMEDOUT, ECONNREFUSED, etc.)
    // These occur when the backend is unreachable or takes too long
    // Check for both TypeError with 'fetch failed' and AggregateError (Node.js fetch)
    if (
      (error instanceof TypeError && error.message.includes('fetch failed')) ||
      (error instanceof AggregateError)
    ) {
      throw new ApiError(
        `Network error: Unable to reach API server at ${API_URL}. Please check if the backend is running.`,
        0, // Use 0 to indicate network/connection error
        'Network Error',
        { cause: error }
      );
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown fetch error',
      0,
      'Network Error',
      error
    );
  }
}

/**
 * Convenience function for GET requests
 * 
 * @param endpoint - API endpoint path
 * @param options - Additional fetch options (cache, timeout, etc.)
 * @returns Promise resolving to parsed JSON response
 * 
 * @example
 * const policies = await apiGet('/policies', { cache: 'force-cache' });
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * Convenience function for POST requests
 * 
 * @param endpoint - API endpoint path
 * @param body - Request body (will be JSON stringified)
 * @param options - Additional fetch options (headers, timeout, etc.)
 * @returns Promise resolving to parsed JSON response
 * 
 * @example
 * const result = await apiPost('/crawl/trigger', {}, { timeout: 5000 });
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

