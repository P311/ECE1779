"use client";

import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TABS = [
  { key: "event_group", label: "Event Groups" },
  { key: "source_group", label: "Source Groups" },
  { key: "sources", label: "Sources" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

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
        {activeTab === "event_group" && <p>Event Groups analytics content here.</p>}
        {activeTab === "source_group" && <p>Source Groups analytics content here.</p>}
        {activeTab === "sources" && <p>Sources analytics content here.</p>}
      </div>
    </main>
  );
}
