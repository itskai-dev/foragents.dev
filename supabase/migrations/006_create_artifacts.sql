-- Artifacts (Phase 2 MVP)

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY DEFAULT ('art_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'anonymous',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_tags ON artifacts USING GIN(tags);

ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read artifacts" ON artifacts;
CREATE POLICY "Public read artifacts" ON artifacts FOR SELECT USING (true);

-- Public insert (MVP). Consider tightening later with auth / rate limits.
DROP POLICY IF EXISTS "Public insert artifacts" ON artifacts;
CREATE POLICY "Public insert artifacts" ON artifacts FOR INSERT WITH CHECK (true);
