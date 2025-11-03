/**
 * SearchFilters Component
 * 
 * Client component for advanced search filters that update URL search params.
 * Includes language, tag, and AI score range filters.
 * 
 * Reference: Next.js useSearchParams
 * https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

/**
 * Props for SearchFilters component
 */
interface SearchFiltersProps {
  /** Current language filter value (from URL) */
  currentLanguage?: string;
  /** Current tag filter value (from URL) */
  currentTag?: string;
  /** Current min score value (from URL) */
  currentMinScore?: string;
  /** Current max score value (from URL) */
  currentMaxScore?: string;
  /** Available languages (from API or static list) */
  availableLanguages?: string[];
  /** Available tags (from API or static list) */
  availableTags?: string[];
  /** Whether any filters are active */
  hasActiveFilters?: boolean;
}

/**
 * SearchFilters Component
 * 
 * Renders filter controls and updates URL search params when changed.
 */
export function SearchFilters({
  currentLanguage = "all",
  currentTag = "all",
  currentMinScore = "0",
  currentMaxScore = "100",
  availableLanguages = [],
  availableTags = [],
  hasActiveFilters = false,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Create a new query string by updating a single parameter
   * Preserves all other search params
   * 
   * Removes default values ("all", "0" for min_score, "100" for max_score)
   * since they represent no filter being applied.
   */
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Remove param if value is "all" or default values
      if (
        value === "all" ||
        (name === "min_score" && value === "0") ||
        (name === "max_score" && value === "100")
      ) {
        params.delete(name);
      } else if (value) {
        // Set the parameter with the new value
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  /**
   * Update URL with new filter value
   */
  const updateFilter = useCallback(
    (name: string, value: string) => {
      const queryString = createQueryString(name, value);
      router.replace(`${pathname}?${queryString}`, {
        scroll: false, // Prevent scroll to top
      });
    },
    [pathname, createQueryString, router]
  );

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    router.replace(pathname, {
      scroll: false,
    });
  }, [pathname, router]);

  return (
    <div className="space-y-5">
      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Controls - Horizontal Layout */}
      <div className="flex flex-wrap items-end gap-4 pb-4">
        {/* Language Filter */}
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="language-filter" className="text-xs text-muted-foreground mb-1.5 block">
            Language
          </Label>
          <Select
            value={currentLanguage}
            onValueChange={(value) => updateFilter("language", value)}
          >
            <SelectTrigger id="language-filter" className="h-9">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter */}
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="tag-filter" className="text-xs text-muted-foreground mb-1.5 block">
            Tag
          </Label>
          <Select
            value={currentTag}
            onValueChange={(value) => updateFilter("tag", value)}
          >
            <SelectTrigger id="tag-filter" className="h-9">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Score Filter */}
        <div className="flex gap-2">
          <div className="w-20">
            <Label htmlFor="min-score" className="text-xs text-muted-foreground mb-1.5 block">
              Min Score
            </Label>
            <Select
              value={currentMinScore}
              onValueChange={(value) => updateFilter("min_score", value)}
            >
              <SelectTrigger id="min-score" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 20, 40, 60, 70, 80, 90, 95].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-20">
            <Label htmlFor="max-score" className="text-xs text-muted-foreground mb-1.5 block">
              Max Score
            </Label>
            <Select
              value={currentMaxScore}
              onValueChange={(value) => updateFilter("max_score", value)}
            >
              <SelectTrigger id="max-score" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[20, 40, 60, 70, 80, 90, 95, 100].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

