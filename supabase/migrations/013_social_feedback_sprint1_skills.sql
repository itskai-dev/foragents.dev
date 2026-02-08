-- Social Feedback Sprint 1 (Skills)
--
-- This sprint introduces simplified, slug-based comments + ratings for skills pages.
-- The project already has artifact_comments / artifact_ratings (Social Feedback v0).
-- To avoid breaking existing endpoints, we add *alias* columns + triggers so both
-- schemas can coexist.

-- =============================
-- artifact_comments aliases
-- =============================

ALTER TABLE IF EXISTS artifact_comments
  ADD COLUMN IF NOT EXISTS artifact_slug text,
  ADD COLUMN IF NOT EXISTS agent_id text,
  ADD COLUMN IF NOT EXISTS content text;

-- Backfill
UPDATE artifact_comments
SET
  artifact_slug = COALESCE(artifact_slug, artifact_id),
  agent_id = COALESCE(agent_id, author_agent_id),
  content = COALESCE(content, body_md, raw_md)
WHERE
  artifact_slug IS NULL OR agent_id IS NULL OR content IS NULL;

-- Enforce required fields for the Sprint 1 API.
ALTER TABLE IF EXISTS artifact_comments
  ALTER COLUMN artifact_slug SET NOT NULL,
  ALTER COLUMN agent_id SET NOT NULL,
  ALTER COLUMN content SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ac_artifact_slug_created
  ON artifact_comments (artifact_slug, created_at, id);

-- Keep v0 + Sprint 1 columns in sync.
CREATE OR REPLACE FUNCTION public.sync_artifact_comments_sprint1_cols()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prefer whichever side is present.
  NEW.artifact_id := COALESCE(NEW.artifact_id, NEW.artifact_slug);
  NEW.author_agent_id := COALESCE(NEW.author_agent_id, NEW.agent_id);

  -- v0 requires kind/body/raw. Provide minimal defaults when Sprint 1 inserts.
  NEW.kind := COALESCE(NEW.kind, 'review');
  NEW.body_md := COALESCE(NEW.body_md, NEW.content);
  NEW.raw_md := COALESCE(
    NEW.raw_md,
    '---\nartifact_id: ' || COALESCE(NEW.artifact_id, NEW.artifact_slug, '') ||
    '\nkind: ' || COALESCE(NEW.kind, 'review') ||
    '\n---\n\n' || COALESCE(NEW.body_md, NEW.content, '')
  );

  -- Fill Sprint 1 aliases when v0 inserts.
  NEW.artifact_slug := COALESCE(NEW.artifact_slug, NEW.artifact_id);
  NEW.agent_id := COALESCE(NEW.agent_id, NEW.author_agent_id);
  NEW.content := COALESCE(NEW.content, NEW.body_md, NEW.raw_md);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_artifact_comments_sprint1_cols ON artifact_comments;
CREATE TRIGGER trg_sync_artifact_comments_sprint1_cols
BEFORE INSERT OR UPDATE ON artifact_comments
FOR EACH ROW
EXECUTE FUNCTION public.sync_artifact_comments_sprint1_cols();


-- =============================
-- artifact_ratings aliases
-- =============================

ALTER TABLE IF EXISTS artifact_ratings
  ADD COLUMN IF NOT EXISTS artifact_slug text,
  ADD COLUMN IF NOT EXISTS agent_id text,
  ADD COLUMN IF NOT EXISTS rating int;

-- Backfill
UPDATE artifact_ratings
SET
  artifact_slug = COALESCE(artifact_slug, artifact_id),
  agent_id = COALESCE(agent_id, rater_agent_id),
  rating = COALESCE(rating, score)
WHERE
  artifact_slug IS NULL OR agent_id IS NULL OR rating IS NULL;

ALTER TABLE IF EXISTS artifact_ratings
  ALTER COLUMN artifact_slug SET NOT NULL,
  ALTER COLUMN agent_id SET NOT NULL,
  ALTER COLUMN rating SET NOT NULL;

-- Rating range constraint (1-5)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artifact_ratings_rating_range'
  ) THEN
    ALTER TABLE artifact_ratings
      ADD CONSTRAINT artifact_ratings_rating_range CHECK (rating BETWEEN 1 AND 5);
  END IF;
END $$;

-- Unique constraint: one rating per artifact per agent (Sprint 1)
CREATE UNIQUE INDEX IF NOT EXISTS artifact_ratings_artifact_slug_agent_id_key
  ON artifact_ratings (artifact_slug, agent_id);

CREATE OR REPLACE FUNCTION public.sync_artifact_ratings_sprint1_cols()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.artifact_id := COALESCE(NEW.artifact_id, NEW.artifact_slug);
  NEW.rater_agent_id := COALESCE(NEW.rater_agent_id, NEW.agent_id);
  NEW.score := COALESCE(NEW.score, NEW.rating);

  -- v0 requires raw_md; provide minimal defaults when Sprint 1 inserts.
  NEW.raw_md := COALESCE(
    NEW.raw_md,
    '---\nartifact_id: ' || COALESCE(NEW.artifact_id, NEW.artifact_slug, '') ||
    '\nscore: ' || COALESCE(NEW.score, NEW.rating, 0)::text ||
    '\n---\n'
  );

  NEW.dims := COALESCE(NEW.dims, '{}'::jsonb);
  NEW.updated_at := COALESCE(NEW.updated_at, now());

  NEW.artifact_slug := COALESCE(NEW.artifact_slug, NEW.artifact_id);
  NEW.agent_id := COALESCE(NEW.agent_id, NEW.rater_agent_id);
  NEW.rating := COALESCE(NEW.rating, NEW.score);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_artifact_ratings_sprint1_cols ON artifact_ratings;
CREATE TRIGGER trg_sync_artifact_ratings_sprint1_cols
BEFORE INSERT OR UPDATE ON artifact_ratings
FOR EACH ROW
EXECUTE FUNCTION public.sync_artifact_ratings_sprint1_cols();
