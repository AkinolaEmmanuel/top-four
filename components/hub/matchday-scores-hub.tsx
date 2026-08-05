"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_FIXTURES } from "@/lib/api-football/mock-data";
import { TeamLogo } from "@/components/ui/team-logo";
import { Activity, ArrowRight, Trophy, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEAGUE_TABS = [
  { id: 39, name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga", flag: "🇪🇸" },
  { id: 135, name: "Serie A", flag: "🇮🇹" },
  { id: 78, name: "Bundesliga", flag: "🇩🇪" },
  { id: 61, name: "Ligue 1", flag: "🇫🇷" },
  { id: 2, name: "Champions League", flag: "🇪🇺" },
];

export function MatchdayScoresHub() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(39);
  const [statusFilter, setStatusFilter] = useState<"all" | "ft" | "ns">("all");

  const leagueFixtures = MOCK_FIXTURES.filter((f) => f.league.id === selectedLeagueId);

  const filteredFixtures = leagueFixtures.filter((f) => {
    if (statusFilter === "ft") return f.status === "FT" || f.status === "PEN";
    if (statusFilter === "ns") return f.status === "NS";
    return true;
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-elevation-dark-1">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-ping" />
            <h3 className="text-lg font-black tracking-tight text-foreground uppercase flex items-center gap-2 font-heading">
              Matchday Scores & Fixtures Hub
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Live scores, finished results, and upcoming fixtures across Europe.
          </p>
        </div>

        {/* Status Sub-Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary border border-border">
          {[
            { id: "all", label: "ALL" },
            { id: "ft", label: "RESULTS (FT)" },
            { id: "ns", label: "UPCOMING" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                statusFilter === st.id
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Leagues & UCL Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {LEAGUE_TABS.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeagueId(l.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              selectedLeagueId === l.id
                ? "bg-sky-500/15 border-sky-500/40 text-sky-500 shadow-sm"
                : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* Fixtures Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredFixtures.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground font-mono text-xs">
            No fixtures match the selected filter.
          </div>
        ) : (
          filteredFixtures.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm hover:border-sky-500/30 transition-colors"
            >
              {/* Round & Status Bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-semibold text-foreground">{f.round}</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                  f.status === "FT" || f.status === "PEN"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-500"
                }`}>
                  {f.status === "FT" ? "FULL TIME" : f.status === "PEN" ? "PENALTIES" : "UPCOMING"}
                </span>
              </div>

              {/* Match Teams & Scoreline */}
              <div className="grid grid-cols-3 items-center text-center my-2">
                {/* Home */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-10 w-10 p-1.5 rounded-xl bg-secondary border border-border flex items-center justify-center">
                    <TeamLogo src={f.teams.home.logo} teamName={f.teams.home.name} />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate max-w-[85px]">{f.teams.home.name}</span>
                </div>

                {/* Score or VS */}
                <div className="flex flex-col items-center justify-center font-mono">
                  {f.status === "FT" || f.status === "PEN" ? (
                    <span className="text-xl font-black tracking-wider text-emerald-500">
                      {f.goals.home} - {f.goals.away}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-secondary text-muted-foreground border border-border">
                      VS
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-10 w-10 p-1.5 rounded-xl bg-secondary border border-border flex items-center justify-center">
                    <TeamLogo src={f.teams.away.logo} teamName={f.teams.away.name} />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate max-w-[85px]">{f.teams.away.name}</span>
                </div>
              </div>

              {/* Predict CTA */}
              <Link href="/predict" className="block pt-1">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 justify-between">
                  <span>Predict Outcome</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
