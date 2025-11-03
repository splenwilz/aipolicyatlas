/**
 * SortButtonsTop Component
 * 
 * Client component that updates URL search params for top page sorting.
 * 
 * Reference: Next.js useSearchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

/**
 * Sort option type for top page
 */
type TopSortOption = "net-votes" | "total-votes" | "ai-score" | "combined";

/**
 * Props for SortButtonsTop component
 */
interface SortButtonsTopProps {
  /** Current sort value (from URL) */
  currentSort?: string;
}

/**
 * SortButtonsTop Component
 * 
 * Renders sort buttons for top page and updates URL search params when clicked.
 */
export function SortButtonsTop({ currentSort = "combined" }: SortButtonsTopProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Create a new query string by updating a single parameter
   * Preserves all other search params
   */
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  /**
   * Handle sort option change
   * 
   * Uses scroll: false to prevent scrolling to top when changing sort
   */
  const handleSortChange = useCallback(
    (newSort: TopSortOption) => {
      const queryString = createQueryString("sort_by", newSort);
      router.push(`${pathname}?${queryString}`, {
        scroll: false, // Prevent scroll to top on URL change
      });
    },
    [pathname, createQueryString, router]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Rank by:</span>
      <Button
        variant={currentSort === "combined" ? "default" : "outline"}
        onClick={() => handleSortChange("combined")}
        size="sm"
        className="text-xs h-7"
      >
        Combined
      </Button>
      <Button
        variant={currentSort === "net-votes" ? "default" : "outline"}
        onClick={() => handleSortChange("net-votes")}
        size="sm"
        className="text-xs h-7"
      >
        Net Votes
      </Button>
      <Button
        variant={currentSort === "total-votes" ? "default" : "outline"}
        onClick={() => handleSortChange("total-votes")}
        size="sm"
        className="text-xs h-7"
      >
        Total Votes
      </Button>
      <Button
        variant={currentSort === "ai-score" ? "default" : "outline"}
        onClick={() => handleSortChange("ai-score")}
        size="sm"
        className="text-xs h-7"
      >
        AI Score
      </Button>
    </div>
  );
}

