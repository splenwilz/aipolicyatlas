/**
 * SearchBar Component with URL-based state
 * 
 * Client component that updates URL search params instead of calling callbacks.
 * This allows server components to read the search query from the URL.
 * 
 * Features:
 * - Debounced search input
 * - Updates URL search params (preserves other params)
 * - Clear button functionality
 * - Accessible (proper ARIA labels)
 * 
 * Reference: Next.js useSearchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for SearchBar component
 */
interface SearchBarUrlProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar Component with URL-based state
 * 
 * Updates the 'q' search parameter in the URL when user types.
 * Server components can read this from searchParams.
 */
export function SearchBarUrl({
  placeholder = "Search policies...",
  debounceMs = 300,
  className,
}: SearchBarUrlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current search query from URL
  const urlQuery = searchParams.get("q") || "";

  // Local state for input value (non-debounced for immediate UI update)
  const [query, setQuery] = useState(urlQuery);

  // Sync local state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  /**
   * Create a new query string by updating a single parameter
   * Preserves all other search params
   * 
   * Reference: Next.js searchParams example
   * https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams
   */
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  /**
   * Update URL with new search query
   * Called after debounce delay
   * 
   * Uses router.replace() to avoid adding history entries for every keystroke
   * and scroll: false to prevent scrolling to top
   * Reference: https://nextjs.org/docs/app/api-reference/functions/use-router#routerreplace
   */
  const updateSearchParams = useCallback(
    (newQuery: string) => {
      const queryString = createQueryString("q", newQuery);
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false, // Prevent scroll to top on URL change
      });
    },
    [pathname, createQueryString, router]
  );

  /**
   * Debounced search effect
   * 
   * Waits for user to stop typing before updating URL.
   * Clears timeout if query changes before debounce completes.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, updateSearchParams, debounceMs]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  /**
   * Handle clear button click
   * Immediately clears input and URL param (no debounce)
   */
  const handleClear = useCallback(() => {
    setQuery("");
    updateSearchParams("");
  }, [updateSearchParams]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="pr-10"
        aria-label="Search policies"
      />

      {/* Clear Button (only shown when input has value) */}
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

