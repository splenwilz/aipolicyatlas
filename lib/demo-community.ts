/**
 * Demo Community Data
 * 
 * Mock data for community features including discussions, comments, and contributors.
 * In production, this would come from the backend API.
 */

/**
 * Comment/Discussion structure
 */
export interface Comment {
  id: string;
  policy_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  upvotes: number;
  replies_count: number;
}

/**
 * Contributor structure
 */
export interface Contributor {
  id: string;
  username: string;
  avatar?: string;
  contributions: number;
  policies_voted: number;
  comments_made: number;
  joined_at: string;
}

/**
 * Demo comments/discussions
 */
export const demoComments: Comment[] = [
  {
    id: "comment-1",
    policy_id: "1",
    user_name: "alice_dev",
    content:
      "This policy has great guidelines for AI ethics. The explicability principle is particularly important for transparency.",
    created_at: "2024-01-20T10:30:00Z",
    upvotes: 12,
    replies_count: 3,
  },
  {
    id: "comment-2",
    policy_id: "2",
    user_name: "bob_engineer",
    content:
      "The code of conduct here is comprehensive. I especially appreciate the emphasis on responsible AI development.",
    created_at: "2024-01-19T14:20:00Z",
    upvotes: 8,
    replies_count: 1,
  },
  {
    id: "comment-3",
    policy_id: "3",
    user_name: "charlie_ml",
    content:
      "The model governance section is excellent. This could be a template for other organizations.",
    created_at: "2024-01-18T09:15:00Z",
    upvotes: 15,
    replies_count: 5,
  },
  {
    id: "comment-4",
    policy_id: "5",
    user_name: "diana_researcher",
    content:
      "The AI Ethics Framework here aligns well with IEEE guidelines. Well-structured implementation.",
    created_at: "2024-01-17T16:45:00Z",
    upvotes: 20,
    replies_count: 2,
  },
  {
    id: "comment-5",
    policy_id: "1",
    user_name: "edward_curator",
    content:
      "Should we add a section on data privacy for AI training? This policy is solid but could be enhanced.",
    created_at: "2024-01-16T11:00:00Z",
    upvotes: 6,
    replies_count: 4,
  },
];

/**
 * Demo contributors
 */
export const demoContributors: Contributor[] = [
  {
    id: "contrib-1",
    username: "alice_dev",
    contributions: 142,
    policies_voted: 89,
    comments_made: 23,
    joined_at: "2023-12-01T00:00:00Z",
  },
  {
    id: "contrib-2",
    username: "bob_engineer",
    contributions: 128,
    policies_voted: 76,
    comments_made: 18,
    joined_at: "2023-11-15T00:00:00Z",
  },
  {
    id: "contrib-3",
    username: "charlie_ml",
    contributions: 115,
    policies_voted: 92,
    comments_made: 31,
    joined_at: "2024-01-05T00:00:00Z",
  },
  {
    id: "contrib-4",
    username: "diana_researcher",
    contributions: 98,
    policies_voted: 65,
    comments_made: 15,
    joined_at: "2023-10-20T00:00:00Z",
  },
  {
    id: "contrib-5",
    username: "edward_curator",
    contributions: 87,
    policies_voted: 54,
    comments_made: 22,
    joined_at: "2024-01-10T00:00:00Z",
  },
];

/**
 * Get all comments
 */
export function getAllComments(): Comment[] {
  return demoComments;
}

/**
 * Get all contributors
 */
export function getAllContributors(): Contributor[] {
  return demoContributors;
}

/**
 * Get recent comments (sorted by created_at, most recent first)
 */
export function getRecentComments(limit: number = 10): Comment[] {
  return [...demoComments]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

/**
 * Get top contributors (sorted by contributions, descending)
 */
export function getTopContributors(limit: number = 10): Contributor[] {
  return [...demoContributors]
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, limit);
}

