/**
 * VoteButton Component
 * 
 * Displays upvote and downvote buttons with vote counts.
 * Currently uses local state for demo purposes (no API integration yet).
 * 
 * Features:
 * - Upvote button (↑)
 * - Downvote button (↓)
 * - Vote count display
 * - Visual feedback for active votes
 * - Toggle behavior (clicking same vote removes it)
 * 
 * Design system colors:
 * - Active upvote: Green/tint color
 * - Active downvote: Red/error color
 * - Inactive: Muted colors
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for VoteButton component
 */
interface VoteButtonProps {
  /** Initial upvote count */
  initialUpvotes: number;
  /** Initial downvote count */
  initialDownvotes: number;
  /** Initial user vote state (for when user is authenticated) */
  initialUserVote?: "up" | "down" | null;
  /** Callback when vote changes (for future API integration) */
  onVoteChange?: (voteType: "up" | "down" | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether voting is disabled (e.g., user not authenticated) */
  disabled?: boolean;
}

/**
 * VoteButton Component
 * 
 * Handles voting UI with optimistic updates. In production,
 * this would call the /api/vote endpoint.
 */
export function VoteButton({
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  onVoteChange,
  className,
  disabled = false,
}: VoteButtonProps) {
  // Local state for vote counts (optimistic updates)
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    initialUserVote
  );

  /**
   * Handle vote button click
   * 
   * Toggle behavior:
   * - If clicking current vote → remove vote
   * - If clicking opposite vote → switch vote
   * - If no vote → add vote
   */
  const handleVote = (voteType: "up" | "down") => {
    if (disabled) return;

    let newVote: "up" | "down" | null;
    let newUpvotes = upvotes;
    let newDownvotes = downvotes;

    if (userVote === voteType) {
      // Remove vote (toggle off)
      newVote = null;
      if (voteType === "up") {
        newUpvotes = Math.max(0, upvotes - 1);
      } else {
        newDownvotes = Math.max(0, downvotes - 1);
      }
    } else if (userVote === (voteType === "up" ? "down" : "up")) {
      // Switch vote (from down to up, or up to down)
      newVote = voteType;
      if (voteType === "up") {
        newUpvotes = upvotes + 1;
        newDownvotes = Math.max(0, downvotes - 1);
      } else {
        newDownvotes = downvotes + 1;
        newUpvotes = Math.max(0, upvotes - 1);
      }
    } else {
      // Add new vote
      newVote = voteType;
      if (voteType === "up") {
        newUpvotes = upvotes + 1;
      } else {
        newDownvotes = downvotes + 1;
      }
    }

    // Update local state (optimistic update)
    setUserVote(newVote);
    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);

    // Call callback for future API integration
    onVoteChange?.(newVote);
  };

  // Calculate net votes for display
  const netVotes = upvotes - downvotes;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        disabled={disabled}
        className={cn(
          "flex flex-col gap-1 h-auto py-2 px-3 transition-all",
          userVote === "up" &&
            "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30 shadow-lg shadow-cyan-500/20",
          !userVote && "hover:bg-muted hover:text-cyan-300"
        )}
        aria-label={`Upvote. Current upvotes: ${upvotes}`}
      >
        <span className="text-lg leading-none">↑</span>
        <span className="text-xs font-medium">{upvotes}</span>
      </Button>

      {/* Net Votes Display (if not zero) */}
      {netVotes !== 0 && (
        <span
          className={cn(
            "text-xs font-semibold",
            netVotes > 0
              ? "text-cyan-400"
              : "text-pink-400"
          )}
        >
          {netVotes > 0 ? "+" : ""}
          {netVotes}
        </span>
      )}

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        disabled={disabled}
        className={cn(
          "flex flex-col gap-1 h-auto py-2 px-3 transition-all",
          userVote === "down" &&
            "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-400/30 shadow-lg shadow-pink-500/20",
          !userVote && "hover:bg-muted hover:text-pink-300"
        )}
        aria-label={`Downvote. Current downvotes: ${downvotes}`}
      >
        <span className="text-lg leading-none">↓</span>
        <span className="text-xs font-medium">{downvotes}</span>
      </Button>
    </div>
  );
}
