"use client";

import { useState, useEffect } from "react";
import EventTable from "./components/eventTable";
import { Badge } from "@/components/ui/badge";
import { usePolling } from "@/hooks/usePolling";
import { Event } from "./types";

interface AlertConfig {
  active: boolean;
  time_window_minutes: number;
  event_threshold: number;
  email: string;
}

interface EventsResponse {
  events: Event[];
  page: number;
  total: number;
}

export default function Home() {
  const [page, setPage] = useState(1);
  const [searchField, setSearchField] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [highVolume, setHighVolume] = useState(false);

  const query = new URLSearchParams();
  query.set("page", String(page));
  if (searchField && searchValue) {
    query.set(searchField, searchValue);
  }

  const { data: eventsData } = usePolling<EventsResponse>(
    `/api/v1/events?${query.toString()}`,
  );
  const { data: alertConfig } = usePolling<AlertConfig>(
    "/api/v1/alert/config",
  );

  useEffect(() => {
    if (!eventsData || !alertConfig) return;
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - alertConfig.time_window_minutes * 60 * 1000,
    );
    const recentCount = eventsData.events.filter(
      (e) => new Date(e.ingested_at) >= windowStart,
    ).length;
    setHighVolume(recentCount > alertConfig.event_threshold);
  }, [eventsData, alertConfig]);

  const events = eventsData?.events ?? [];
  const total = eventsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  return (
    <main className="page-container">
      <div className="flex items-center gap-3">
        <h1>Events</h1>
        {highVolume && (
          <Badge variant="destructive">High Volume Alert</Badge>
        )}
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <EventTable
          events={events}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onSearch={(field, value) => {
            setSearchField(field);
            setSearchValue(value);
            setPage(1);
          }}
        />
      </div>
    </main>
  );
}
