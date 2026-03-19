"use client";

import { useState } from "react";
import stats_source from "@/testing_data/stats_source.json";
import stats_severity from "@/testing_data/stats_severity.json";
import stats_timeline from "@/testing_data/stats_timeline.json";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ChartPieLabel } from "../components/chartPieLabel";
import { ChartTimeline } from "../components/chartTimeline";

const TABS = [
  { key: "event_timeline", label: "Event Timeline" },
  { key: "source_group", label: "Source Groups" },
  { key: "severity_analysis", label: "Severity Analysis" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  console.log("stats source:", stats_source);

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
        {activeTab === "event_timeline" && <ChartTimeline data={stats_timeline} />}
        {activeTab === "source_group" && 
        <ChartPieLabel data={stats_source} nameKey="source"/>}
        {activeTab === "severity_analysis" && 
        <ChartPieLabel data={stats_severity} nameKey="severity"/>}
      </div>
    </main>
  );
}
