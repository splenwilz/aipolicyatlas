/**
 * SortButtons Component
 * 
 * Client component that updates URL search params for sorting.
 * Uses Next.js navigation to update the 'sort_by' parameter.
 * 
 * Reference: Next.js useSearchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

/**
 * Sort option type
 */
type SortOption = "votes" | "recent" | "ai-score";

/**
 * Props for SortButtons component
 */
interface SortButtonsProps {
  /** Current sort value (from URL) */
  currentSort?: string;
}

/**
 * SortButtons Component
 * 
 * Renders sort buttons and updates URL search params when clicked.
 */
export function SortButtons({ currentSort = "votes" }: SortButtonsProps) {
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
   * Reference: https://nextjs.org/docs/app/api-reference/functions/use-router#routerpush
   */
  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      const queryString = createQueryString("sort_by", newSort);
      router.push(`${pathname}?${queryString}`, {
        scroll: false, // Prevent scroll to top on URL change
      });
    },
    [pathname, createQueryString, router]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Sort by:
      </span>
      <div className="flex gap-1 border rounded-md p-1">
        <Button
          variant={currentSort === "votes" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange("votes")}
          className="text-xs"
        >
          Top Voted
        </Button>
        <Button
          variant={currentSort === "recent" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange("recent")}
          className="text-xs"
        >
          Recent
        </Button>
        <Button
          variant={currentSort === "ai-score" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange("ai-score")}
          className="text-xs"
        >
          AI Score
        </Button>
      </div>
    </div>
  );
}

