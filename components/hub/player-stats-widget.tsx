"use client";

import { useState } from "react";
import { Flame, Target, Sparkles } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";

const PLAYER_STATS_DATA: Record<number, {
  name: string;
  flag: string;
  topScorers: Array<{ rank: number; player: string; team: string; logo: string; goals: number }>;
  topAssists: Array<{ rank: number; player: string; team: string; logo: string; assists: number }>;
}> = {
  39: {
    name: "Premier League",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
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
  2: {
    name: "Champions League",
    flag: "🇪🇺",
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
  140: {
    name: "La Liga",
    flag: "🇪🇸",
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

export function PlayerStatsWidget() {
  const [activeLeagueId, setActiveLeagueId] = useState<number>(39);
  const [statsTab, setStatsTab] = useState<"scorers" | "assists">("scorers");
  const currentData = PLAYER_STATS_DATA[activeLeagueId] || PLAYER_STATS_DATA[39];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-elevation-dark-1">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground font-heading">Top Performers & Stats</h3>
            <p className="text-[11px] text-muted-foreground font-mono">GOALSCORERS & PLAYMAKERS</p>
          </div>
        </div>

        {/* Goals / Assists Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setStatsTab("scorers")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 duration-150 active:scale-95 ${
              statsTab === "scorers"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            TOP GOALS
          </button>
          <button
            onClick={() => setStatsTab("assists")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 duration-150 active:scale-95 ${
              statsTab === "assists"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            TOP ASSISTS
          </button>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(PLAYER_STATS_DATA).map(([idStr, data]) => {
          const id = Number(idStr);
          return (
            <button
              key={id}
              onClick={() => setActiveLeagueId(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border duration-150 ease-out active:scale-95 ${
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

      {/* Stats Table List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 text-xs font-bold text-foreground border-b border-border/60">
          <span className="font-heading uppercase tracking-wide">
            {currentData.flag} {currentData.name} — {statsTab === "scorers" ? "Top Goalscorers" : "Top Assist Providers"}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono font-normal">SEASON 2025</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs divide-y divide-border/40 pt-1">
          {statsTab === "scorers"
            ? currentData.topScorers.map((s) => (
                <div key={s.rank} className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground border border-border">
                      #{s.rank}
                    </span>
                    <TeamLogo src={s.logo} teamName={s.team} size={22} />
                    <div>
                      <p className="font-bold text-foreground font-sans text-sm truncate max-w-[160px] sm:max-w-[220px]">{s.player}</p>
                      <p className="text-[11px] text-muted-foreground">{s.team}</p>
                    </div>
                  </div>
                  <span className="font-black text-amber-400 text-base bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    {s.goals} <span className="text-xs text-muted-foreground font-normal">GOALS</span>
                  </span>
                </div>
              ))
            : currentData.topAssists.map((a) => (
                <div key={a.rank} className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground border border-border">
                      #{a.rank}
                    </span>
                    <TeamLogo src={a.logo} teamName={a.team} size={22} />
                    <div>
                      <p className="font-bold text-foreground font-sans text-xs truncate max-w-[160px] sm:max-w-[220px]">{a.player}</p>
                      <p className="text-[11px] text-muted-foreground">{a.team}</p>
                    </div>
                  </div>
                  <span className="font-black text-sky-400 text-base bg-sky-500/10 px-3 py-1 rounded-xl border border-sky-500/20">
                    {a.assists} <span className="text-xs text-muted-foreground font-normal">ASSISTS</span>
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
