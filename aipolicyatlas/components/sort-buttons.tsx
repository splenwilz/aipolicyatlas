/**
 * SortButtons Component
 * 
 * Since only "recent" sorting is available, this component is now a no-op.
 * Policies are sorted by recency (most recent first) by default.
 * 
 * This component is kept for backward compatibility but renders nothing.
 * 
 * Reference: Next.js useSearchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

/**
 * Props for SortButtons component
 */
interface SortButtonsProps {
  /** Current sort value (from URL) - not used, kept for compatibility */
  currentSort?: string;
}

/**
 * SortButtons Component
 * 
 * Renders nothing since only one sort option (recent) is available.
 * Policies are sorted by creation date (most recent first) by default.
 */
export function SortButtons({ currentSort }: SortButtonsProps) {
  // No sorting options available - policies are always sorted by recency
  // Return null to render nothing
  return null;
}

