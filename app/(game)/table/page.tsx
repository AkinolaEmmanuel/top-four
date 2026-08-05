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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-crown border border-yellow-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              Global Top Four Table
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
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
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-elevation-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">RANK</th>
                <th className="px-6 py-4">PREDICTOR</th>
                <th className="px-6 py-4 text-center">ACCURACY</th>
                <th className="px-6 py-4 text-center">STREAK</th>
                <th className="px-6 py-4 text-right">TOTAL POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {MOCK_LEADERBOARD.map((row) => (
                <tr
                  key={row.rank}
                  className={`transition-colors hover:bg-slate-800/50 ${
                    row.rank === 1 ? "bg-yellow-500/5" : row.rank <= 4 ? "bg-sky-500/5" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-bold">
                    <div className="flex items-center gap-2">
                      {row.rank === 1 && <Crown className="h-4 w-4 text-crown" />}
                      {row.rank === 2 && <Medal className="h-4 w-4 text-slate-300" />}
                      {row.rank === 3 && <Medal className="h-4 w-4 text-amber-600" />}
                      <span className={row.rank <= 4 ? "text-white font-black text-base" : "text-slate-500"}>
                        #{row.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white font-sans">
                    <div className="flex items-center gap-2.5">
                      <span>{row.name}</span>
                      {row.rank <= 4 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          TOP 4
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-emerald-400 font-bold">
                    {row.accuracy}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-amber-400">
                    <div className="inline-flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      {row.streak} 🔥
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-base font-black text-white">
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
