/**
 * Top Policies Page (Server Component)
 * 
 * Displays the highest-ranked policies based on:
 * - Total votes (upvotes and downvotes)
 * - Net votes (upvotes - downvotes)
 * - AI score
 * - Combined ranking score
 * 
 * Reference: plan/blueprint.md - Leaderboard section
 */

import Link from "next/link";
import { PolicyCard } from "@/components/policy-card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api-client";
import type { PolicyListResponse } from "@/lib/api-types";
import type { Policy } from "@/types/policy";
import { SortButtonsTop } from "@/components/sort-buttons-top";

/**
 * Sort/ranking option type
 */
type TopSortOption = "net-votes" | "total-votes" | "ai-score" | "combined";

/**
 * Calculate combined ranking score
 * 
 * Combines multiple factors for overall ranking
 */
function calculateCombinedScore(policy: Policy): number {
  const netVotes = policy.upvotes_count - policy.downvotes_count;
  const totalVotes = policy.upvotes_count + policy.downvotes_count;
  
  // Normalize scores (0-1 range)
  const voteScore = Math.log(Math.max(1, netVotes + 1)) / Math.log(1000); // Log scale
  const aiScore = (policy.ai_score || 0) / 100;
  const engagementScore = Math.min(1, totalVotes / 500); // Cap at 500 votes
  
  // Weighted combination
  return (voteScore * 0.4) + (aiScore * 0.4) + (engagementScore * 0.2);
}

/**
 * Sort policies by the specified option
 */
function sortPolicies(
  policies: Policy[],
  sortBy: TopSortOption
): Policy[] {
    switch (sortBy) {
      case "net-votes":
        // Sort by net votes (upvotes - downvotes)
      return [...policies].sort((a, b) => {
          const netA = a.upvotes_count - a.downvotes_count;
          const netB = b.upvotes_count - b.downvotes_count;
          return netB - netA;
        });

      case "total-votes":
        // Sort by total votes (upvotes + downvotes)
      return [...policies].sort((a, b) => {
          const totalA = a.upvotes_count + a.downvotes_count;
          const totalB = b.upvotes_count + b.downvotes_count;
          return totalB - totalA;
        });

      case "ai-score":
        // Sort by AI score
      return [...policies].sort((a, b) => {
        const scoreA = a.ai_score || 0;
        const scoreB = b.ai_score || 0;
        return scoreB - scoreA;
      });

      case "combined":
    default: {
        // Sort by combined score
      const policiesWithScores = policies.map((policy) => ({
          policy,
          score: calculateCombinedScore(policy),
        }));
      return policiesWithScores
          .sort((a, b) => b.score - a.score)
          .map((item) => item.policy);
    }
  }
}

/**
 * Get sort option label
 */
function getSortLabel(option: TopSortOption): string {
  switch (option) {
    case "net-votes":
      return "Net Votes";
    case "total-votes":
      return "Total Votes";
    case "ai-score":
      return "AI Score";
    case "combined":
      return "Combined Score";
    default:
      return "Combined";
  }
}

/**
 * Top Policies Page Component
 * 
 * Server component that fetches policies from API and displays them ranked.
 */
