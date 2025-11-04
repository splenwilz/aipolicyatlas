/**
 * PolicyCard Component
 * 
 * Displays a summary card for a policy with key information:
 * - Policy title (filename)
 * - Repository name and metadata
 * - Summary preview
 * - Tags
 * - Creation date
 * - Copy policy URL button
 * 
 * Uses shadcn/ui Card component for consistent styling.
 * Reference: https://ui.shadcn.com/docs/components/card
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, GitFork } from "lucide-react";
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
import { CopyButton } from "@/components/copy-button";
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
  // Format date for display (e.g., "Jan 15, 2024")
  const formattedDate = new Date(policy.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get origin URL only on client side to avoid hydration mismatch
  // Use useState and useEffect to ensure it's only set after mount
  // Reference: https://nextjs.org/docs/messages/react-hydration-error
  const [policyUrl, setPolicyUrl] = useState(`/policy/${policy.id}`);
  
  useEffect(() => {
    // Set full URL only after component mounts on client
    // This prevents hydration mismatch between server and client
    if (typeof window !== "undefined") {
      setPolicyUrl(`${window.location.origin}/policy/${policy.id}`);
    }
  }, [policy.id]);

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
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Policy filename as title */}
              <CardTitle className="text-lg mb-2 line-clamp-2">
                {policy.filename}
              </CardTitle>
              
              {/* Repository name with link */}
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">
                  {policy.repo.full_name}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{policy.repo.language}</span>
                
                {/* GitHub Stars */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs">{policy.repo.stars.toLocaleString()}</span>
                </div>
                
                {/* GitHub Forks */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <GitFork className="h-3 w-3" />
                  <span className="text-xs">{policy.repo.forks.toLocaleString()}</span>
                </div>
              </CardDescription>
            </div>

            {/* Copy Policy URL Button */}
            {/* Stops event propagation to prevent card link navigation */}
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <CopyButton
                text={policyUrl}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                label="Copy policy link"
              />
            </div>
          </div>
        </CardHeader>

        {/* Card Content: Summary or Content Snippet */}
        <CardContent className="px-6 py-4">
          {/* Show AI-generated summary if available, otherwise show cleaned content snippet */}
          {policy.summary && policy.summary.trim() ? (
            /* AI-generated summary - preferred for consistency and clarity */
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {policy.summary}
          </p>
          ) : policy.content && policy.content.trim() ? (
            /* Fallback: Show snippet of actual markdown content if summary is missing */
            /* Clean markdown and extract readable text snippet */
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {(() => {
                // Clean markdown formatting to get readable text
                let text = policy.content
                  .replace(/^#+\s+/gm, "") // Remove markdown headers
                  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
                  .replace(/`([^`]+)`/g, "$1") // Remove inline code markers
                  .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold markers
                  .replace(/\*([^*]+)\*/g, "$1") // Remove italic markers
                  .replace(/```[\s\S]*?```/g, "[code]") // Replace code blocks
                  .replace(/\n{2,}/g, " ") // Replace multiple newlines with space
                  .trim();

                // Get first 200 characters, breaking at word boundary if possible
                const maxLength = 200;
                if (text.length > maxLength) {
                  const truncated = text.substring(0, maxLength);
                  const lastSpace = truncated.lastIndexOf(" ");
                  text =
                    lastSpace > maxLength * 0.8 // Only break at word if close to limit
                      ? truncated.substring(0, lastSpace) + "..."
                      : truncated + "...";
                }
                return text || "No content preview available";
              })()}
            </p>
          ) : (
            /* No content available at all */
            <p className="text-sm text-muted-foreground italic">
              No content preview available
            </p>
          )}
        </CardContent>

        {/* Card Footer: Tags and Date */}
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

            {/* Date */}
          <div className="flex items-center justify-end w-full text-xs text-muted-foreground">
            <span>{formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
