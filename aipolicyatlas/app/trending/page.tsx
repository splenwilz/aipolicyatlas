/**
 * Trending Page (Server Component)
 * 
 * Displays policies that are currently trending based on:
 * - High vote activity (recent votes)
 * - Vote velocity (gaining votes quickly)
 * - Recent additions with engagement
 * 
 * Reference: plan/blueprint.md - Home section (Trending)
 */

import Link from "next/link";
import { PolicyCard } from "@/components/policy-card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, ArrowUp } from "lucide-react";
import { fetchPoliciesSafe } from "@/lib/policy-api";
import type { Policy } from "@/types/policy";

/**
 * Calculate trending score for a policy
 * 
 * Combines multiple factors to determine trending status:
 * - Net votes (upvotes - downvotes) - shows overall sentiment
 * - Total votes (engagement level) - shows activity
 * - Recency (newer policies get boost) - rewards fresh content
 * - Vote velocity (recent votes weighted more heavily)
 * 
 * Algorithm inspired by Reddit's hot algorithm and Hacker News ranking
 * Reference: https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 */
function calculateTrendingScore(policy: Policy): number {
  const netVotes = policy.upvotes_count - policy.downvotes_count;
  const totalVotes = policy.upvotes_count + policy.downvotes_count;
  
  // Calculate days since creation
  const daysSinceCreation =
    (Date.now() - new Date(policy.created_at).getTime()) / (1000 * 60 * 60 * 24);
  
  // Recency score: Favor policies created in the last 30 days
  // Decays linearly from 1.0 (today) to 0.0 (30+ days ago)
  const recencyScore = Math.max(0, (30 - daysSinceCreation) / 30);
  
  // Engagement score: Combination of net votes and total activity
  // Higher net votes = better, but also reward high engagement
  const netVoteScore = Math.log(Math.max(1, Math.abs(netVotes) + 1)) * (netVotes >= 0 ? 1 : -0.5);
  const engagementScore = Math.log(Math.max(1, totalVotes + 1)) * 0.5;
  
  // Vote velocity: Recent policies with votes get a boost
  // This rewards policies that are gaining traction quickly
  const velocityBoost = recencyScore * 1.5;
  
  // Combine all factors
  // Formula: (net vote score + engagement) * (1 + recency boost)
  const baseScore = netVoteScore + engagementScore;
  const trendingScore = baseScore * (1 + velocityBoost);
  
  // Add AI score bonus (up to 20% boost for high-quality policies)
  const aiScoreBonus = policy.ai_score ? (policy.ai_score / 100) * 0.2 : 0;
  
  return trendingScore * (1 + aiScoreBonus);
}

/**
 * Trending Page Component
 * 
 * Server component that fetches policies and calculates trending scores.
 * Uses an algorithm that combines votes, engagement, and recency.
 */
export default async function TrendingPage() {
  // Fetch policies from API using reusable function
  // We fetch both recent and highly-voted policies for better trending calculation
  // This ensures we catch both new policies gaining traction and popular policies
  // Reference: lib/policy-api.ts fetchPoliciesSafe
  const [recentPoliciesData, votedPoliciesData] = await Promise.all([
    fetchPoliciesSafe({
      sortBy: "recent", // Get recent policies (new content that might be trending)
      page: 1,
      pageSize: 100,
      cache: { revalidate: 60 },
    }),
    fetchPoliciesSafe({
      sortBy: "votes", // Get highly-voted policies (popular content)
      page: 1,
      pageSize: 100,
      cache: { revalidate: 60 },
    }),
  ]);

  // Handle API errors gracefully
  if (!recentPoliciesData && !votedPoliciesData) {
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

  // Combine policies from both sources and deduplicate by ID
  // This ensures we have a good mix of recent and popular policies
  const allPoliciesMap = new Map<string, Policy>();
  
  if (recentPoliciesData?.items) {
    recentPoliciesData.items.forEach((policy) => {
      allPoliciesMap.set(policy.id, policy);
    });
  }
  
  if (votedPoliciesData?.items) {
    votedPoliciesData.items.forEach((policy) => {
      allPoliciesMap.set(policy.id, policy); // Deduplicate by ID
    });
  }
  
  // Convert map to array for processing
  const policies = Array.from(allPoliciesMap.values());
  
  // Calculate and sort policies by trending score
  const policiesWithScores = policies.map((policy) => ({
      policy,
      trendingScore: calculateTrendingScore(policy),
    }));

  // Sort by trending score (descending) and get top 20
  // This gives us the most trending policies based on our algorithm
  const trendingPolicies = policiesWithScores
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 20)
    .map((item) => item.policy);

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
                Discover the most popular and engaging AI policies right now. 
                Rankings are based on recent votes, engagement, and activity.
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
                  trending policies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-muted-foreground">
                  Updated in real-time
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
              Showing top {trendingPolicies.length} trending policies
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
            {trendingPolicies.map((policy, index) => (
              <div key={policy.id} className="relative">
                {/* Trending Badge */}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/90 to-pink-500/90 text-white text-xs font-bold shadow-lg">
                      <Flame className="h-3 w-3" />
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                )}
                <PolicyCard policy={policy} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flame className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No trending policies yet
            </p>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Check back soon to see which policies are gaining traction!
            </p>
            <Link href="/">
              <Button variant="outline">Browse All Policies</Button>
            </Link>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
          <h3 className="text-sm font-semibold text-white mb-2">
            How Trending Works
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Trending policies are ranked by a combination of factors including recent
            votes, vote velocity (how quickly votes are coming in), engagement metrics,
            and recency. Policies that are both popular and actively being discussed will
            appear higher in the trending list.
          </p>
        </div>
      </main>
    </div>
  );
}
