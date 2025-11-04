/**
 * Trending Page (Server Component)
 * 
 * Displays the most recently added policies.
 * 
 * Reference: plan/blueprint.md - Home section (Trending)
 */

import Link from "next/link";
import { PolicyCard } from "@/components/policy-card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame } from "lucide-react";
import { fetchPoliciesSafe } from "@/lib/policy-api";

/**
 * Trending Page Component
 * 
 * Server component that fetches recent policies and displays them.
 * Policies are sorted by creation date (most recent first).
 */
export default async function TrendingPage() {
  // Fetch recent policies from API
  // Get top 60 most recent policies (3 pages of 20 each)
  // Reference: lib/policy-api.ts fetchPoliciesSafe
  const recentPoliciesData = await fetchPoliciesSafe({
    sortBy: "recent", // Get recent policies (newest first)
    page: 1,
    pageSize: 60, // Show top 60 most recent policies
    cache: { revalidate: 60 },
  });

  // Handle API errors gracefully
  if (!recentPoliciesData) {
    // Return error state
    return (
      <div className="min-h-screen main-content">
        <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Trending Policies
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

  // Get policies from the API response
  // Policies are already sorted by recency (most recent first) from the API
  const trendingPolicies = recentPoliciesData.items || [];

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
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-400/30">
                  <Flame className="h-6 w-6 text-orange-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Trending Policies
                </h1>
              </div>
              <p className="text-sm text-[oklch(0.7_0.02_270)] max-w-2xl">
                Discover the most recently added Claude.md and .cursorule files. These are the newest
                AI coding assistant policy files from GitHub.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-white">
                    {trendingPolicies.length}
                  </span>{" "}
                  recent policies
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {trendingPolicies.length} most recent policies
            </p>
          </div>
          
          {/* View Options */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs h-7">
                View All Policies
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="sm" className="text-xs h-7">
                Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Trending Policies Grid */}
        {trendingPolicies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendingPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flame className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No policies available
            </p>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Check back soon to see new policies!
            </p>
            <Link href="/">
              <Button variant="outline">Browse All Policies</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
