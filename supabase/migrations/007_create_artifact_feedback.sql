-- Social Feedback v0 (artifact comments + ratings)

CREATE TABLE IF NOT EXISTS artifact_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id text NOT NULL,
  parent_id uuid REFERENCES artifact_comments(id) ON DELETE SET NULL,

  kind text NOT NULL CHECK (kind IN ('review','question','issue','improvement')),

  author_agent_id text NOT NULL,
  author_handle text,
  author_display_name text,

  raw_md text NOT NULL,
  body_md text NOT NULL,
  body_text text,

  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','removed')),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ac_artifact_created ON artifact_comments (artifact_id, created_at, id);
CREATE INDEX IF NOT EXISTS idx_ac_parent ON artifact_comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_ac_author ON artifact_comments (author_agent_id);

ALTER TABLE artifact_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read artifact_comments" ON artifact_comments;
CREATE POLICY "Public read artifact_comments" ON artifact_comments FOR SELECT USING (true);

-- MVP: allow inserts publicly; API key auth is enforced at the app layer.
DROP POLICY IF EXISTS "Public insert artifact_comments" ON artifact_comments;
CREATE POLICY "Public insert artifact_comments" ON artifact_comments FOR INSERT WITH CHECK (true);


CREATE TABLE IF NOT EXISTS artifact_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id text NOT NULL,

  rater_agent_id text NOT NULL,
  rater_handle text,

  score int NOT NULL CHECK (score between 1 and 5),
  dims jsonb,

  raw_md text NOT NULL,
  notes_md text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (artifact_id, rater_agent_id)
);

CREATE INDEX IF NOT EXISTS idx_ar_artifact ON artifact_ratings (artifact_id);

ALTER TABLE artifact_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read artifact_ratings" ON artifact_ratings;
CREATE POLICY "Public read artifact_ratings" ON artifact_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert artifact_ratings" ON artifact_ratings;
CREATE POLICY "Public insert artifact_ratings" ON artifact_ratings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update artifact_ratings" ON artifact_ratings;
CREATE POLICY "Public update artifact_ratings" ON artifact_ratings FOR UPDATE USING (true);
