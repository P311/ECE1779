export interface Source {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  last_used_at: Date | null;
  is_active: boolean;
}

export interface SourceRow {
  id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  api_key_hash: string;
  created_at: Date;
  last_used_at: Date | null;
  is_active: boolean;
}

export interface CreatedSource extends Source {
  api_key: string;
}

export interface SourceWithStats extends Source {
  stats: {
    total_events: number;
    last_event_at: Date | null;
    critical_count_24h: number;
  };
}

export interface Event {
  id: string;
  source_id: string;
  event_type: string;
  severity: "info" | "warning" | "critical";
  payload: Record<string, unknown>;
  ingested_at: Date;
}

export interface EventFilters {
  source_id?: string;
  event_type?: string;
  severity?: string;
  start_time?: string;
  end_time?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface EventStatsParams {
  group_by: "minute" | "hour" | "day" | "month";
  start_time: string;
  end_time: string;
  source_id?: string;
}

export interface StatsBucket {
  timestamp: Date;
  count: number;
  critical: number;
  warning: number;
  info: number;
}

export interface TimelineBucket {
  time: string;
  count: number;
}

export interface SourceBucket {
  source: string;
  count: number;
}

export interface SeverityBucket {
  severity: string;
  count: number;
}

export interface BatchEventInput {
  event_type: string;
  severity: "info" | "warning" | "critical";
  payload?: Record<string, unknown>;
}

export type EventsRepository = {
  insertEvent(
    sourceId: string,
    eventType: string,
    severity: "info" | "warning" | "critical",
    payload: Record<string, unknown>,
  ): Promise<Event>;
  insertEventsBatch(
    sourceId: string,
    events: BatchEventInput[],
  ): Promise<Event[]>;
  queryEvents(
    filters: EventFilters,
    pagination: PaginationParams,
  ): Promise<{ data: Event[]; total: number }>;
  getEventStats(params: EventStatsParams): Promise<StatsBucket[]>;
};

export type SourcesRepository = {
  createSource(
    name: string,
    description?: string | null,
  ): Promise<CreatedSource>;
  getSourceByApiKey(key: string): Promise<Source | null>;
  getSources(): Promise<SourceWithStats[]>;
  getSourceById(id: string): Promise<Source | null>;
};
