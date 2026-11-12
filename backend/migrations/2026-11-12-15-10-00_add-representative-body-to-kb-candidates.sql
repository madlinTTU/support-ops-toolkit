-- Up Migration
ALTER TABLE kb_candidates ADD COLUMN representative_body text NOT NULL DEFAULT '';

-- Down Migration
ALTER TABLE kb_candidates DROP COLUMN representative_body;
