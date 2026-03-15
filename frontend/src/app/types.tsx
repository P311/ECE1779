// Define interfaces and constants
export interface Event {
  id: string;
  source_id: string;
  event_type: string;
  severity: string;
  payload: Record<string, unknown>;
  ingested_at: string;
}

export const SEVERITY_COLOR: Record<string, string> = {
  info: "#2196f3",
  warning: "#ff9800",
  critical: "#f44336",
};
