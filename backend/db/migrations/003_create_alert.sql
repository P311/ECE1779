-- Migration 003 - Create alert configuration table (single-row)
CREATE TABLE alert (
    id                  INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    active              BOOLEAN NOT NULL DEFAULT FALSE,
    time_window_minutes INT NOT NULL DEFAULT 60,
    event_threshold     INT NOT NULL DEFAULT 100,
    email               TEXT NOT NULL DEFAULT ''
);

COMMENT ON TABLE alert IS 'Single-row alert configuration for event volume notifications';

-- Seed the default configuration row
INSERT INTO alert (id, active, time_window_minutes, event_threshold, email)
VALUES (1, FALSE, 60, 100, '');
