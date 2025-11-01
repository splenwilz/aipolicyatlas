/**
 * SearchBar Component
 * 
 * A search input component with debouncing to avoid excessive API calls
 * or filter operations while the user is typing.
 * 
 * Features:
 * - Debounced search (300ms delay)
 * - Real-time search as user types
 * - Clear button when input has value
 * - Accessible (proper ARIA labels)
 * 
 * Reference: https://ui.shadcn.com/docs/components/input
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
  /** Callback fired when search query changes (debounced) */
  onSearch: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Initial search value */
  defaultValue?: string;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar Component
 * 
 * Debounces input changes to avoid excessive search operations.
 * Debounce delay defaults to 300ms but can be customized.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search policies...",
  defaultValue = "",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  // Local state for input value (non-debounced)
  const [query, setQuery] = useState(defaultValue);

  /**
   * Debounced search effect
   * 
   * Waits for user to stop typing before calling onSearch.
   * Clears timeout if query changes before debounce completes.
   */
  useEffect(() => {
    // Set up debounce timer
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    // Cleanup: clear timer if query changes before delay completes
    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  /**
   * Handle clear button click
   */
  const handleClear = useCallback(() => {
    setQuery("");
    // Immediately clear search (no debounce for clear action)
    onSearch("");
  }, [onSearch]);

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

