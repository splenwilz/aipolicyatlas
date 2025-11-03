/**
 * API Response Type Definitions
 * 
 * Type definitions matching the backend API schemas.
 * Reference: backend/app/schemas.py
 */

import { Policy, Repository } from "@/types/policy";

/**
 * Paginated list response from the API
 * Matches PolicyListResponse from backend
 * 
 * Reference: backend/app/schemas.py PolicyListResponse
 */
export interface PolicyListResponse {
  /** Array of policy items */
  items: Policy[];
  /** Total number of policies (across all pages) */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  page_size: number;
  /** Total number of pages */
  total_pages: number;
}

