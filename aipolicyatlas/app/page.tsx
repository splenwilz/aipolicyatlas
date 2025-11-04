/**
 * Home Page Component (Server Component)
 * 
 * Fetches policies from the API based on URL search parameters.
 * Uses search params for state management instead of client-side state.
 * 
 * Reference: Next.js Server Components
 * https://nextjs.org/docs/app/building-your-application/rendering/server-components
 * 
 * Reference: Next.js searchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

import { PolicyCard } from "@/components/policy-card";
import { SearchBarUrl } from "@/components/search-bar-url";
import { SortButtons } from "@/components/sort-buttons";
import { CopyUrlButton } from "@/components/copy-url-button";
import { fetchPoliciesSafe, type PolicySortOption } from "@/lib/policy-api";

/**
 * Home Page Component
 * 
 * Server component that:
 * 1. Reads search params from URL (q, sort_by)
 * 2. Fetches policies from API based on search params
 * 3. Renders policies with client components for interactivity
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams (required in Next.js 15+)
  // Reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params
  const params = await searchParams;

  // Extract search query and sort option from URL params
  const searchQuery = typeof params.q === "string" ? params.q : "";
  const sortBy = (typeof params.sort_by === "string" ? params.sort_by : "votes") as PolicySortOption;

  // Fetch policies from API using reusable function
  // Reference: lib/policy-api.ts fetchPolicies
  const policyData = await fetchPoliciesSafe({
    searchQuery,
    sortBy,
    page: 1,
    pageSize: 100,
  });

  // Handle API errors gracefully
  if (!policyData) {

    // Return error state
    return (
      <div className="min-h-screen main-content">
        <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
              <div className="mb-10 md:mb-12">
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[oklch(0.25_0.1_280_/_0.3)] border border-[oklch(0.4_0.15_280_/_0.4)] text-xs text-purple-300">
                  Claude & Cursor Policy Directory • Discover AI assistant rules
                </div>
                <h1 className="text-5xl font-bold tracking-tight mb-8 md:mb-10 text-white">
                  Discover & Learn from{" "}
                  <span className="bg-gradient-to-r from-cyan-400/80 via-purple-400/80 to-pink-400/80 bg-clip-text text-transparent">
                    Claude.md & .cursorule Files
                  </span>
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

  // Extract policies from API response
  const policies = policyData.items || [];
  const totalCount = policyData.total || 0;

  return (
    <div className="min-h-screen main-content">
      {/* Header Section */}
      <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
        {/* Subtle gradient overlay on header */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
          {/* Title and Description */}
          <div className="mb-10 md:mb-12">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[oklch(0.25_0.1_280_/_0.3)] border border-[oklch(0.4_0.15_280_/_0.4)] text-xs text-purple-300">
                      Claude & Cursor Policy Directory • Discover AI assistant rules
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-8 md:mb-10 text-white">
                      Discover & Learn from{" "}
              <span className="bg-gradient-to-r from-cyan-400/80 via-purple-400/80 to-pink-400/80 bg-clip-text text-transparent">
                        Claude.md & .cursorule Files
              </span>
            </h1>
            <p className="text-lg text-[oklch(0.8_0.02_270)] max-w-2xl">
                      The all-in-one directory for exploring Claude.md and .cursorule files from GitHub repositories. 
                      Discover how open-source projects configure their AI coding assistants.
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Bar (Client Component) */}
            <div className="flex-1">
                <SearchBarUrl placeholder="Search Claude.md and .cursorule files..." />
            </div>

              {/* Actions: Sort and Copy URL */}
              <div className="flex items-center gap-3">
                {/* Sort Buttons (Client Component) */}
                <SortButtons currentSort={sortBy} />
                
                {/* Copy Page URL Button - allows sharing filtered/search results */}
                <CopyUrlButton
                  label="Copy Link"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                />
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {totalCount === 1
              ? "1 policy found"
              : `${totalCount} policies found`}
            {searchQuery && (
              <span className="ml-2">
                for &quot;<span className="font-medium">{searchQuery}</span>&quot;
              </span>
            )}
          </p>
        </div>

        {/* Policies Grid */}
        {policies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
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
              {searchQuery
                ? "Try adjusting your search query or filters."
                : "No policies are available at the moment."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}