-- Collaboration primitive v0: remix + lineage

ALTER TABLE artifacts
  ADD COLUMN IF NOT EXISTS parent_artifact_id TEXT NULL;

-- Add FK after column exists. (IF NOT EXISTS not supported for constraints, so guard by dropping first.)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'artifacts_parent_artifact_id_fkey'
      AND table_name = 'artifacts'
  ) THEN
    -- already present
    NULL;
  ELSE
    ALTER TABLE artifacts
      ADD CONSTRAINT artifacts_parent_artifact_id_fkey
      FOREIGN KEY (parent_artifact_id)
      REFERENCES artifacts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_artifacts_parent_artifact_id ON artifacts(parent_artifact_id);
