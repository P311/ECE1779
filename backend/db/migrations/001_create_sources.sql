-- Migration 001 - Create sources table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE sources (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) UNIQUE NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at  TIMESTAMPTZ,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE sources IS 'Registered event sources';
COMMENT ON COLUMN sources.last_used_at IS 'Timestamp of the most recent event ingestion';
COMMENT ON COLUMN sources.is_active IS 'Whether the source is allowed to ingest events';
