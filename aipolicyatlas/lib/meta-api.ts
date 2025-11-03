/**
 * Meta API Utilities
 * 
 * Functions for fetching metadata like available languages and tags.
 * These endpoints provide filter options without fetching full policy data.
 * 
 * Reference: backend/app/routers/policies.py meta endpoints
 */

import { apiGet } from "./api-client";

/**
 * Response type for languages endpoint
 */
export interface LanguagesResponse {
  languages: string[];
}

/**
 * Response type for tags endpoint
 */
export interface TagsResponse {
  tags: string[];
}

/**
 * Fetch all available repository languages
 * 
 * Returns distinct languages from repositories that have policies.
 * Used to populate language filter dropdowns.
 * 
 * @returns Promise resolving to list of language names
 * Returns empty array on error to allow page to render
 * 
 * @example
 * const languages = await fetchAvailableLanguages();
 * // ["JavaScript", "Python", "TypeScript", ...]
 */
export async function fetchAvailableLanguages(): Promise<string[]> {
  try {
    const response = await apiGet<LanguagesResponse>("/policies/meta/languages", {
      // Cache for 5 minutes since languages don't change frequently
      next: { revalidate: 300 },
    });
    return response.languages || [];
  } catch (error) {
    // Log error but return empty array to allow page to render
    console.error("Failed to fetch available languages:", error);
    return [];
  }
}

/**
 * Fetch all available tags
 * 
 * Returns distinct tags from all policies.
 * Used to populate tag filter dropdowns.
 * 
 * @returns Promise resolving to list of tag names
 * Returns empty array on error to allow page to render
 * 
 * @example
 * const tags = await fetchAvailableTags();
 * // ["ethics", "data-use", "safety", ...]
 */
export async function fetchAvailableTags(): Promise<string[]> {
  try {
    const response = await apiGet<TagsResponse>("/policies/meta/tags", {
      // Cache for 5 minutes since tags don't change frequently
      next: { revalidate: 300 },
    });
    return response.tags || [];
  } catch (error) {
    // Log error but return empty array to allow page to render
    console.error("Failed to fetch available tags:", error);
    return [];
  }
}

