-- Create submissions table for forAgents.dev
-- Run this in your Supabase SQL editor or via supabase db push

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('skill', 'mcp', 'agent')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  install_cmd TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);

-- Enable RLS (Row Level Security)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the submit API using anon key)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON submissions;
CREATE POLICY "Allow anonymous inserts" ON submissions
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous reads (for the submissions listing API)
DROP POLICY IF EXISTS "Allow anonymous reads" ON submissions;
CREATE POLICY "Allow anonymous reads" ON submissions
  FOR SELECT
  USING (true);
-- Agent Hub — Initial Schema
-- Created: 2026-02-02

-- News items table
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills directory
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  install_cmd TEXT,
  repo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registered agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'openclaw',
  owner_url TEXT,
  api_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_tags ON news_items USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills (slug);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents (api_key);

-- Row-level security (enable later when auth is wired)
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public read access for news and skills
DROP POLICY IF EXISTS "Public read access" ON news_items;
CREATE POLICY "Public read access" ON news_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read access" ON skills;
CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
