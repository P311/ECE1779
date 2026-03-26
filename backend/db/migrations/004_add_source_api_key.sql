ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS key_prefix   VARCHAR(16),
  ADD COLUMN IF NOT EXISTS api_key_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_sources_key_prefix ON sources(key_prefix);

COMMENT ON COLUMN sources.key_prefix   IS 'Non-secret identifier used to locate the source API key record';
COMMENT ON COLUMN sources.api_key_hash IS 'SHA-256 hash of the full API key used for authentication';
