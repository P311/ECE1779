-- Migration 002 - Create events table with indexes
CREATE TABLE events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id   UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    event_type  VARCHAR(100) NOT NULL,
    severity    VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    payload     JSONB NOT NULL DEFAULT '{}',
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_ingested ON events (ingested_at DESC);
CREATE INDEX idx_events_source   ON events (source_id, ingested_at DESC);
CREATE INDEX idx_events_severity ON events (severity, ingested_at DESC);
CREATE INDEX idx_events_type     ON events (event_type);

COMMENT ON TABLE events IS 'Ingested events from all sources';
COMMENT ON COLUMN events.payload IS 'Arbitrary JSON payload from the source';
COMMENT ON COLUMN events.severity IS 'Event severity level: info, warning, or critical';
