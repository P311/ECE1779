export interface Source {
  id: string;
  name: string;
  description: string | null;
  api_key: string;
  created_at: Date;
}

export interface SourceWithStats extends Omit<Source, 'api_key'> {
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
  severity: 'info' | 'warning' | 'critical';
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
  group_by: 'hour' | 'day';
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

export interface BatchEventInput {
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  payload?: Record<string, unknown>;
}

export type EventsRepository = {
  insertEvent(  
    sourceId: string,
    eventType: string,
    severity: 'info' | 'warning' | 'critical',
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
  getEventStats(params: EventStatsParams): Promise<StatsBucket[]>
};

export type SourcesRepository = {
  createSource(
    name: string,
    description?: string | null,
  ): Promise<Source>;
  getSourceByApiKey(key: string): Promise<Source | null>;
  getSources(): Promise<SourceWithStats[]>;
  getSourceById(id: string): Promise<Source | null>;
}