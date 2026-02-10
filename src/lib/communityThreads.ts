export const COMMUNITY_CATEGORIES = ["general", "help", "showcase", "feedback", "ideas"] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export type CommunityReply = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};

export type CommunityThread = {
  id: string;
  title: string;
  body: string;
  author: string;
  category: CommunityCategory;
  createdAt: string;
  replyCount: number;
  lastActivity: string;
  replies: CommunityReply[];
};
