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
CREATE POLICY "Allow anonymous inserts" ON submissions
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous reads (for the submissions listing API)
CREATE POLICY "Allow anonymous reads" ON submissions
  FOR SELECT
  USING (true);
