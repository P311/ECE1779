import { pool } from "./db";
import type { AlertConfig } from "./types";

export async function getAlertConfig(): Promise<AlertConfig> {
  const { rows } = await pool.query<AlertConfig>(
    `SELECT active, time_window_minutes, event_threshold, email FROM alert WHERE id = 1`,
  );
  if (!rows[0]) {
    throw new Error("Alert configuration row not found");
  }
  return rows[0];
}

export async function upsertAlertConfig(config: AlertConfig): Promise<AlertConfig> {
  const { rows } = await pool.query<AlertConfig>(
    `INSERT INTO alert (id, active, time_window_minutes, event_threshold, email)
     VALUES (1, $1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
       SET active              = EXCLUDED.active,
           time_window_minutes = EXCLUDED.time_window_minutes,
           event_threshold     = EXCLUDED.event_threshold,
           email               = EXCLUDED.email
     RETURNING active, time_window_minutes, event_threshold, email`,
    [config.active, config.time_window_minutes, config.event_threshold, config.email],
  );
  if (!rows[0]) {
    throw new Error("Failed to upsert alert configuration");
  }
  return rows[0];
}
