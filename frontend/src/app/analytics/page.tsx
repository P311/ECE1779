"use client";

import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartPieLabel } from "../components/chartPieLabel";
import { ChartTimeline } from "../components/chartTimeline";
import { usePolling } from "@/hooks/usePolling";
import { StatsSource, StatsSeverity, StatsTimeline } from "../types";

const TABS = [
  { key: "event_timeline", label: "Event Timeline" },
  { key: "source_group", label: "Source Groups" },
  { key: "severity_analysis", label: "Severity Analysis" },
];

const GROUP_BY_OPTIONS = [
  { value: "minute", label: "Minute" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [groupBy, setGroupBy] = useState("minute");

  const { data: timeline } = usePolling<StatsTimeline[]>(
    `/api/v1/stats/timeline?group_by=${groupBy}`,
  );
  const { data: statsSource } = usePolling<StatsSource[]>(
    "/api/v1/stats/source",
  );
  const { data: statsSeverity } = usePolling<StatsSeverity[]>(
    "/api/v1/stats/severity",
  );

  return (
    <main className="page-container">
      <h1>Analytics</h1>
      <div className="mt-4 border-b">
        <NavigationMenu>
          <NavigationMenuList>
            {TABS.map((tab) => (
              <NavigationMenuItem key={tab.key}>
                <NavigationMenuLink
                  active={activeTab === tab.key}
                  className={`${navigationMenuTriggerStyle()}
                    ${activeTab === tab.key ?
                    "text-black font-bold" : "text-gray-500"}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ cursor: "pointer" }}
                >
                  {tab.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="mt-6">
        {activeTab === "event_timeline" && (
          <div>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ChartTimeline data={timeline ?? []} groupBy={groupBy} />
          </div>
        )}
        {activeTab === "source_group" &&
        <ChartPieLabel data={statsSource ?? []} nameKey="source"/>}
        {activeTab === "severity_analysis" &&
        <ChartPieLabel data={statsSeverity ?? []} nameKey="severity"/>}
      </div>
    </main>
  );
}
