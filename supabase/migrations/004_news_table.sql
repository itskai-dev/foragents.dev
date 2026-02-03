-- News table for dynamic RSS ingestion
-- Separate from news_items to allow fresh schema

CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON news(source_name);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news USING GIN(tags);

-- RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read news" ON news;
CREATE POLICY "Public read news" ON news FOR SELECT USING (true);

-- Service role write access (for ingestion API)
DROP POLICY IF EXISTS "Service write news" ON news;
CREATE POLICY "Service write news" ON news 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
