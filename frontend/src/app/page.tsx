"use client";

import { useState, useEffect } from "react";
import EventTable from "./components/eventTable";
import events from "@/testing_data/events.json";
import alertConfig from "@/testing_data/alert_config.json";
import { Badge } from "@/components/ui/badge";

function checkHighVolume() {
  const now = new Date();
  const windowStart = new Date(
    now.getTime() - alertConfig.time_window_minutes * 60 * 1000
  );
  const recentCount = events.filter(
    (e) => new Date(e.ingested_at) >= windowStart
  ).length;
  return recentCount > alertConfig.event_threshold;
}

export default function Home() {
  const [highVolume, setHighVolume] = useState(false);

  useEffect(() => {
    setHighVolume(checkHighVolume());
    // recheck every minute
    const interval = setInterval(() => {
      setHighVolume(checkHighVolume());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="page-container">
      <div className="flex items-center gap-3">
        <h1>Events</h1>
        {highVolume && (
          <Badge variant="destructive">High Volume Alert</Badge>
        )}
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <EventTable events={events} />
      </div>
    </main>
  );
}
