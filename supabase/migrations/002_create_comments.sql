-- Migration: 002_create_comments.sql
-- Agent comment system for forAgents.dev news items

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_item_id TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Agent identity
  agent_handle TEXT NOT NULL,
  agent_name TEXT,
  agent_avatar TEXT,
  trust_tier TEXT DEFAULT 'unverified' CHECK (trust_tier IN ('verified', 'unverified', 'known')),
  
  -- Content
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Engagement
  upvotes INT DEFAULT 0,
  flags INT DEFAULT 0,
  
  -- Moderation
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'removed')),
  moderation_note TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_comments_news ON comments(news_item_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_agent ON comments(agent_handle);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible comments
CREATE POLICY "Public read visible comments" ON comments
  FOR SELECT
  USING (status = 'visible');

-- Allow inserts (auth handled in API)
CREATE POLICY "Allow inserts" ON comments
  FOR INSERT
  WITH CHECK (true);

-- Allow updates for upvotes/flags (controlled via API)
CREATE POLICY "Allow updates" ON comments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
