import discussionsData from "@/data/discussions.json";

export type DiscussionCategory =
  | "General"
  | "Help & Support"
  | "Show & Tell"
  | "Feature Requests"
  | "Bug Reports"
  | "Integrations";

export type Reply = {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  createdAt: string; // ISO 8601
};

export type Discussion = {
  id: string;
  title: string;
  category: DiscussionCategory;
  author: string;
  content: string;
  upvotes: number;
  replyCount: number;
  createdAt: string; // ISO 8601
  lastActivity: string; // ISO 8601
  replies: Reply[];
};

function normalizeDiscussion(raw: Discussion): Discussion {
  return {
    ...raw,
    replies: Array.isArray(raw.replies) ? raw.replies : [],
    replyCount: typeof raw.replyCount === "number" ? raw.replyCount : 0,
    upvotes: typeof raw.upvotes === "number" ? raw.upvotes : 0,
  };
}

export function getDiscussions(): Discussion[] {
  const items = (discussionsData as unknown as Discussion[]).map(normalizeDiscussion);
  return items;
}

export function getDiscussionById(id: string): Discussion | undefined {
  return getDiscussions().find((d) => d.id === id);
}

export function getDiscussionsByCategory(category: DiscussionCategory): Discussion[] {
  return getDiscussions().filter((d) => d.category === category);
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  "General",
  "Help & Support",
  "Show & Tell",
  "Feature Requests",
  "Bug Reports",
  "Integrations",
];
