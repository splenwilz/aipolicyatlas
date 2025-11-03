/**
 * ClearFiltersButton Component
 * 
 * Client component that clears all search filters by navigating to base URL.
 * 
 * Reference: Next.js useRouter
 * https://nextjs.org/docs/app/api-reference/functions/use-router
 */

"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

/**
 * Props for ClearFiltersButton component
 */
interface ClearFiltersButtonProps {
  /** Button variant */
  variant?: "default" | "outline" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * ClearFiltersButton Component
 * 
 * Clears all URL search parameters to reset filters.
 */
export function ClearFiltersButton({
  variant = "outline",
  size = "default",
  className,
}: ClearFiltersButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handle clear filters
   * Navigates to base path without any search params
   */
  const handleClear = useCallback(() => {
    router.replace(pathname, {
      scroll: false, // Prevent scroll to top
    });
  }, [pathname, router]);

  return (
    <Button variant={variant} size={size} onClick={handleClear} className={className}>
      Clear Filters
    </Button>
  );
}

