/**
 * Home Page
 * 
 * Main landing page displaying a searchable, sortable grid of policy cards.
 * 
 * Features:
 * - Search bar for filtering policies
 * - Sort options (Top voted, Recent, AI Score)
 * - Responsive grid layout
 * - Uses demo data for now
 * 
 * Reference: plan/blueprint.md - Frontend Features section
 */

"use client";

import { useState, useMemo } from "react";
import { PolicyCard } from "@/components/policy-card";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { getAllPolicies, searchPolicies, sortPolicies } from "@/lib/demo-data";

/**
 * Sort option type
 */
type SortOption = "votes" | "recent" | "ai-score";

/**
 * Home Page Component
 */
export default function Home() {
  // Get all demo policies
  const allPolicies = getAllPolicies();

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for sort option
  const [sortBy, setSortBy] = useState<SortOption>("votes");

  /**
   * Filter and sort policies based on current state
   * 
   * Memoized to avoid recalculating on every render.
   */
  const displayedPolicies = useMemo(() => {
    // Step 1: Filter by search query
    const filtered = searchQuery
      ? searchPolicies(searchQuery)
      : allPolicies;

    // Step 2: Sort the filtered results
    return sortPolicies(filtered, sortBy);
  }, [searchQuery, sortBy, allPolicies]);

  /**
   * Handle search query changes from SearchBar
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * Handle sort option change
   */
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

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
              AI Policy Atlas • Discover the best policies
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-8 md:mb-10 text-white">
              Build, Discover & Learn from{" "}
              <span className="bg-gradient-to-r from-cyan-400/80 via-purple-400/80 to-pink-400/80 bg-clip-text text-transparent">
                AI Policies
              </span>
            </h1>
            <p className="text-lg text-[oklch(0.8_0.02_270)] max-w-2xl">
              The all-in-one place for developers who want to explore how open-source projects define and govern AI usage.
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by policy name, summary, or tags..."
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Sort by:
              </span>
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={sortBy === "votes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSortChange("votes")}
                  className="text-xs"
                >
                  Top Voted
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSortChange("recent")}
                  className="text-xs"
                >
                  Recent
                </Button>
                <Button
                  variant={sortBy === "ai-score" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSortChange("ai-score")}
                  className="text-xs"
                >
                  AI Score
                </Button>
              </div>
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
            {displayedPolicies.length === 1
              ? "1 policy found"
              : `${displayedPolicies.length} policies found`}
            {searchQuery && (
              <span className="ml-2">
                for &quot;<span className="font-medium">{searchQuery}</span>&quot;
              </span>
            )}
          </p>
        </div>

        {/* Policies Grid */}
        {displayedPolicies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {displayedPolicies.map((policy) => (
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