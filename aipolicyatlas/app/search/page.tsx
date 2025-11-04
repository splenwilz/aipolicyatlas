/**
 * Search Page (Server Component)
 * 
 * Advanced search and filtering page for Claude.md and .cursorule files.
 * 
 * Features:
 * - Full-text search
 * - Filter by language
 * - Filter by tags
 * - Results display with policy cards
 * 
 * Reference: plan/blueprint.md - Search & Filters section
 * Reference: backend/app/routers/policies.py search_policies endpoint
 */

import { PolicyCard } from "@/components/policy-card";
import { SearchBarUrl } from "@/components/search-bar-url";
import { SortButtons } from "@/components/sort-buttons";
import { SearchFilters } from "@/components/search-filters";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { fetchPoliciesSafe, type PolicySortOption } from "@/lib/policy-api";
import {
  fetchAvailableLanguages,
  fetchAvailableTags,
} from "@/lib/meta-api";

/**
 * Search Page Component
 * 
 * Server component that fetches policies based on URL search parameters.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams (required in Next.js 15+)
  const params = await searchParams;

  // Extract search parameters from URL
  const searchQuery = typeof params.q === "string" ? params.q : "";
  const language = typeof params.language === "string" && params.language !== "all"
    ? params.language
    : undefined;
  const tag = typeof params.tag === "string" && params.tag !== "all"
    ? params.tag
    : undefined;
  const sortBy = (typeof params.sort_by === "string"
    ? params.sort_by
    : "recent") as PolicySortOption;

  // Check if any filters are active
  const hasActiveFilters =
    !!searchQuery ||
    !!language ||
    !!tag;

  // Fetch policies with filters using reusable function
  // Reference: lib/policy-api.ts fetchPolicies
  const policyData = await fetchPoliciesSafe({
    searchQuery,
    language,
    tag,
    sortBy,
    page: 1,
    pageSize: 100, // Get more results for search
    cache: "no-store", // Always fetch fresh data for search
  });

  // Handle API errors gracefully
  if (!policyData) {
    // Return error state
    return (
      <div className="min-h-screen main-content">
        <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
                  Search Claude & Cursor Policies
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Failed to load policies
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Please try refreshing the page or check if the API server is running.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Fetch available languages and tags from meta endpoints
  // These endpoints return distinct values directly from the database
  // Reference: backend/app/routers/policies.py meta endpoints
  // Use Promise.allSettled to ensure page renders even if meta endpoints fail
  const [languagesResult, tagsResult] = await Promise.allSettled([
    fetchAvailableLanguages(),
    fetchAvailableTags(),
  ]);
  
  // Extract results with fallback to empty arrays
  const availableLanguages =
    languagesResult.status === "fulfilled" ? languagesResult.value : [];
  const availableTags =
    tagsResult.status === "fulfilled" ? tagsResult.value : [];

  // Extract policies from API response
  const policies = policyData.items || [];
  const totalCount = policyData.total || 0;

  // Current filter values for display
  const currentLanguage = language || "all";
  const currentTag = tag || "all";

  return (
    <div className="min-h-screen main-content">
      {/* Header Section */}
      <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
        {/* Subtle gradient overlay on header */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
                Search Claude & Cursor Policies
              </h1>
              <p className="text-sm text-[oklch(0.7_0.02_270)]">
                Find Claude.md and .cursorule files by keywords, tags, and language
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBarUrl
                placeholder="Search Claude.md and .cursorule files..."
                className="max-w-2xl"
              />
            </div>

            {/* Filters Section (Client Component) */}
            <SearchFilters
              currentLanguage={currentLanguage}
              currentTag={currentTag}
              availableLanguages={availableLanguages}
              availableTags={availableTags}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {totalCount === 1
                ? "1 policy found"
                : `${totalCount} policies found`}
              {hasActiveFilters && (
                <span className="ml-2 text-xs text-muted-foreground/70">
                  (filtered results)
                </span>
              )}
            </p>
          </div>

          {/* Sort Options (Client Component) */}
          <SortButtons currentSort={sortBy} />
        </div>

        {/* Policies Grid */}
        {policies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No policies found
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {hasActiveFilters
                ? "Try adjusting your search query or filters."
                : "No policies are available at the moment."}
            </p>
            {hasActiveFilters && (
              <ClearFiltersButton variant="outline" className="mt-4" />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
