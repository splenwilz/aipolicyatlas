/**
 * Search Page
 * 
 * Advanced search and filtering page for AI policies.
 * 
 * Features:
 * - Full-text search
 * - Filter by language
 * - Filter by tags
 * - Filter by AI score range
 * - Sort options
 * - Results display with policy cards
 * 
 * Reference: plan/blueprint.md - Search & Filters section
 */

"use client";

import { useState, useMemo, useId } from "react";
import { PolicyCard } from "@/components/policy-card";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getAllPolicies,
  searchPolicies,
  sortPolicies,
  filterPoliciesByLanguage,
  filterPoliciesByTag,
  filterPoliciesByScore,
  getAllLanguages,
  getAllTags,
} from "@/lib/demo-data";

/**
 * Sort option type
 */
type SortOption = "votes" | "recent" | "ai-score";

/**
 * Search Page Component
 */
export default function SearchPage() {
  // Get all demo policies
  const allPolicies = getAllPolicies();
  const allLanguages = getAllLanguages();
  const allTags = getAllTags();

  // Generate unique IDs for form elements
  const languageId = useId();
  const tagId = useId();
  const minScoreId = useId();
  const maxScoreId = useId();

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("0");
  const [maxScore, setMaxScore] = useState<string>("100");

  // State for sort option
  const [sortBy, setSortBy] = useState<SortOption>("votes");

  /**
   * Filter and sort policies based on current state
   * 
   * Memoized to avoid recalculating on every render.
   */
  const displayedPolicies = useMemo(() => {
    let filtered = allPolicies;

    // Step 1: Filter by search query
    if (searchQuery) {
      filtered = searchPolicies(searchQuery);
    }

    // Step 2: Filter by language
    if (selectedLanguage && selectedLanguage !== "all") {
      filtered = filterPoliciesByLanguage(filtered, selectedLanguage);
    }

    // Step 3: Filter by tag
    if (selectedTag && selectedTag !== "all") {
      filtered = filterPoliciesByTag(filtered, selectedTag);
    }

    // Step 4: Filter by AI score range
    filtered = filterPoliciesByScore(
      filtered,
      parseInt(minScore, 10),
      parseInt(maxScore, 10)
    );

    // Step 5: Sort the filtered results
    return sortPolicies(filtered, sortBy);
  }, [
    searchQuery,
    selectedLanguage,
    selectedTag,
    minScore,
    maxScore,
    sortBy,
    allPolicies,
  ]);

  /**
   * Handle search query changes from SearchBar
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * Handle sort option change
   */
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSelectedTag("all");
    setMinScore("0");
    setMaxScore("100");
    setSortBy("votes");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    (selectedLanguage && selectedLanguage !== "all") ||
    (selectedTag && selectedTag !== "all") ||
    minScore !== "0" ||
    maxScore !== "100";

  return (
    <div className="min-h-screen main-content">
      {/* Header Section */}
      <header className="border-b bg-[oklch(0.1_0.02_270_/_0.8)] backdrop-blur-xl border-[oklch(0.3_0.1_280_/_0.3)] relative overflow-hidden">
        {/* Subtle gradient overlay on header */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
                Search AI Policies
              </h1>
              <p className="text-sm text-[oklch(0.7_0.02_270)]">
                Find policies by keywords, tags, language, and AI score
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by policy name, summary, or tags..."
                defaultValue={searchQuery}
                className="max-w-2xl"
              />
            </div>

            {/* Filters Section */}
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
                  <Label htmlFor={languageId} className="text-xs text-muted-foreground mb-1.5 block">
                    Language
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger id={languageId} className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      {allLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag Filter */}
                <div className="flex-1 min-w-[140px]">
                  <Label htmlFor={tagId} className="text-xs text-muted-foreground mb-1.5 block">
                    Tag
                  </Label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger id={tagId} className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tags</SelectItem>
                      {allTags.map((tag) => (
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
                    <Label htmlFor={minScoreId} className="text-xs text-muted-foreground mb-1.5 block">
                      Min Score
                    </Label>
                    <Select value={minScore} onValueChange={setMinScore}>
                      <SelectTrigger id={minScoreId} className="h-9">
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
                    <Label htmlFor={maxScoreId} className="text-xs text-muted-foreground mb-1.5 block">
                      Max Score
                    </Label>
                    <Select value={maxScore} onValueChange={setMaxScore}>
                      <SelectTrigger id={maxScoreId} className="h-9">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {displayedPolicies.length === 1
                ? "1 policy found"
                : `${displayedPolicies.length} policies found`}
              {hasActiveFilters && (
                <span className="ml-2 text-xs text-muted-foreground/70">
                  (filtered from {allPolicies.length})
                </span>
              )}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === "votes" ? "default" : "outline"}
              onClick={() => handleSortChange("votes")}
              size="sm"
              className="text-xs h-7"
            >
              Top Voted
            </Button>
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              onClick={() => handleSortChange("recent")}
              size="sm"
              className="text-xs h-7"
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "ai-score" ? "default" : "outline"}
              onClick={() => handleSortChange("ai-score")}
              size="sm"
              className="text-xs h-7"
            >
              AI Score
            </Button>
          </div>
        </div>

        {/* Policies Grid */}
        {displayedPolicies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No policies found
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {hasActiveFilters
                ? "Try adjusting your search query or filters."
                : "No policies are available at the moment."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
