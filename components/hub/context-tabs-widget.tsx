"use client";

import { useState } from "react";
import { LeagueTablesWidget } from "./league-tables-widget";
import { GlobalLeaderboardWidget } from "./global-leaderboard-widget";
import { TopClaimsWidget } from "./top-claims-widget";
import { PlayerStatsWidget } from "./player-stats-widget";
import { Trophy, Users, Flame, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type TabId = "standings" | "predictors" | "takes" | "form";

const TABS = [
  { id: "standings", label: "League Standings", icon: Trophy },
  { id: "predictors", label: "Top Predictors", icon: Users },
  { id: "takes", label: "Hot Takes", icon: Flame },
  { id: "form", label: "Player Form", icon: Activity },
];

export function ContextTabsWidget({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeTab, setActiveTab] = useState<TabId>("standings");

  return (
    <div className="space-y-4">
      {/* Tab Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none w-full min-w-0 -mx-1 px-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabId)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold transition-all border active:scale-95 duration-150 ${
                isActive
                  ? "bg-sky-500 text-white border-sky-400 shadow-sm"
                  : "bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : ""}`} />
              <span className="font-sans">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="w-full min-w-0 max-w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full min-w-0 max-w-full"
          >
            {activeTab === "standings" && <LeagueTablesWidget />}
            {activeTab === "predictors" && <GlobalLeaderboardWidget />}
            {activeTab === "takes" && <TopClaimsWidget isLoggedIn={isLoggedIn} />}
            {activeTab === "form" && <PlayerStatsWidget />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
