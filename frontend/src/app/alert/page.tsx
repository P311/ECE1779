"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/hooks/usePolling";
import { apiRequest } from "@/utils/api";

interface AlertConfig {
  active: boolean;
  time_window_minutes: number;
  event_threshold: number;
  email: string;
}

export default function AlertPage() {
  const { data: config } = usePolling<AlertConfig>("/api/v1/alert/config");

  const [active, setActive] = useState(false);
  const [timeWindow, setTimeWindow] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (config && !initialized) {
      setActive(config.active);
      setTimeWindow(config.time_window_minutes);
      setThreshold(config.event_threshold);
      setEmail(config.email);
      setInitialized(true);
    }
  }, [config, initialized]);

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    await apiRequest("/api/v1/alert/config", "PUT", {
      active,
      time_window_minutes: timeWindow,
      event_threshold: threshold,
      email,
    });
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
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="alert@example.com"
            aria-invalid={!!emailError}
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
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
