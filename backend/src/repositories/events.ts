import type { Pool } from "pg";
import type {
  Event,
  EventFilters,
  PaginationParams,
  EventStatsParams,
  StatsBucket,
  BatchEventInput,
  EventsRepository,
} from "./types";

async function getPool(): Promise<Pool> {
  const module = await import("./db.js");
  return module.pool as Pool;
}

export async function insertEvent(
  sourceId: string,
  eventType: string,
  severity: "info" | "warning" | "critical",
  payload: Record<string, unknown>,
): Promise<Event> {
  const pool = await getPool();
  const { rows } = await pool.query<Event>(
    `INSERT INTO events (source_id, event_type, severity, payload)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sourceId, eventType, severity, JSON.stringify(payload)],
  );
  if (!rows[0]) {
    throw new Error("Failed to insert event");
  }
  return rows[0];
}

export async function insertEventsBatch(
  sourceId: string,
  events: BatchEventInput[],
): Promise<Event[]> {
  if (events.length === 0) return [];
  const eventTypes = events.map((e) => e.event_type);
  const severities = events.map((e) => e.severity);
  const payloads = events.map((e) => JSON.stringify(e.payload ?? {}));
  const sourceIds = events.map(() => sourceId);
  const pool = await getPool();

  const { rows } = await pool.query<Event>( // Insert events as batch using UNNEST for efficiency
    `INSERT INTO events (source_id, event_type, severity, payload)
     SELECT
       UNNEST($1::uuid[]),
       UNNEST($2::varchar[]),
       UNNEST($3::varchar[]),
       UNNEST($4::jsonb[])
     RETURNING *`,
    [sourceIds, eventTypes, severities, payloads],
  );

  return rows;
}

export async function queryEvents(
  filters: EventFilters,
  pagination: PaginationParams,
): Promise<{ data: Event[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.source_id) {
    conditions.push(`source_id = $${idx++}`);
    params.push(filters.source_id);
  }
  if (filters.event_type) {
    conditions.push(`event_type = $${idx++}`);
    params.push(filters.event_type);
  }
  if (filters.severity) {
    conditions.push(`severity = $${idx++}`);
    params.push(filters.severity);
  }
  if (filters.start_time) {
    conditions.push(`ingested_at >= $${idx++}`);
    params.push(filters.start_time);
  }
  if (filters.end_time) {
    conditions.push(`ingested_at <= $${idx++}`);
    params.push(filters.end_time);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const pool = await getPool();
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM events ${where}`,
    params,
  );
  const total = countResult.rows[0]
    ? parseInt(countResult.rows[0].count, 10)
    : 0;

  const offset = (pagination.page - 1) * pagination.limit;
  params.push(pagination.limit, offset);

  const { rows } = await pool.query<Event>(
    `SELECT * FROM events ${where}
     ORDER BY ingested_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params,
  );

  return { data: rows, total };
}

export async function getEventStats(
  params: EventStatsParams,
): Promise<StatsBucket[]> {
  const conditions: string[] = [`ingested_at >= $1`, `ingested_at <= $2`];
  const queryParams: unknown[] = [params.start_time, params.end_time];
  let idx = 3;

  if (params.source_id) {
    conditions.push(`source_id = $${idx++}`);
    queryParams.push(params.source_id);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const trunc = params.group_by;

  const pool = await getPool();
  const { rows } = await pool.query<{
    timestamp: Date;
    count: string;
    critical: string;
    warning: string;
    info: string;
  }>(
    `SELECT
       date_trunc('${trunc}', ingested_at) AS timestamp,
       COUNT(*)                             AS count,
       COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
       COUNT(*) FILTER (WHERE severity = 'warning')  AS warning,
       COUNT(*) FILTER (WHERE severity = 'info')     AS info
     FROM events
     ${where}
     GROUP BY date_trunc('${trunc}', ingested_at)
     ORDER BY timestamp ASC`,
    queryParams,
  );

  return rows.map((r) => ({
    timestamp: r.timestamp,
    count: parseInt(r.count, 10),
    critical: parseInt(r.critical, 10),
    warning: parseInt(r.warning, 10),
    info: parseInt(r.info, 10),
  }));
}

export const eventsRepository: EventsRepository = {
  insertEvent,
  insertEventsBatch,
  queryEvents,
  getEventStats,
};
