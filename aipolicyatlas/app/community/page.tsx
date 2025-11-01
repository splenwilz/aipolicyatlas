/**
 * Community Page
 * 
 * Displays community engagement, discussions, contributors, and community guidelines.
 * 
 * Features:
 * - Recent discussions and comments
 * - Top contributors leaderboard
 * - Community statistics
 * - Guidelines and resources
 * 
 * Reference: plan/blueprint.md - Groups / Discussions section
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Heart,
  BookOpen,
  ExternalLink,
  ArrowUp,
} from "lucide-react";
import { getAllPolicies } from "@/lib/demo-data";
import {
  getRecentComments,
  getTopContributors,
  getAllComments,
} from "@/lib/demo-community";
import type { Comment, Contributor } from "@/lib/demo-community";

/**
 * Community Page Component
 */
export default function CommunityPage() {
  // Get community data
  const recentComments = getRecentComments(5);
  const topContributors = getTopContributors(10);
  const allComments = getAllComments();
  const allPolicies = getAllPolicies();

  // Calculate community stats
  const totalPolicies = allPolicies.length;
  const totalComments = allComments.length;
  const totalVotes = allPolicies.reduce(
    (sum, policy) => sum + policy.upvotes_count + policy.downvotes_count,
    0
  );
  const totalContributors = topContributors.length;

  /**
   * Format date relative to now (e.g., "2 days ago")
   */
  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  /**
   * Get policy title by ID
   */
  const getPolicyTitle = (policyId: string): string => {
    const policy = allPolicies.find((p) => p.id === policyId);
    return policy?.filename || "Unknown Policy";
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
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Community
                </h1>
              </div>
              <p className="text-sm text-[oklch(0.7_0.02_270)] max-w-2xl">
                Join the conversation about AI policies. Share insights, discuss best 
                practices, and help build the definitive resource for AI governance.
              </p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Policies</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalPolicies}</p>
              </div>
              <div className="p-4 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-xs text-muted-foreground">Votes</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalVotes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Comments</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalComments}</p>
              </div>
              <div className="p-4 rounded-lg bg-[oklch(0.12_0.03_270_/_0.4)] border border-[oklch(0.3_0.1_280_/_0.3)]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Contributors</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalContributors}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Recent Discussions */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Discussions</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <div className="space-y-4">
                  {recentComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg bg-[oklch(0.1_0.02_270_/_0.3)] border border-[oklch(0.3_0.1_280_/_0.2)] hover:border-[oklch(0.4_0.15_280_/_0.4)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {comment.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {comment.user_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeDate(comment.created_at)}
                            </p>
                          </div>
                        </div>
                        <Link href={`/policy/${comment.policy_id}`}>
                          <Badge variant="outline" className="text-xs">
                            {getPolicyTitle(comment.policy_id)}
                          </Badge>
                        </Link>
                      </div>
                      <p className="text-sm text-[oklch(0.85_0.02_270)] mb-3 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                          <ArrowUp className="h-3 w-3" />
                          <span>{comment.upvotes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                          <MessageSquare className="h-3 w-3" />
                          <span>{comment.replies_count} replies</span>
                        </button>
                        <Link
                          href={`/policy/${comment.policy_id}#comments`}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Discussion
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">
                      Be Respectful
                    </h4>
                    <p>
                      Treat all community members with respect and kindness. 
                      Constructive criticism is welcome, but personal attacks are not.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">
                      Stay On Topic
                    </h4>
                    <p>
                      Keep discussions focused on AI policies, governance, ethics, 
                      and related topics. Off-topic discussions may be removed.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">
                      Share Knowledge
                    </h4>
                    <p>
                      Help build a valuable resource by sharing insights, best practices, 
                      and constructive feedback on policies.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">
                      Report Issues
                    </h4>
                    <p>
                      If you encounter inappropriate content or behavior, please report it 
                      to the community moderators.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Top Contributors */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <CardTitle className="text-lg">Top Contributors</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div
                      key={contributor.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[oklch(0.1_0.02_270_/_0.3)] transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {index < 3 ? (
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                              index === 0 && "bg-gradient-to-br from-yellow-500 to-orange-500",
                              index === 1 && "bg-gradient-to-br from-gray-400 to-gray-500",
                              index === 2 && "bg-gradient-to-br from-amber-600 to-amber-700"
                            )}
                          >
                            {index + 1}
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {contributor.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {contributor.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.contributions} contributions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Resources */}
            <Card className="gap-4 py-4">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pt-0">
                <div className="space-y-2">
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Documentation</span>
                  </Link>
                  <Link
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>GitHub Repository</span>
                  </Link>
                  <Link
                    href="/search"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Search Policies</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

