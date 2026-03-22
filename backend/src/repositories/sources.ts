import { pool } from "./db";
import type {
  Source,
  SourceWithStats,
  SourcesRepository,
} from "./types";
import { ConflictError } from "../errors/ConflictError";

export async function createSource(
  name: string,
  description?: string | null,
): Promise<Source> {
  try {
    const { rows } = await pool.query<Source>(
      `INSERT INTO sources (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at, last_used_at, is_active`,
      [name, description ?? null],
    );

    if (!rows[0]) {
      throw new Error("Failed to create source");
    }

    return rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      // Unique key violation
      throw new ConflictError(`Source '${name}' already exists.`);
    }
  }
  throw new Error("Unreachable");
}

export async function getSources(): Promise<SourceWithStats[]> {
  const { rows } = await pool.query<
    Source & {
      total_events: string;
      last_event_at: Date | null;
      critical_count_24h: string;
    }
  >(
    `SELECT
       s.id,
       s.name,
       s.description,
       s.created_at,
       s.last_used_at,
       s.is_active,
       COALESCE(COUNT(e.id), 0)::text AS total_events,
       MAX(e.ingested_at) AS last_event_at,
       COALESCE(SUM(
         CASE WHEN e.severity = 'critical'
               AND e.ingested_at >= NOW() - INTERVAL '24 hours'
           THEN 1 ELSE 0 
         END
       ), 0)::text AS critical_count_24h
     FROM sources s
     LEFT JOIN events e ON e.source_id = s.id
     GROUP BY s.id
     ORDER BY s.created_at ASC`,
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    created_at: r.created_at,
    last_used_at: r.last_used_at,
    is_active: r.is_active,
    stats: {
      total_events: parseInt(r.total_events, 10),
      last_event_at: r.last_event_at,
      critical_count_24h: parseInt(r.critical_count_24h, 10),
    },
  }));
}

export async function getSourceById(id: string): Promise<Source | null> {
  const { rows } = await pool.query<Source>(
    `SELECT id, name, description, created_at, last_used_at, is_active FROM sources WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export const sourcesRepository: SourcesRepository = {
  createSource,
  getSources,
  getSourceById,
};
