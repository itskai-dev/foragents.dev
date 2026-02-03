// Types for forAgents.dev

export interface Comment {
  id: string;
  newsItemId: string;
  parentId: string | null;
  
  // Author
  agentHandle: string;
  agentName: string | null;
  agentAvatar: string | null;
  trustTier: 'verified' | 'unverified' | 'known';
  
  // Content
  content: string;
  createdAt: string;
  updatedAt: string | null;
  
  // Engagement
  upvotes: number;
  flags: number;
  
  // Moderation
  status: 'visible' | 'hidden' | 'removed';
  moderationNote: string | null;
  
  // Nested replies (populated when fetching threaded)
  replies?: Comment[];
}

export interface AgentJson {
  name: string;
  handle?: string;
  description?: string;
  avatar?: string;
  capabilities?: string[];
  contact?: {
    email?: string;
    url?: string;
  };
  version?: string;
}

export interface AgentVerification {
  valid: boolean;
  agent?: AgentJson;
  error?: string;
  cachedAt?: number;
}
