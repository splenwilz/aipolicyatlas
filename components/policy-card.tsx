/**
 * PolicyCard Component
 * 
 * Displays a summary card for a policy with key information:
 * - Policy title (filename)
 * - Repository name and metadata
 * - Summary preview
 * - Vote counts
 * - Tags
 * - AI score
 * 
 * Uses shadcn/ui Card component for consistent styling.
 * Reference: https://ui.shadcn.com/docs/components/card
 */

import Link from "next/link";
import type { Policy } from "@/types/policy";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Props for PolicyCard component
 */
interface PolicyCardProps {
  /** Policy data to display */
  policy: Policy;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PolicyCard Component
 * 
 * Renders a clickable card that links to the policy detail page.
 * Displays key information in a compact, scannable format.
 */
export function PolicyCard({ policy, className }: PolicyCardProps) {
  // Calculate net votes for display
  const netVotes = policy.upvotes_count - policy.downvotes_count;

  // Format date for display (e.g., "Jan 15, 2024")
  const formattedDate = new Date(policy.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/policy/${policy.id}`} className="block">
      <Card
        className={cn(
          "h-full min-h-[280px] transition-all hover:shadow-md hover:border-primary/20",
          className
        )}
      >
        {/* Card Header: Title and Repo Info */}
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Policy filename as title */}
              <CardTitle className="text-lg mb-2 line-clamp-2">
                {policy.filename}
              </CardTitle>
              
              {/* Repository name with link */}
              <CardDescription className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {policy.repo.full_name}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{policy.repo.language}</span>
              </CardDescription>
            </div>

            {/* AI Score Badge */}
            <Badge
              variant="secondary"
              className="shrink-0 font-semibold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/30 text-cyan-300"
              title="AI Quality Score"
            >
              {policy.ai_score}/100
            </Badge>
          </div>
        </CardHeader>

        {/* Card Content: Summary */}
        <CardContent className="px-6 py-4">
          {/* Summary preview - truncate to 3 lines for more content */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {policy.summary}
          </p>
        </CardContent>

        {/* Card Footer: Tags, Votes, and Date */}
        <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-4">
          {/* Tags */}
          {policy.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {policy.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {policy.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{policy.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Bottom Row: Votes and Date */}
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            {/* Vote counts */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="text-cyan-400 font-medium">
                  ↑ {policy.upvotes_count}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-pink-400 font-medium">
                  ↓ {policy.downvotes_count}
                </span>
              </span>
              {netVotes !== 0 && (
                <span
                  className={cn(
                    "font-medium",
                    netVotes > 0
                      ? "text-cyan-400"
                      : "text-pink-400"
                  )}
                >
                  {netVotes > 0 ? "+" : ""}
                  {netVotes} net
                </span>
              )}
            </div>

            {/* Date */}
            <span>{formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
