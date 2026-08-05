"use client";

import Link from "next/link";
import { Trophy, Crown, Flame, Medal, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_WIDGET_LEADERBOARD = [
  { rank: 1, name: "Akinola Emmanuel", points: 1250, streak: 5, accuracy: "84%" },
  { rank: 2, name: "David Beckham", points: 1120, streak: 4, accuracy: "79%" },
  { rank: 3, name: "Marcus Rashford", points: 980, streak: 3, accuracy: "74%" },
  { rank: 4, name: "Bukayo Saka", points: 910, streak: 2, accuracy: "71%" },
  { rank: 5, name: "Cole Palmer", points: 840, streak: 1, accuracy: "68%" },
];

export function GlobalLeaderboardWidget() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-elevation-dark-1">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-500/10 text-crown border border-yellow-500/20">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Global Leaderboard</h3>
            <p className="text-[11px] text-slate-400 font-mono">TOP PREDICTOR STANDINGS</p>
          </div>
        </div>

        <Link
          href="/table"
          className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
        >
          Full Table <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Ranks Listing */}
      <div className="divide-y divide-slate-800 font-mono text-xs">
        {MOCK_WIDGET_LEADERBOARD.map((row) => (
          <div
            key={row.rank}
            className={`flex items-center justify-between py-3 transition-colors ${
              row.rank === 1 ? "text-crown" : "text-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-6 justify-center">
                {row.rank === 1 && <Crown className="h-4 w-4 text-crown" />}
                {row.rank === 2 && <Medal className="h-3.5 w-3.5 text-slate-300" />}
                {row.rank === 3 && <Medal className="h-3.5 w-3.5 text-amber-600" />}
                {row.rank > 3 && <span className="text-slate-500 font-bold">#{row.rank}</span>}
              </div>

              <span className="font-bold text-white font-sans text-sm truncate max-w-[130px] sm:max-w-[160px]">
                {row.name}
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400" />
                {row.streak}
              </span>
              <span className="font-black text-white text-sm">
                {row.points} <span className="text-[10px] text-slate-400">PTS</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
