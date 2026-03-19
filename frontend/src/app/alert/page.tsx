"use client";

import { useState } from "react";
import alertConfig from "@/testing_data/alert_config.json";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AlertPage() {
  const [active, setActive] = useState(alertConfig.active);
  const [timeWindow, setTimeWindow] = useState(alertConfig.time_window_minutes);
  const [threshold, setThreshold] = useState(alertConfig.event_threshold);
  const [email, setEmail] = useState(alertConfig.email);

  const handleSave = () => {
    const config = {
      active,
      time_window_minutes: timeWindow,
      event_threshold: threshold,
      email,
    };
    // TODO: PUT /api/v1/alert/config
    console.log("Saving alert config:", config);
  };

  return (
    <main className="page-container">
      <h1>Alert Configuration</h1>
      <div className="mt-6 max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="active">Enable Alerting</Label>
          <Switch id="active" checked={active} onCheckedChange={setActive} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alert@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-window">Time Window (minutes)</Label>
          <Input
            id="time-window"
            type="number"
            min={1}
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold">Event Threshold</Label>
          <Input
            id="threshold"
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </div>
    </main>
  );
}
