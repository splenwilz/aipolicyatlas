/**
 * Top Policies Page
 * 
 * Displays the highest-ranked policies based on:
 * - Total votes (upvotes and downvotes)
 * - Net votes (upvotes - downvotes)
 * - AI score
 * - Combined ranking score
 * 
 * Reference: plan/blueprint.md - Leaderboard section
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PolicyCard } from "@/components/policy-card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { getAllPolicies, sortPolicies } from "@/lib/demo-data";
import type { Policy } from "@/types/policy";

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
  const aiScore = policy.ai_score / 100;
  const engagementScore = Math.min(1, totalVotes / 500); // Cap at 500 votes
  
  // Weighted combination
  return (voteScore * 0.4) + (aiScore * 0.4) + (engagementScore * 0.2);
}

/**
 * Top Policies Page Component
 */
export default function TopPoliciesPage() {
  // Get all policies
  const allPolicies = getAllPolicies();

  // Sort option state
  const [sortBy, setSortBy] = useState<TopSortOption>("combined");

  /**
   * Sort and rank policies based on selected option
   */
  const topPolicies = useMemo(() => {
    let sorted: Policy[];

    switch (sortBy) {
      case "net-votes":
        // Sort by net votes (upvotes - downvotes)
        sorted = [...allPolicies].sort((a, b) => {
          const netA = a.upvotes_count - a.downvotes_count;
          const netB = b.upvotes_count - b.downvotes_count;
          return netB - netA;
        });
        break;

      case "total-votes":
        // Sort by total votes (upvotes + downvotes)
        sorted = [...allPolicies].sort((a, b) => {
          const totalA = a.upvotes_count + a.downvotes_count;
          const totalB = b.upvotes_count + b.downvotes_count;
          return totalB - totalA;
        });
        break;

      case "ai-score":
        // Sort by AI score
        sorted = sortPolicies(allPolicies, "ai-score");
        break;

      case "combined":
      default:
        // Sort by combined score
        const policiesWithScores = allPolicies.map((policy) => ({
          policy,
          score: calculateCombinedScore(policy),
        }));
        sorted = policiesWithScores
          .sort((a, b) => b.score - a.score)
          .map((item) => item.policy);
        break;
    }

    return sorted;
  }, [allPolicies, sortBy]);

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

  /**
   * Get sort option label
   */
  const getSortLabel = (option: TopSortOption): string => {
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
                The highest-ranked AI policies based on community votes, AI quality scores, 
                and overall engagement. These represent the best policies in the atlas.
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
                  Ranked by {getSortLabel(sortBy).toLowerCase()}
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
                {getSortLabel(sortBy)}
              </span>
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rank by:</span>
            <Button
              variant={sortBy === "combined" ? "default" : "outline"}
              onClick={() => setSortBy("combined")}
              size="sm"
              className="text-xs h-7"
            >
              Combined
            </Button>
            <Button
              variant={sortBy === "net-votes" ? "default" : "outline"}
              onClick={() => setSortBy("net-votes")}
              size="sm"
              className="text-xs h-7"
            >
              Net Votes
            </Button>
            <Button
              variant={sortBy === "total-votes" ? "default" : "outline"}
              onClick={() => setSortBy("total-votes")}
              size="sm"
              className="text-xs h-7"
            >
              Total Votes
            </Button>
            <Button
              variant={sortBy === "ai-score" ? "default" : "outline"}
              onClick={() => setSortBy("ai-score")}
              size="sm"
              className="text-xs h-7"
            >
              AI Score
            </Button>
          </div>
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
                    <div className="absolute -top-2 -right-2 z-10">
                      {badge}
                    </div>
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

