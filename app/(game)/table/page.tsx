"use client";

import { Trophy, Crown, Flame, Shield, Medal, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Akinola Emmanuel", points: 1250, streak: 5, accuracy: "84%", badge: "crown" as const },
  { rank: 2, name: "David Beckham", points: 1120, streak: 4, accuracy: "79%", badge: "sky" as const },
  { rank: 3, name: "Marcus Rashford", points: 980, streak: 3, accuracy: "74%", badge: "win" as const },
  { rank: 4, name: "Bukayo Saka", points: 910, streak: 2, accuracy: "71%", badge: "provisional" as const },
  { rank: 5, name: "Cole Palmer", points: 840, streak: 1, accuracy: "68%", badge: "participant" as const },
  { rank: 6, name: "Phil Foden", points: 790, streak: 0, accuracy: "64%", badge: "participant" as const },
];

export default function StandingsTablePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8 pb-24 sm:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-crown border border-amber-500/20 shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase font-heading">
              Global Top Four Table
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Current season predictor standings, top accuracy ranks, and streak titles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="crown" className="px-3 py-1 text-xs">
            <Crown className="h-3.5 w-3.5" />
            TOP FOUR LEAGUE
          </Badge>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm dark:shadow-elevation-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm text-foreground">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-4">RANK</th>
                <th className="px-4 sm:px-6 py-4 font-sans">PREDICTOR</th>
                <th className="px-4 sm:px-6 py-4 text-center">ACCURACY</th>
                <th className="px-4 sm:px-6 py-4 text-center">STREAK</th>
                <th className="px-4 sm:px-6 py-4 text-right">TOTAL POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {MOCK_LEADERBOARD.map((row) => (
                <tr
                  key={row.rank}
                  className={`transition-colors hover:bg-secondary/60 ${
                    row.rank === 1 ? "bg-amber-500/5" : row.rank <= 4 ? "bg-sky-500/5" : ""
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4 font-bold">
                    <div className="flex items-center gap-2">
                      {row.rank === 1 && <Crown className="h-4 w-4 text-crown" />}
                      {row.rank === 2 && <Medal className="h-4 w-4 text-slate-400" />}
                      {row.rank === 3 && <Medal className="h-4 w-4 text-amber-600" />}
                      <span className={row.rank <= 4 ? "text-foreground font-black text-base" : "text-muted-foreground"}>
                        #{row.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-bold text-foreground font-sans">
                    <div className="flex items-center gap-2.5">
                      <span>{row.name}</span>
                      {row.rank <= 4 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/30">
                          TOP 4
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center text-emerald-500 font-bold">
                    {row.accuracy}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center font-bold text-amber-500">
                    <div className="inline-flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      {row.streak} 🔥
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right text-base font-black text-foreground">
                    {row.points} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
