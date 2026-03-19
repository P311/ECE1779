// Define interfaces and constants
export interface Event {
  id: string;
  source_id: string;
  event_type: string;
  severity: string;
  payload: Record<string, unknown>;
  ingested_at: string;
}

export interface Source {
  id: string;
  name: string;
  description: string;
  created_at: string;
  stats: {
    total_events: number;
    last_event_at: string;
    critical_count_24h: number;
  };
}

export interface StatsSeverity {
  severity: string;
  count: number;
}

export interface StatsTimeline {
  time: string;
  count: number;
}

export interface StatsSource {
  source: string;
  count: number;
}

export const SEVERITY_COLOR: Record<string, string> = {
  info: "#2196f3",
  warning: "#ff9800",
  critical: "#f44336",
};
