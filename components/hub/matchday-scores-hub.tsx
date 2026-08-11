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
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-6 space-y-4 sm:space-y-6 shadow-sm dark:shadow-elevation-dark-1 w-full max-w-full min-w-0 overflow-hidden">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-3.5">
          <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-ping" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
              Scores & fixtures
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Live scores, results, and upcoming fixtures across Europe.
          </p>
        </div>

        {/* Status Sub-Filters Grid */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary/80 border border-border w-full sm:w-auto text-center">
          {[
            { id: "all", label: "All" },
            { id: "ft", label: "Results" },
            { id: "ns", label: "Upcoming" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all whitespace-nowrap active:scale-95 duration-150 ${
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
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {LEAGUE_TABS.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeagueId(l.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-all border active:scale-95 duration-150 ${
              selectedLeagueId === l.id
                ? "bg-sky-500/15 border-sky-500/40 text-sky-500 shadow-sm"
                : "border-border bg-slate-50/80 dark:bg-slate-900/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* Fixtures List */}
      <div className="flex flex-col gap-2">
        {filteredFixtures.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground font-sans text-xs">
            No fixtures match the selected filter.
          </div>
        ) : (
          filteredFixtures.map((f, idx) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border bg-slate-50/80 dark:bg-slate-900/60 shadow-sm hover:border-sky-500/40 transition-colors group relative overflow-hidden"
            >
              {/* Left: Status / Time */}
              <div className="flex flex-col gap-1 min-w-[60px]">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] w-max border ${
                  f.status === "FT" || f.status === "PEN"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : f.status === "LIVE" || f.status === "HT"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-500 animate-pulse"
                    : "border-slate-500/30 bg-slate-500/10 text-slate-500"
                }`}>
                  {f.status === "FT" ? "FT" : f.status === "PEN" ? "PEN" : "UPCOMING"}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold px-1">
                  {new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Middle: Teams & Score */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1 px-2">
                {/* Home */}
                <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-foreground font-heading truncate text-right">
                    {f.teams.home.name}
                  </span>
                  <div className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center">
                    <TeamLogo src={f.teams.home.logo} teamName={f.teams.home.name} />
                  </div>
                </div>

                {/* Score / VS */}
                <div className="flex items-center justify-center w-14 sm:w-20 shrink-0">
                  {f.status === "FT" || f.status === "PEN" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm font-black text-emerald-500 font-heading">{f.goals.home}</span>
                      <span className="text-xs font-bold text-emerald-500/50">-</span>
                      <span className="text-sm font-black text-emerald-500 font-heading">{f.goals.away}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      VS
                    </span>
                  )}
                </div>

                {/* Away */}
                <div className="flex items-center justify-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center">
                    <TeamLogo src={f.teams.away.logo} teamName={f.teams.away.name} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground font-heading truncate text-left">
                    {f.teams.away.name}
                  </span>
                </div>
              </div>

              {/* Right: Round Info */}
              <div className="hidden sm:flex flex-col items-end min-w-[60px]">
                <span className="text-[10px] text-muted-foreground font-sans truncate max-w-[80px]">
                  {f.round}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
