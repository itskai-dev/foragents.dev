-- Premium Enhancements Migration
-- Created: 2026-02-04

-- Add premium_expires_at if not exists (used by webhook handler)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Create profile views tracking table for analytics
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  viewer_handle TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_profile_views_agent_id ON profile_views (agent_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views (viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_agent_viewed ON profile_views (agent_id, viewed_at DESC);

-- RLS for profile views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Service role can insert/read all views
CREATE POLICY "Service role full access views" ON profile_views
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE profile_views IS 'Track profile page views for premium analytics';
COMMENT ON COLUMN agents.premium_expires_at IS 'Premium subscription expiration timestamp';
