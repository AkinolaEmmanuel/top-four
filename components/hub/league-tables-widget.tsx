"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Flame, Target, Sparkles } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";

const LEAGUE_STANDINGS_DATA: Record<number, {
  name: string;
  flag: string;
  table: Array<{ rank: number; team: string; logo: string; p: number; w: number; d: number; l: number; gd: string; pts: number }>;
  topScorers: Array<{ rank: number; player: string; team: string; logo: string; goals: number }>;
  topAssists: Array<{ rank: number; player: string; team: string; logo: string; assists: number }>;
}> = {
  39: {
    name: "Premier League",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    table: [
      { rank: 1, team: "Arsenal", logo: "/football/teams/1.svg", p: 24, w: 18, d: 4, l: 2, gd: "+34", pts: 58 },
      { rank: 2, team: "Manchester City", logo: "/football/teams/2.svg", p: 24, w: 17, d: 5, l: 2, gd: "+31", pts: 56 },
      { rank: 3, team: "Liverpool", logo: "/football/teams/3.svg", p: 24, w: 16, d: 5, l: 3, gd: "+28", pts: 53 },
      { rank: 4, team: "Chelsea", logo: "/football/teams/4.svg", p: 24, w: 13, d: 6, l: 5, gd: "+16", pts: 45 },
      { rank: 5, team: "Tottenham Hotspur", logo: "/football/teams/5.svg", p: 24, w: 12, d: 5, l: 7, gd: "+10", pts: 41 },
      { rank: 6, team: "Aston Villa", logo: "/football/teams/8.svg", p: 24, w: 12, d: 4, l: 8, gd: "+8", pts: 40 },
    ],
    topScorers: [
      { rank: 1, player: "Erling Haaland", team: "Man City", logo: "/football/teams/2.svg", goals: 19 },
      { rank: 2, player: "Mohamed Salah", team: "Liverpool", logo: "/football/teams/3.svg", goals: 16 },
      { rank: 3, player: "Cole Palmer", team: "Chelsea", logo: "/football/teams/4.svg", goals: 14 },
      { rank: 4, player: "Bukayo Saka", team: "Arsenal", logo: "/football/teams/1.svg", goals: 12 },
      { rank: 5, player: "Alexander Isak", team: "Newcastle", logo: "/football/teams/7.svg", goals: 11 },
    ],
    topAssists: [
      { rank: 1, player: "Bukayo Saka", team: "Arsenal", logo: "/football/teams/1.svg", assists: 11 },
      { rank: 2, player: "Kevin De Bruyne", team: "Man City", logo: "/football/teams/2.svg", assists: 10 },
      { rank: 3, player: "Cole Palmer", team: "Chelsea", logo: "/football/teams/4.svg", assists: 9 },
      { rank: 4, player: "Martin Ødegaard", team: "Arsenal", logo: "/football/teams/1.svg", assists: 8 },
      { rank: 5, player: "Trent Alexander-Arnold", team: "Liverpool", logo: "/football/teams/3.svg", assists: 8 },
    ],
  },
  140: {
    name: "La Liga",
    flag: "🇪🇸",
    table: [
      { rank: 1, team: "Real Madrid", logo: "/football/teams/20.svg", p: 23, w: 19, d: 3, l: 1, gd: "+38", pts: 60 },
      { rank: 2, team: "Barcelona", logo: "/football/teams/21.svg", p: 23, w: 18, d: 2, l: 3, gd: "+35", pts: 56 },
      { rank: 3, team: "Atlético Madrid", logo: "/football/teams/22.svg", p: 23, w: 14, d: 6, l: 3, gd: "+22", pts: 48 },
      { rank: 4, team: "Sevilla", logo: "/football/teams/23.svg", p: 23, w: 11, d: 5, l: 7, gd: "+9", pts: 38 },
    ],
    topScorers: [
      { rank: 1, player: "Robert Lewandowski", team: "Barcelona", logo: "/football/teams/21.svg", goals: 18 },
      { rank: 2, player: "Kylian Mbappé", team: "Real Madrid", logo: "/football/teams/20.svg", goals: 17 },
      { rank: 3, player: "Vinícius Júnior", team: "Real Madrid", logo: "/football/teams/20.svg", goals: 13 },
      { rank: 4, player: "Antoine Griezmann", team: "Atlético Madrid", logo: "/football/teams/22.svg", goals: 11 },
    ],
    topAssists: [
      { rank: 1, player: "Lamine Yamal", team: "Barcelona", logo: "/football/teams/21.svg", assists: 12 },
      { rank: 2, player: "Vinícius Júnior", team: "Real Madrid", logo: "/football/teams/20.svg", assists: 9 },
      { rank: 3, player: "Raphinha", team: "Barcelona", logo: "/football/teams/21.svg", assists: 8 },
      { rank: 4, player: "Jude Bellingham", team: "Real Madrid", logo: "/football/teams/20.svg", assists: 7 },
    ],
  },
  135: {
    name: "Serie A",
    flag: "🇮🇹",
    table: [
      { rank: 1, team: "Inter Milan", logo: "/football/teams/30.svg", p: 23, w: 18, d: 4, l: 1, gd: "+39", pts: 58 },
      { rank: 2, team: "AC Milan", logo: "/football/teams/31.svg", p: 23, w: 16, d: 4, l: 3, gd: "+24", pts: 52 },
      { rank: 3, team: "Juventus", logo: "/football/teams/32.svg", p: 23, w: 14, d: 7, l: 2, gd: "+20", pts: 49 },
      { rank: 4, team: "Napoli", logo: "/football/teams/33.svg", p: 23, w: 13, d: 5, l: 5, gd: "+15", pts: 44 },
    ],
    topScorers: [
      { rank: 1, player: "Lautaro Martínez", team: "Inter Milan", logo: "/football/teams/30.svg", goals: 17 },
      { rank: 2, player: "Dušan Vlahović", team: "Juventus", logo: "/football/teams/32.svg", goals: 14 },
      { rank: 3, player: "Marcus Thuram", team: "Inter Milan", logo: "/football/teams/30.svg", goals: 12 },
      { rank: 4, player: "Rafael Leão", team: "AC Milan", logo: "/football/teams/31.svg", goals: 10 },
    ],
    topAssists: [
      { rank: 1, player: "Federico Dimarco", team: "Inter Milan", logo: "/football/teams/30.svg", assists: 9 },
      { rank: 2, player: "Rafael Leão", team: "AC Milan", logo: "/football/teams/31.svg", assists: 8 },
      { rank: 3, player: "Khvicha Kvaratskhelia", team: "Napoli", logo: "/football/teams/33.svg", assists: 7 },
      { rank: 4, player: "Hakan Çalhanoğlu", team: "Inter Milan", logo: "/football/teams/30.svg", assists: 7 },
    ],
  },
  78: {
    name: "Bundesliga",
    flag: "🇩🇪",
    table: [
      { rank: 1, team: "Bayern Munich", logo: "/football/teams/40.svg", p: 21, w: 16, d: 3, l: 2, gd: "+41", pts: 51 },
      { rank: 2, team: "Bayer Leverkusen", logo: "/football/teams/43.svg", p: 21, w: 15, d: 4, l: 2, gd: "+32", pts: 49 },
      { rank: 3, team: "Borussia Dortmund", logo: "/football/teams/41.svg", p: 21, w: 13, d: 5, l: 3, gd: "+21", pts: 44 },
      { rank: 4, team: "RB Leipzig", logo: "/football/teams/42.svg", p: 21, w: 12, d: 4, l: 5, gd: "+18", pts: 40 },
    ],
    topScorers: [
      { rank: 1, player: "Harry Kane", team: "Bayern Munich", logo: "/football/teams/40.svg", goals: 21 },
      { rank: 2, player: "Florian Wirtz", team: "Bayer Leverkusen", logo: "/football/teams/43.svg", goals: 13 },
      { rank: 3, player: "Serhou Guirassy", team: "Dortmund", logo: "/football/teams/41.svg", goals: 12 },
      { rank: 4, player: "Loïs Openda", team: "RB Leipzig", logo: "/football/teams/42.svg", goals: 11 },
    ],
    topAssists: [
      { rank: 1, player: "Florian Wirtz", team: "Bayer Leverkusen", logo: "/football/teams/43.svg", assists: 11 },
      { rank: 2, player: "Michael Olise", team: "Bayern Munich", logo: "/football/teams/40.svg", assists: 9 },
      { rank: 3, player: "Jamal Musiala", team: "Bayern Munich", logo: "/football/teams/40.svg", assists: 8 },
      { rank: 4, player: "Xavi Simons", team: "RB Leipzig", logo: "/football/teams/42.svg", assists: 7 },
    ],
  },
  61: {
    name: "Ligue 1",
    flag: "🇫🇷",
    table: [
      { rank: 1, team: "Paris Saint-Germain", logo: "/football/teams/50.svg", p: 22, w: 16, d: 5, l: 1, gd: "+36", pts: 53 },
      { rank: 2, team: "Monaco", logo: "/football/teams/52.svg", p: 22, w: 13, d: 5, l: 4, gd: "+19", pts: 44 },
      { rank: 3, team: "Marseille", logo: "/football/teams/51.svg", p: 22, w: 12, d: 4, l: 6, gd: "+14", pts: 40 },
      { rank: 4, team: "Lyon", logo: "/football/teams/53.svg", p: 22, w: 11, d: 4, l: 7, gd: "+8", pts: 37 },
    ],
    topScorers: [
      { rank: 1, player: "Bradley Barcola", team: "PSG", logo: "/football/teams/50.svg", goals: 12 },
      { rank: 2, player: "Jonathan David", team: "Lille", logo: "/football/teams/50.svg", goals: 11 },
      { rank: 3, player: "Mason Greenwood", team: "Marseille", logo: "/football/teams/51.svg", goals: 10 },
      { rank: 4, player: "Ousmane Dembélé", team: "PSG", logo: "/football/teams/50.svg", goals: 8 },
    ],
    topAssists: [
      { rank: 1, player: "Ousmane Dembélé", team: "PSG", logo: "/football/teams/50.svg", assists: 9 },
      { rank: 2, player: "Achraf Hakimi", team: "PSG", logo: "/football/teams/50.svg", assists: 7 },
      { rank: 3, player: "Takumi Minamino", team: "Monaco", logo: "/football/teams/52.svg", assists: 6 },
      { rank: 4, player: "Rayan Cherki", team: "Lyon", logo: "/football/teams/53.svg", assists: 5 },
    ],
  },
  2: {
    name: "Champions League",
    flag: "🇪🇺",
    table: [
      { rank: 1, team: "Liverpool", logo: "/football/teams/3.svg", p: 8, w: 8, d: 0, l: 0, gd: "+16", pts: 24 },
      { rank: 2, team: "Barcelona", logo: "/football/teams/21.svg", p: 8, w: 6, d: 1, l: 1, gd: "+14", pts: 19 },
      { rank: 3, team: "Arsenal", logo: "/football/teams/1.svg", p: 8, w: 6, d: 1, l: 1, gd: "+11", pts: 19 },
      { rank: 4, team: "Inter Milan", logo: "/football/teams/30.svg", p: 8, w: 6, d: 1, l: 1, gd: "+10", pts: 19 },
    ],
    topScorers: [
      { rank: 1, player: "Raphinha", team: "Barcelona", logo: "/football/teams/21.svg", goals: 8 },
      { rank: 2, player: "Robert Lewandowski", team: "Barcelona", logo: "/football/teams/21.svg", goals: 7 },
      { rank: 3, player: "Harry Kane", team: "Bayern Munich", logo: "/football/teams/40.svg", goals: 6 },
      { rank: 4, player: "Vinícius Júnior", team: "Real Madrid", logo: "/football/teams/20.svg", goals: 5 },
    ],
    topAssists: [
      { rank: 1, player: "Lamine Yamal", team: "Barcelona", logo: "/football/teams/21.svg", assists: 6 },
      { rank: 2, player: "Raphinha", team: "Barcelona", logo: "/football/teams/21.svg", assists: 5 },
      { rank: 3, player: "Mohamed Salah", team: "Liverpool", logo: "/football/teams/3.svg", assists: 4 },
      { rank: 4, player: "Bukayo Saka", team: "Arsenal", logo: "/football/teams/1.svg", assists: 4 },
    ],
  },
};

