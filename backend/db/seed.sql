-- Seed data for development
-- Run after migrations

-- Insert sample sources (deterministic API keys for testing)
INSERT INTO sources (id, name, description, key_prefix, api_key_hash) VALUES
  ('11111111-1111-1111-1111-111111111111', 'web-app', 'Primary web application', 'aabbccdd', ENCODE(DIGEST('evt_aabbccdd_11223344aabbccdd11223344', 'sha256'), 'hex')),
  ('22222222-2222-2222-2222-222222222222', 'mobile-ios', 'iOS mobile application', '55667788', ENCODE(DIGEST('evt_55667788_55667788aabbccdd55667788', 'sha256'), 'hex')),
  ('33333333-3333-3333-3333-333333333333', 'payment-service', 'Payment processing microservice', '99001122', ENCODE(DIGEST('evt_99001122_334455669900112233445566', 'sha256'), 'hex')),
  ('44444444-4444-4444-4444-444444444444', 'data-pipeline', 'ETL data pipeline', 'ffeeddcc', ENCODE(DIGEST('evt_ffeeddcc_bbaa0099ffeeddccbbaa0099', 'sha256'), 'hex'))
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (source_id, event_type, severity, payload, ingested_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user.login', 'info', '{"user_id": "u001", "ip": "192.168.1.1"}', NOW() - INTERVAL '1 hour'),
  ('11111111-1111-1111-1111-111111111111', 'page.view', 'info', '{"path": "/dashboard", "duration_ms": 120}', NOW() - INTERVAL '50 minutes'),
  ('22222222-2222-2222-2222-222222222222', 'crash.report', 'critical', '{"device": "iPhone 14", "os": "17.1", "screen": "HomeScreen"}', NOW() - INTERVAL '45 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'payment.failed', 'critical', '{"amount": 99.99, "currency": "USD", "reason": "insufficient_funds"}', NOW() - INTERVAL '40 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'payment.success', 'info', '{"amount": 49.00, "currency": "USD", "txn_id": "txn_xyz"}', NOW() - INTERVAL '35 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'api.slow_query', 'warning', '{"endpoint": "/api/reports", "duration_ms": 3200}', NOW() - INTERVAL '30 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'pipeline.failed', 'critical', '{"job": "daily-etl", "error": "connection timeout"}', NOW() - INTERVAL '25 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'pipeline.completed', 'info', '{"job": "hourly-sync", "rows_processed": 15000}', NOW() - INTERVAL '20 minutes'),
  ('22222222-2222-2222-2222-222222222222', 'user.signup', 'info', '{"plan": "free", "referral": "organic"}', NOW() - INTERVAL '15 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'disk.high_usage', 'warning', '{"host": "web-01", "used_pct": 82}', NOW() - INTERVAL '10 minutes'),
  ('22222222-2222-2222-2222-222222222222', 'app.update', 'info', '{"version": "2.3.1", "platform": "ios"}', NOW() - INTERVAL '9 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'payment.refund', 'warning', '{"amount": 25.50, "currency": "USD", "reason": "customer_request"}', NOW() - INTERVAL '8 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'user.logout', 'info', '{"user_id": "u001", "session_duration_ms": 360000}', NOW() - INTERVAL '7 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'pipeline.stalled', 'warning', '{"job": "weekly-report", "stuck_at": "transform"}', NOW() - INTERVAL '6 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'payment.chargeback', 'critical', '{"amount": 199.99, "currency": "USD", "dispute_id": "dsp_abc"}', NOW() - INTERVAL '5 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'api.error', 'critical', '{"endpoint": "/api/checkout", "status": 500, "message": "db timeout"}', NOW() - INTERVAL '4 minutes'),
  ('22222222-2222-2222-2222-222222222222', 'push.delivered', 'info', '{"campaign": "spring_sale", "device_count": 4500}', NOW() - INTERVAL '3 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'pipeline.completed', 'info', '{"job": "realtime-sync", "rows_processed": 8200}', NOW() - INTERVAL '2 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'user.login', 'info', '{"user_id": "u042", "ip": "10.0.0.55"}', NOW() - INTERVAL '90 seconds'),
  ('33333333-3333-3333-3333-333333333333', 'payment.success', 'info', '{"amount": 150.00, "currency": "CAD", "txn_id": "txn_qrs"}', NOW() - INTERVAL '60 seconds'),
  ('22222222-2222-2222-2222-222222222222', 'crash.report', 'critical', '{"device": "iPhone 15 Pro", "os": "18.0", "screen": "Settings"}', NOW() - INTERVAL '45 seconds'),
  ('44444444-4444-4444-4444-444444444444', 'pipeline.failed', 'critical', '{"job": "nightly-backup", "error": "disk full"}', NOW() - INTERVAL '30 seconds'),
  ('11111111-1111-1111-1111-111111111111', 'memory.high_usage', 'warning', '{"host": "web-02", "used_pct": 91}', NOW() - INTERVAL '15 seconds'),
  ('22222222-2222-2222-2222-222222222222', 'user.signup', 'info', '{"plan": "premium", "referral": "ad_campaign"}', NOW() - INTERVAL '5 seconds'),
  ('33333333-3333-3333-3333-333333333333', 'payment.failed', 'critical', '{"amount": 75.00, "currency": "EUR", "reason": "card_expired"}', NOW() - INTERVAL '1 second');
