"use client";

import { useState } from "react";
import { CollectibleReceiptTicket, TicketPick, TicketStatus } from "@/components/gamification/CollectibleReceiptTicket";
import { Receipt, Trophy, Calendar, CheckCircle2, Clock, Search, ShieldCheck, Flame, Medal, Award, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MockReceipt = {
  id: string;
  gameweek: string;
  status: TicketStatus;
  date: string;
  roomName: string;
  pointsEarned: number;
  picks: TicketPick[];
};

type SeasonOutright = {
  id: string;
  category: "League Champion" | "Top 4 Finisher" | "Golden Boot Winner" | "Golden Glove" | "Relegation Pick";
  pick: string;
  competition: string;
  potentialPoints: number;
  status: "locked" | "settled";
  lockedDate: string;
};

const MOCK_RECEIPTS: MockReceipt[] = [
  {
    id: "RCPT-2026-GW02-089",
    gameweek: "Gameweek 2",
    status: "locked",
    date: "August 4, 2026",
    roomName: "Global Standings",
    pointsEarned: 0,
    picks: [
      {
        fixtureId: 1,
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        pickType: "match_result",
        value: { market: "match_result", pick: "home" },
        points: 2,
      },
      {
        fixtureId: 2,
        homeTeam: "Liverpool",
        awayTeam: "Man City",
        pickType: "exact_score",
        value: { market: "exact_score", home: 2, away: 1 },
        points: 5,
      },
      {
        fixtureId: 3,
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        pickType: "btts",
        value: { market: "btts", pick: "yes" },
        points: 1,
      },
      {
        fixtureId: 4,
        homeTeam: "Bayern Munich",
        awayTeam: "Dortmund",
        pickType: "anytime_scorer",
        value: { market: "anytime_scorer", player: "Harry Kane" },
        points: 5,
      },
    ],
  },
  {
    id: "RCPT-2026-GW01-042",
    gameweek: "Gameweek 1",
    status: "settled",
    date: "July 28, 2026",
    roomName: "Premier League Pundits",
    pointsEarned: 14,
    picks: [
      {
        fixtureId: 10,
        homeTeam: "Arsenal",
        awayTeam: "Wolves",
        pickType: "match_result",
        value: { market: "match_result", pick: "home" },
        points: 2,
      },
      {
        fixtureId: 11,
        homeTeam: "Chelsea",
        awayTeam: "Man City",
        pickType: "exact_score",
        value: { market: "exact_score", home: 0, away: 2 },
        points: 5,
      },
      {
        fixtureId: 12,
        homeTeam: "Ipswich Town",
        awayTeam: "Liverpool",
        pickType: "total_goals",
        value: { market: "total_goals", pick: "over" },
        points: 1,
      },
      {
        fixtureId: 13,
        homeTeam: "Man Utd",
        awayTeam: "Fulham",
        pickType: "player_card",
        value: { market: "player_card", player: "Casemiro" },
        points: 4,
      },
    ],
  },
  {
    id: "RCPT-2026-GW00-007",
    gameweek: "Gameweek 1 (UCL)",
    status: "settled",
    date: "July 21, 2026",
    roomName: "Champions League Elite",
    pointsEarned: 12,
    picks: [
      {
        fixtureId: 20,
        homeTeam: "Real Madrid",
        awayTeam: "Stuttgart",
        pickType: "match_result",
        value: { market: "match_result", pick: "home" },
        points: 2,
      },
      {
        fixtureId: 21,
        homeTeam: "AC Milan",
        awayTeam: "Liverpool",
        pickType: "btts",
        value: { market: "btts", pick: "yes" },
        points: 1,
      },
      {
        fixtureId: 22,
        homeTeam: "Bayern Munich",
        awayTeam: "Dinamo Zagreb",
        pickType: "anytime_scorer",
        value: { market: "anytime_scorer", player: "Harry Kane" },
        points: 5,
      },
    ],
  },
];

const MOCK_SEASON_OUTRIGHTS: SeasonOutright[] = [
  {
    id: "OUT-PL-01",
    category: "League Champion",
    pick: "Arsenal",
    competition: "English Premier League 2026/27",
    potentialPoints: 100,
    status: "locked",
    lockedDate: "August 1, 2026",
  },
  {
    id: "OUT-PL-02",
    category: "Top 4 Finisher",
    pick: "Arsenal, Manchester City, Liverpool, Chelsea",
    competition: "English Premier League 2026/27",
    potentialPoints: 50,
    status: "locked",
    lockedDate: "August 1, 2026",
  },
  {
    id: "OUT-PL-03",
    category: "Golden Boot Winner",
    pick: "Erling Haaland (Manchester City)",
    competition: "English Premier League 2026/27",
    potentialPoints: 30,
    status: "locked",
    lockedDate: "August 1, 2026",
  },
  {
    id: "OUT-PL-04",
    category: "Golden Glove",
    pick: "David Raya (Arsenal)",
    competition: "English Premier League 2026/27",
    potentialPoints: 25,
    status: "locked",
    lockedDate: "August 1, 2026",
  },
  {
    id: "OUT-PL-05",
    category: "Relegation Pick",
    pick: "Southampton, Ipswich Town, Leicester City",
    competition: "English Premier League 2026/27",
    potentialPoints: 40,
    status: "locked",
    lockedDate: "August 1, 2026",
  },
];

export default function ReceiptsPage() {
  const [activeTab, setActiveTab] = useState<"receipts" | "outrights" | "history">("receipts");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "settled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReceipts = MOCK_RECEIPTS.filter((r) => {
    if (statusFilter === "active" && r.status !== "locked" && r.status !== "draft") return false;
    if (statusFilter === "settled" && r.status !== "settled") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPick = r.picks.some((p) => p.homeTeam.toLowerCase().includes(q) || p.awayTeam.toLowerCase().includes(q));
      const matchRoom = r.roomName.toLowerCase().includes(q);
      const matchGw = r.gameweek.toLowerCase().includes(q);
      return matchPick || matchRoom || matchGw;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 py-6 sm:py-8 pb-24 sm:pb-8">
      
      {/* ── Top Header & Stats Summary ── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-sm shrink-0">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase font-heading">
                  My Prediction Receipts Vault
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground font-mono">
                  Your complete history of matchday tickets, pre-season outrights, and saved predictions.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none p-1 rounded-xl bg-secondary border border-border w-full md:w-auto -mx-1 px-1">
            <button
              onClick={() => setActiveTab("receipts")}
              className={`flex shrink-0 items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === "receipts"
                  ? "bg-sky-500 text-white shadow-glow-sky"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Matchday Slips ({MOCK_RECEIPTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("outrights")}
              className={`flex shrink-0 items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === "outrights"
                  ? "bg-sky-500 text-white shadow-glow-sky"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Season Outrights ({MOCK_SEASON_OUTRIGHTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex shrink-0 items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === "history"
                  ? "bg-sky-500 text-white shadow-glow-sky"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>History Log</span>
            </button>
          </div>
        </div>

        {/* HUD Quick Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold">TOTAL SLIPS PRINTED</p>
              <p className="text-base sm:text-xl font-extrabold text-foreground font-heading">14 RECEIPTS</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold">LIFETIME POINTS</p>
              <p className="text-base sm:text-xl font-extrabold text-emerald-500 font-heading">128 PTS</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/10 text-crown border border-amber-500/20 shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold">OUTRIGHTS</p>
              <p className="text-base sm:text-xl font-extrabold text-crown font-heading">5 LOCKED</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold">ACCURACY RATE</p>
              <p className="text-base sm:text-xl font-extrabold text-purple-500 font-heading">74.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: Gameweek Matchday Receipts ── */}
      {activeTab === "receipts" && (
        <div className="space-y-6">
          
          {/* Sub-Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search receipt by team, gameweek, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary pl-9 pr-4 py-2 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary border border-border w-full sm:w-auto text-center">
              {(["all", "active", "settled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all active:scale-95 duration-150 ${
                    statusFilter === f
                      ? "bg-sky-500 text-white shadow-glow-sky"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Thermal Receipt Cards Grid */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
            {filteredReceipts.map((rcpt) => (
              <div key={rcpt.id} className="space-y-2">
                <div className="flex items-center justify-between px-2 text-xs font-mono text-muted-foreground">
                  <span className="font-bold text-sky-500">{rcpt.gameweek}</span>
                  <span>{rcpt.roomName}</span>
                </div>

                <CollectibleReceiptTicket
                  ticketNumber={rcpt.id}
                  picks={rcpt.picks}
                  status={rcpt.status}
                  settledPointsEarned={rcpt.pointsEarned}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: Season Outrights (Pre-Season Predictions) ── */}
      {activeTab === "outrights" && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card shadow-sm dark:shadow-elevation-dark-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-foreground uppercase font-heading flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-crown" />
                  Season Outrights & Pre-Season Picks
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Predictions locked at the start of the 2026/27 season. Settled at season conclusion.
                </p>
              </div>

              <span className="text-[11px] sm:text-xs font-mono font-bold px-3 py-1 rounded-full bg-crown/10 text-crown border border-crown/30 self-start sm:self-auto">
                🔒 PRE-SEASON PICKS LOCKED
              </span>
            </div>

            <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_SEASON_OUTRIGHTS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-xl border border-border bg-slate-50/80 dark:bg-slate-900/60 hover:border-crown/40 transition-colors shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-crown flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      {item.category}
                    </span>
                    <span className="text-emerald-500 font-bold">+{item.potentialPoints} PTS</span>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-mono uppercase text-[10px]">YOUR LOCKED PICK</p>
                    <p className="text-xs sm:text-sm font-black text-foreground font-heading mt-0.5">{item.pick}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span>{item.competition}</span>
                    <span className="flex items-center gap-1 text-sky-500 font-bold">
                      <Clock className="h-3 w-3" />
                      Locked {item.lockedDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Saved Prediction History Log ── */}
      {activeTab === "history" && (
        <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card shadow-sm dark:shadow-elevation-dark-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-foreground uppercase font-heading flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-500" />
                Complete Saved Prediction History Log
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Chronological record of every individual prediction submitted across all rooms.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary pl-9 pr-4 py-1.5 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-slate-50/80 dark:bg-slate-900/60 p-1 shadow-sm">
            <table className="w-full min-w-[640px] text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                  <th className="py-3 px-3">Date / Gameweek</th>
                  <th className="py-3 px-3">Room / Group</th>
                  <th className="py-3 px-3">Fixture</th>
                  <th className="py-3 px-3">Market</th>
                  <th className="py-3 px-3">Your Prediction</th>
                  <th className="py-3 px-3 text-right">Points</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MOCK_RECEIPTS.flatMap((r) =>
                  r.picks.map((p, idx) => (
                    <tr key={`${r.id}-${idx}`} className="hover:bg-secondary/60 transition-colors">
                      <td className="py-3 px-3 text-foreground font-bold">{r.gameweek} ({r.date})</td>
                      <td className="py-3 px-3 text-muted-foreground">{r.roomName}</td>
                      <td className="py-3 px-3 font-bold text-foreground">{p.homeTeam} vs {p.awayTeam}</td>
                      <td className="py-3 px-3 text-sky-500 font-bold uppercase">{p.pickType.replace("_", " ")}</td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {p.pickType === "match_result" && `Winner: ${String((p.value as any).pick).toUpperCase()}`}
                        {p.pickType === "exact_score" && `Score: ${(p.value as any).home} - ${(p.value as any).away}`}
                        {p.pickType === "btts" && `BTTS: ${String((p.value as any).pick).toUpperCase()}`}
                        {p.pickType === "total_goals" && `Goals: ${String((p.value as any).pick).toUpperCase()}`}
                        {p.pickType === "anytime_scorer" && `Scorer: ${(p.value as any).player}`}
                        {p.pickType === "player_card" && `Card: ${(p.value as any).player}`}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-500">+{p.points} PTS</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "settled" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-sky-500/10 text-sky-500 border border-sky-500/30"}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