export function LeagueTablesWidget() {
  const [activeLeagueId, setActiveLeagueId] = useState<number>(39);
  const [viewMode, setViewMode] = useState<"standings" | "scorers" | "assists">("standings");
  const currentData = LEAGUE_STANDINGS_DATA[activeLeagueId] || LEAGUE_STANDINGS_DATA[39];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-elevation-dark-1">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground font-heading">Official League Hub & Stats</h3>
            <p className="text-[11px] text-muted-foreground font-mono">STANDINGS, TOP SCORERS & ASSISTS</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setViewMode("standings")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === "standings"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            TABLE
          </button>
          <button
            onClick={() => setViewMode("scorers")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              viewMode === "scorers"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3 w-3 text-amber-400" />
            GOALS
          </button>
          <button
            onClick={() => setViewMode("assists")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              viewMode === "assists"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3 w-3 text-sky-400" />
            ASSISTS
          </button>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(LEAGUE_STANDINGS_DATA).map(([idStr, data]) => {
          const id = Number(idStr);
          return (
            <button
              key={id}
              onClick={() => setActiveLeagueId(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                activeLeagueId === id
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-500 shadow-sm"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span>{data.flag}</span>
              <span>{data.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Display Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Table View (8 Cols on Wide Screen or Full Width) */}
        <div className={viewMode === "standings" ? "lg:col-span-12" : "lg:col-span-7"}>
          {viewMode === "standings" || viewMode === "scorers" || viewMode === "assists" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{currentData.flag} {currentData.name} — Standings</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-[10px] uppercase">
                      <th className="pb-2 pl-2 w-8 text-center">POS</th>
                      <th className="pb-2 font-sans font-bold">CLUB</th>
                      <th className="pb-2 text-center w-8">P</th>
                      <th className="pb-2 text-center w-8">W</th>
                      <th className="pb-2 text-center w-8">D</th>
                      <th className="pb-2 text-center w-8">L</th>
                      <th className="pb-2 text-center w-10">GD</th>
                      <th className="pb-2 pr-2 text-right w-12 font-bold text-foreground">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {currentData.table.map((row) => (
                      <tr key={row.rank} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-2.5 pl-2 text-center font-bold">
                          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${
                            row.rank <= 4
                              ? "bg-sky-500/15 text-sky-500 font-black border border-sky-500/30"
                              : "text-muted-foreground"
                          }`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <TeamLogo src={row.logo} teamName={row.team} size={20} />
                            <span className="truncate max-w-[130px] sm:max-w-[170px]">{row.team}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-muted-foreground">{row.p}</td>
                        <td className="py-2.5 text-center text-emerald-400 font-bold">{row.w}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{row.d}</td>
                        <td className="py-2.5 text-center text-destructive">{row.l}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{row.gd}</td>
                        <td className="py-2.5 pr-2 text-right font-black text-foreground text-sm">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Top Scorers or Assists Sidebar Table (5 Cols) */}
        {viewMode !== "standings" && (
          <div className="lg:col-span-5 rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground font-heading uppercase flex items-center gap-1.5">
                {viewMode === "scorers" ? (
                  <>
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    Top Scorers (Goals)
                  </>
                ) : (
                  <>
                    <Target className="h-3.5 w-3.5 text-sky-400" />
                    Top Assists Leaderboard
                  </>
                )}
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">SEASON 2025</span>
            </div>

            <div className="space-y-2 font-mono text-xs divide-y divide-border/40">
              {viewMode === "scorers"
                ? currentData.topScorers.map((s) => (
                    <div key={s.rank} className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-4 text-center">#{s.rank}</span>
                        <TeamLogo src={s.logo} teamName={s.team} size={18} />
                        <div>
                          <p className="font-bold text-foreground font-sans text-xs truncate max-w-[110px]">{s.player}</p>
                          <p className="text-[10px] text-muted-foreground">{s.team}</p>
                        </div>
                      </div>
                      <span className="font-black text-amber-400 text-sm">{s.goals} <span className="text-[10px] text-muted-foreground">G</span></span>
                    </div>
                  ))
                : currentData.topAssists.map((a) => (
                    <div key={a.rank} className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-4 text-center">#{a.rank}</span>
                        <TeamLogo src={a.logo} teamName={a.team} size={18} />
                        <div>
                          <p className="font-bold text-foreground font-sans text-xs truncate max-w-[110px]">{a.player}</p>
                          <p className="text-[10px] text-muted-foreground">{a.team}</p>
                        </div>
                      </div>
                      <span className="font-black text-sky-400 text-sm">{a.assists} <span className="text-[10px] text-muted-foreground">A</span></span>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
