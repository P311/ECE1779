import * as crypto from "crypto";
import { pool } from "./db";
import type {
  Source,
  SourceRow,
  CreatedSource,
  SourceWithStats,
  SourcesRepository,
} from "./types";
import { ConflictError } from "../errors/ConflictError";

export function generateApiKey(): {
  apiKey: string;
  keyPrefix: string;
  apiKeyHash: string;
} {
  const keyPrefix = crypto.randomBytes(4).toString("hex"); // 8 chars
  const secret = crypto.randomBytes(24).toString("hex"); // 48 chars
  const apiKey = `evt_${keyPrefix}_${secret}`;
  const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  return { apiKey, keyPrefix, apiKeyHash };
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function extractKeyPrefix(apiKey: string): string | null {
  const parts = apiKey.split("_");
  if (parts.length !== 3 || parts[0] !== "evt") return null;
  const [, keyPrefix] = parts;
  return keyPrefix ?? null;
}

export async function createSource(
  name: string,
  description?: string | null,
): Promise<CreatedSource> {
  try {
    const { apiKey, keyPrefix, apiKeyHash } = generateApiKey();

    const { rows } = await pool.query<Source>(
      `INSERT INTO sources (name, description, key_prefix, api_key_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, created_at, last_used_at, is_active`,
      [name, description ?? null, keyPrefix, apiKeyHash],
    );

    if (!rows[0]) throw new Error("Failed to create source");

    return { ...rows[0], api_key: apiKey };
  } catch (err: any) {
    if (err.code === "23505") {
      throw new ConflictError(`Source '${name}' already exists.`);
    }
    throw err;
  }
}

export async function getSourceByApiKey(key: string): Promise<Source | null> {
  const keyPrefix = extractKeyPrefix(key);
  if (!keyPrefix) return null;

  const { rows } = await pool.query<SourceRow>(
    `SELECT * FROM sources WHERE key_prefix = $1 AND is_active = true LIMIT 1`,
    [keyPrefix],
  );

  const source = rows[0];
  if (!source) return null;

  const incomingHash = hashApiKey(key);
  const storedHash = source.api_key_hash;

  const hexSha256 = /^[0-9a-f]{64}$/i;
  if (
    !storedHash ||
    typeof storedHash !== "string" ||
    storedHash.length !== incomingHash.length ||
    !hexSha256.test(storedHash) ||
    !hexSha256.test(incomingHash)
  ) {
    return null;
  }

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(incomingHash, "hex"),
  );
  if (!isMatch) return null;

  const { rows: updated } = await pool.query<{ last_used_at: Date }>(
    `UPDATE sources SET last_used_at = NOW() WHERE id = $1 RETURNING last_used_at`,
    [source.id],
  );

  return {
    id: source.id,
    name: source.name,
    description: source.description,
    created_at: source.created_at,
    last_used_at: updated[0]?.last_used_at ?? source.last_used_at,
    is_active: source.is_active,
  };
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
  getSourceByApiKey,
  getSources,
  getSourceById,
};
