/**
 * TypeScript type definitions for AI Policy Atlas
 * 
 * These types match the schema defined in the project blueprint.
 * Reference: plan/blueprint.md
 */

/**
 * Repository information from GitHub
 * Matches the repositories table schema from blueprint
 */
export interface Repository {
  /** Unique identifier (UUID) */
  id: string;
  /** Repository name (e.g., "awesome-project") */
  name: string;
  /** Full repository name including owner (e.g., "owner/awesome-project") */
  full_name: string;
  /** Number of GitHub stars */
  stars: number;
  /** Number of GitHub forks */
  forks: number;
  /** Primary programming language */
  language: string;
  /** GitHub repository URL */
  url: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Policy file information
 * Matches the policies table schema from blueprint
 */
export interface Policy {
  /** Unique identifier (UUID) */
  id: string;
  /** Repository this policy belongs to */
  repo_id: string;
  /** Original filename (e.g., "AI_RULES.md", "CODE_OF_CONDUCT.md") */
  filename: string;
  /** Full markdown content of the policy */
  content: string;
  /** AI-generated summary (150-300 words) */
  summary: string;
  /** AI-extracted tags (e.g., ["ethics", "data-use", "safety"]) */
  tags: string[];
  /** AI quality score (0-100) */
  ai_score: number;
  /** Number of upvotes from users */
  upvotes_count: number;
  /** Number of downvotes from users */
  downvotes_count: number;
  /** Detected language of the policy */
  language: string;
  /** Date when policy was added to the system */
  created_at: string;
  /** Repository details (denormalized for easier access) */
  repo: Repository;
}

/**
 * User vote information
 * For tracking individual user votes on policies
 */
export interface UserVote {
  /** Vote type: 'up' for upvote, 'down' for downvote */
  vote_type: 'up' | 'down' | null;
  /** Policy ID that was voted on */
  policy_id: string;
  /** User ID who voted */
  user_id: string;
}

/**
 * Vote counts for display
 * Computed vote statistics for a policy
 */
export interface VoteCounts {
  /** Total upvotes */
  upvotes_count: number;
  /** Total downvotes */
  downvotes_count: number;
  /** Net votes (upvotes - downvotes) */
  net_votes: number;
  /** Current user's vote, if authenticated */
  user_vote?: 'up' | 'down' | null;
}

