/**
 * Policy API Utilities
 * 
 * Reusable functions for fetching policies from the API.
 * Handles search, sorting, pagination, and error handling.
 * 
 * Reference: backend/app/routers/policies.py
 */

import { apiGet, ApiError } from "./api-client";
import type { PolicyListResponse } from "./api-types";

/**
 * Sort option type for policies
 * 
 * Only "recent" is available - policies are sorted by creation date (most recent first).
 */
export type PolicySortOption = "recent";

/**
 * Parameters for fetching policies
 */
export interface FetchPoliciesParams {
  /** Search query string (searches in filename, summary, tags) */
  searchQuery?: string;
  /** Sort option */
  sortBy?: PolicySortOption;
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Filter by repository language */
  language?: string;
  /** Filter by tag */
  tag?: string;
  /** Cache option - 'no-store' for fresh data, or revalidate seconds */
  cache?: "no-store" | { revalidate: number };
}

/**
 * Default fetch parameters
 */
const DEFAULT_PARAMS: Required<Pick<FetchPoliciesParams, "sortBy" | "page" | "pageSize">> = {
  sortBy: "recent",
  page: 1,
  pageSize: 100,
};

/**
 * Valid sort options
 * 
 * Only "recent" is available - policies sorted by creation date (most recent first).
 */
const VALID_SORT_OPTIONS: PolicySortOption[] = ["recent"];

/**
 * Validate and normalize sort option
 * 
 * @param sortBy - Sort option to validate
 * @returns Always returns "recent" (only valid option)
 */
function validateSortOption(sortBy?: string): PolicySortOption {
  // Only "recent" is valid - always return it
  return "recent";
}

/**
 * Fetch policies from the API
 * 
 * Automatically uses the search endpoint if a search query is provided,
 * otherwise uses the regular list endpoint. Supports all filters and sorting.
 * 
 * @param params - Fetch parameters
 * @returns Promise resolving to PolicyListResponse
 * @throws {ApiError} When API request fails
 * 
 * @example
 * // Fetch all policies sorted by recency (default)
 * const policies = await fetchPolicies();
 * 
 * @example
 * // Search with filters
 * const results = await fetchPolicies({
 *   searchQuery: "AI usage",
 *   language: "Python",
 *   tag: "ethics"
 * });
 */
export async function fetchPolicies(
  params: FetchPoliciesParams = {}
): Promise<PolicyListResponse> {
  const {
    searchQuery = "",
    sortBy,
    page = DEFAULT_PARAMS.page,
    pageSize = DEFAULT_PARAMS.pageSize,
    language,
    tag,
    cache,
  } = params;

  // Validate and normalize sort option (always "recent")
  const validatedSortBy = validateSortOption(sortBy);

  // Build query parameters
  const queryParams = new URLSearchParams({
    sort_by: validatedSortBy,
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  // Add optional filters
  // Note: language filter is supported by both endpoints
  // tag is only supported by search endpoint
  if (language) {
    queryParams.set("language", language);
  }
  // Tag filter is only supported by search endpoint
  if (tag) {
    queryParams.set("tag", tag);
  }

  // Determine endpoint - use search endpoint if there's a search query OR any filters
  // The search endpoint supports all filters (language, tag), while the
  // regular endpoint only supports language filter
  // Reference: backend/app/routers/policies.py
  const trimmedQuery = searchQuery.trim();
  const hasFilters = language || tag;
  let endpoint: string;
  let cacheOptions: FetchPoliciesParams["cache"];

  if (trimmedQuery || hasFilters) {
    // Use search endpoint when query exists or filters are applied
    // Reference: backend/app/routers/policies.py search_policies
    if (trimmedQuery) {
      queryParams.set("q", trimmedQuery);
    }
    endpoint = `/policies/search/all`;
    // Always fetch fresh data for search/filtered results
    cacheOptions = cache || "no-store";
  } else {
    // Use regular list endpoint when no search query and no filters
    // Reference: backend/app/routers/policies.py get_policies
    endpoint = `/policies`;
    // Use provided cache option or default to 60s revalidation
    cacheOptions = cache || { revalidate: 60 };
  }

  // Prepare fetch options
  const fetchOptions =
    cacheOptions === "no-store"
      ? { cache: "no-store" as const }
      : {
          next: { revalidate: cacheOptions.revalidate },
        };

  // For search queries, use longer timeout (60s) since they may be slower
  // Regular queries use default timeout (30s)
  const timeout = trimmedQuery || hasFilters ? 60000 : 30000;

  // Fetch from API with appropriate timeout
  return apiGet<PolicyListResponse>(
    `${endpoint}?${queryParams.toString()}`,
    {
      ...fetchOptions,
      timeout,
    }
  );
}

/**
 * Fetch policies with error handling
 * 
 * Same as fetchPolicies but returns null on error instead of throwing.
 * Useful when you want to show a fallback UI instead of error boundaries.
 * 
 * @param params - Fetch parameters
 * @returns Promise resolving to PolicyListResponse or null on error
 * 
 * @example
 * const policies = await fetchPoliciesSafe({ searchQuery: "test" });
 * if (!policies) {
 *   return <ErrorState />;
 * }
 */
export async function fetchPoliciesSafe(
  params: FetchPoliciesParams = {}
): Promise<PolicyListResponse | null> {
  try {
    return await fetchPolicies(params);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.status} - ${error.message}`);
    } else {
      console.error("Failed to fetch policies:", error);
    }
    return null;
  }
}

