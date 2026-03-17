-- Migration 001 - Create sources table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE sources (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    api_key     VARCHAR(64) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sources IS 'Registered event sources with unique API keys';
COMMENT ON COLUMN sources.api_key IS 'Bearer token used by source to authenticate event ingestion';