export default async function TopPoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams to get sort option
  const params = await searchParams;
  const sortBy = (typeof params.sort_by === "string"
    ? params.sort_by
    : "combined") as TopSortOption;

  // Validate sort option
  const validSortOptions: TopSortOption[] = [
    "net-votes",
    "total-votes",
    "ai-score",
    "combined",
  ];
  const validatedSortBy = validSortOptions.includes(sortBy)
    ? sortBy
    : "combined";

  // Fetch policies from API
  // Backend limits page_size to 100 (le=100), so we need to fetch multiple pages
  // Reference: backend/app/routers/policies.py get_policies - page_size has le=100
  let policyData: PolicyListResponse;
  try {
    // Fetch all policies by making multiple requests (max 100 per page)
    const allPolicies: Policy[] = [];
    let currentPage = 1;
    const pageSize = 100; // Maximum allowed by backend
    let totalPages = 1;
    let total = 0;

    do {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        // For combined/total-votes, we'll fetch with votes and sort client-side
        sort_by:
          validatedSortBy === "ai-score"
            ? "ai-score"
            : validatedSortBy === "net-votes"
            ? "votes"
            : "votes", // Default for combined/total-votes
      });

      const pageData = await apiGet<PolicyListResponse>(
        `/policies?${queryParams.toString()}`,
        {
          // Cache for 60 seconds
          next: { revalidate: 60 },
        }
      );

      allPolicies.push(...(pageData.items || []));
      totalPages = pageData.total_pages;
      total = pageData.total;
      currentPage++;

      // Safety limit: don't fetch more than 10 pages (1000 policies max)
      if (currentPage > 10) break;
    } while (currentPage <= totalPages);

    // Construct a PolicyListResponse with all fetched policies
    policyData = {
      items: allPolicies,
      total: total,
      page: 1,
      page_size: allPolicies.length,
      total_pages: 1,
    };
  } catch (error) {
    // Handle API errors
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.status} - ${error.message}`);
    } else {
      console.error("Failed to fetch policies:", error);
    }

    // Return error state
    return (
      <div className="min-h-screen main-content">
        <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Top Policies
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

  // Sort policies based on selected option
  const topPolicies = sortPolicies(policyData.items || [], validatedSortBy);

  /**
   * Get rank badge for position
   */
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white text-xs font-bold shadow-lg">
          <Trophy className="h-3 w-3" />
          <span>#1</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-gray-400/90 to-gray-500/90 text-white text-xs font-bold shadow-lg">
          <Trophy className="h-3 w-3" />
          <span>#2</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-white text-xs font-bold shadow-lg">
          <Trophy className="h-3 w-3" />
          <span>#3</span>
        </div>
      );
    }
    return null;
  };

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
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Top Policies
                </h1>
              </div>
              <p className="text-sm text-[oklch(0.7_0.02_270)] max-w-2xl">
                The highest-ranked AI policies based on community votes, AI quality
                scores, and overall engagement. These represent the best policies in the
                atlas.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-white">
                    {topPolicies.length}
                  </span>{" "}
                  top policies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-muted-foreground">
                  Ranked by {getSortLabel(validatedSortBy).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing all {topPolicies.length} policies ranked by{" "}
              <span className="font-medium text-foreground">
                {getSortLabel(validatedSortBy)}
              </span>
            </p>
          </div>

          {/* Sort Controls (Client Component) */}
          <SortButtonsTop currentSort={validatedSortBy} />
        </div>

        {/* Top Policies Grid */}
        {topPolicies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topPolicies.map((policy, index) => {
              const badge = getRankBadge(index);
              return (
                <div key={policy.id} className="relative">
                  {/* Rank Badge for Top 3 */}
                  {badge && (
                    <div className="absolute -top-2 -right-2 z-10">{badge}</div>
                  )}
                  <PolicyCard policy={policy} />
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No policies available
            </p>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Check back soon to see top-ranked policies!
            </p>
            <Link href="/">
              <Button variant="outline">Browse All Policies</Button>
            </Link>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
          <h3 className="text-sm font-semibold text-white mb-2">
            Ranking Methodology
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Combined Score:</strong> Weighted 
              combination of net votes (40%), AI quality score (40%), and total 
              engagement (20%).
            </p>
            <p>
              <strong className="text-foreground">Net Votes:</strong> Difference between 
              upvotes and downvotes, representing community sentiment.
            </p>
            <p>
              <strong className="text-foreground">Total Votes:</strong> Sum of all votes, 
              indicating overall engagement and discussion.
            </p>
            <p>
              <strong className="text-foreground">AI Score:</strong> Quality assessment 
              based on structure, clarity, completeness, and best practices.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
