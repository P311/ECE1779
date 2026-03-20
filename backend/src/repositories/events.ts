import type { Pool } from "pg";
import { pool } from "./db";
import type {
  Event,
  EventFilters,
  PaginationParams,
  EventStatsParams,
  StatsBucket,
  BatchEventInput,
  EventsRepository,
} from "./types";

function getPool(): Pool {
  return pool;
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

  let where = "";
  let filterValue: string | undefined;

  if (filters.id) {
    where = `WHERE id::text ILIKE $1`;
    filterValue = `%${filters.id}%`;
  } else if (filters.source_id) {
    where = `WHERE source_id::text ILIKE $1`;
    filterValue = `%${filters.source_id}%`;
  } else if (filters.event_type) {
    where = `WHERE event_type ILIKE $1`;
    filterValue = `%${filters.event_type}%`;
  } else if (filters.severity) {
    where = `WHERE severity ILIKE $1`;
    filterValue = `%${filters.severity}%`;
  } else if (filters.payload) {
    where = `WHERE payload::text ILIKE $1`;
    filterValue = `%${filters.payload}%`;
  } else if (filters.ingested_at) {
    where = `WHERE ingested_at::text ILIKE $1`;
    filterValue = `%${filters.ingested_at}%`;
  }

  const pool = await getPool();
  const countParams = filterValue ? [filterValue] : [];
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM events ${where}`,
    countParams,
  );

  const total = countResult.rows[0]
    ? parseInt(countResult.rows[0].count, 10)
    : 0;

  const offset = (pagination.page - 1) * pagination.limit;
  let rows;
  if (filterValue) {
    const result = await pool.query<Event>(
      `SELECT * FROM events
       ${where}
       ORDER BY ingested_at DESC
       LIMIT $2 OFFSET $3`,
      [filterValue, pagination.limit, offset],
    );
    rows = result.rows;
  } else {
    const result = await pool.query<Event>(
      `SELECT * FROM events
       ORDER BY ingested_at DESC
       LIMIT $1 OFFSET $2`,
      [pagination.limit, offset],
    );
    rows = result.rows;
  }

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

export async function countEventsWithinMinutes(
  minutes: number,
): Promise<number> {
  const pool = await getPool();
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM events WHERE ingested_at >= NOW() - ($1 * INTERVAL '1 minute')`,
    [minutes],
  );

  return rows[0] ? parseInt(rows[0].count, 10) : 0;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const pool = await getPool();
  const result = await pool.query(
    `DELETE FROM events
     WHERE id = $1`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}

export const eventsRepository: EventsRepository = {
  insertEvent,
  insertEventsBatch,
  queryEvents,
  countEventsWithinMinutes,
  getEventStats,
  deleteEvent,
};
