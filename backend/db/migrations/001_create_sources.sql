-- Migration 001 - Create sources table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE sources (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) UNIQUE NOT NULL,
    description   TEXT,
    key_prefix    VARCHAR(16) UNIQUE NOT NULL,
    api_key_hash  TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at  TIMESTAMPTZ,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_sources_key_prefix ON sources(key_prefix);

COMMENT ON TABLE sources IS 'Registered event sources with unique API keys';
COMMENT ON COLUMN sources.key_prefix IS 'Non-secret identifier used to locate the source API key record';
COMMENT ON COLUMN sources.api_key_hash IS 'Hash of the full API key used for authentication';
COMMENT ON COLUMN sources.last_used_at IS 'Timestamp of the most recent successful authentication';
COMMENT ON COLUMN sources.is_active IS 'Whether the source is allowed to authenticate and ingest events'