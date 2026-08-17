"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Trophy, Shield, Search } from "lucide-react";

type MockResult = {
  id: string;
  fixture: string;
  score: string;
  homeCode: string;
  awayCode: string;
  status: "settled" | "live" | "sealed";
  date: string;
  leagueName: string;
  pointsEarned: number;
  picks: {
    market: string;
    pick: string;
    actual: string;
    points: number;
    outcome: "correct" | "incorrect" | "partial";
  }[];
};

const MOCK_RESULTS: MockResult[] = [
  {
    id: "RES-GW02-01",
    fixture: "Arsenal vs Chelsea",
    score: "2 - 1",
    homeCode: "ARS",
    awayCode: "CHE",
    status: "settled",
    date: "Aug 15, 2026",
    leagueName: "Premier Predictors",
    pointsEarned: 7,
    picks: [
      { market: "Match Result", pick: "Arsenal", actual: "Arsenal", points: 2, outcome: "correct" },
      { market: "Exact Score", pick: "2 - 1", actual: "2 - 1", points: 5, outcome: "correct" },
      { market: "Both Teams To Score", pick: "No", actual: "Yes", points: 0, outcome: "incorrect" },
      { market: "Total Goals (2.5)", pick: "Over", actual: "Over (3)", points: 1, outcome: "correct" },
    ],
  },
  {
    id: "RES-GW02-02",
    fixture: "Liverpool vs Man City",
    score: "1 - 1",
    homeCode: "LIV",
    awayCode: "MCI",
    status: "settled",
    date: "Aug 15, 2026",
    leagueName: "Premier Predictors",
    pointsEarned: 2,
    picks: [
      { market: "Match Result", pick: "Draw", actual: "Draw", points: 2, outcome: "correct" },
      { market: "Exact Score", pick: "2 - 2", actual: "1 - 1", points: 0, outcome: "incorrect" },
      { market: "Both Teams To Score", pick: "Yes", actual: "Yes", points: 1, outcome: "correct" },
    ],
  },
  {
    id: "RES-GW02-03",
    fixture: "Real Madrid vs Barcelona",
    score: "vs",
    homeCode: "RMA",
    awayCode: "FCB",
    status: "sealed",
    date: "Tonight 20:00",
    leagueName: "Champions League Elite",
    pointsEarned: 0,
    picks: [
      { market: "Match Result", pick: "Real Madrid", actual: "Pending kickoff", points: 0, outcome: "partial" },
      { market: "Exact Score", pick: "3 - 1", actual: "Pending kickoff", points: 0, outcome: "partial" },
    ],
  },
];

export default function ResultsPage() {
  const [filter, setFilter] = useState<"all" | "settled" | "sealed">("all");

  const filtered = MOCK_RESULTS.filter((r) => {
    if (filter === "settled" && r.status !== "settled") return false;
    if (filter === "sealed" && r.status !== "sealed") return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-0 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight font-heading"
            style={{ color: "var(--text-primary)" }}
          >
            Fixture Results
          </h1>
          <p
            className="mt-1 text-xs sm:text-sm font-sans"
            style={{ color: "var(--text-secondary)" }}
          >
            Settled outcomes, points earned, and prediction disclosures
          </p>
        </div>

        {/* Filter Pills */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: "var(--surface-subtle)",
            border: "1px solid var(--surface-border)",
          }}
        >
          {(["all", "settled", "sealed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-heading uppercase transition-all duration-150 active:scale-95"
              style={{
                background: filter === tab ? "var(--surface-card)" : "transparent",
                color: filter === tab ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: filter === tab ? "var(--elev-1)" : "none",
              }}
            >
              {tab === "all" ? "All" : tab === "settled" ? "Settled" : "Sealed"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Cards List ── */}
      <div className="grid gap-4 sm:gap-5">
        {filtered.map((item) => {
          const isSettled = item.status === "settled";

          return (
            <div
              key={item.id}
              className="rounded-2xl p-5 sm:p-6 transition-all"
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--surface-border)",
                boxShadow: "var(--elev-1)",
              }}
            >
              {/* Card Header: League + Status + Points */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--surface-border)]">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold font-heading"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.leagueName}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span
                    className="text-xs font-sans"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSettled ? (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-heading"
                      style={{
                        background: "var(--success-surface)",
                        color: "var(--prediction-correct)",
                        border: "1px solid var(--success-border)",
                      }}
                    >
                      +{item.pointsEarned} PTS
                    </span>
                  ) : (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-heading"
                      style={{
                        background: "var(--warn-surface)",
                        color: "var(--state-provisional)",
                        border: "1px solid var(--warn-border)",
                      }}
                    >
                      Sealed
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score Display */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 flex items-center justify-center font-bold text-xs font-heading shrink-0"
                    style={{
                      clipPath: "var(--crest-clip)",
                      background: "var(--tf-navy-800)",
                      color: "var(--tf-white)",
                    }}
                  >
                    {item.homeCode}
                  </div>
                  <span
                    className="font-bold text-sm sm:text-base font-heading"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.fixture.split("vs")[0].trim()}
                  </span>
                </div>

                <div
                  className="font-mono font-black text-lg sm:text-xl px-3 py-1 rounded-lg"
                  style={{
                    background: "var(--surface-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.score}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="font-bold text-sm sm:text-base font-heading text-right"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.fixture.split("vs")[1]?.trim()}
                  </span>
                  <div
                    className="h-8 w-8 flex items-center justify-center font-bold text-xs font-heading shrink-0"
                    style={{
                      clipPath: "var(--crest-clip)",
                      background: "var(--tf-blue-700)",
                      color: "var(--tf-white)",
                    }}
                  >
                    {item.awayCode}
                  </div>
                </div>
              </div>

              {/* Prediction Picks Ledger */}
              <div
                className="mt-2 rounded-xl overflow-hidden text-xs"
                style={{
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="divide-y divide-[var(--surface-border)]">
                  {item.picks.map((pick, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold font-heading"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {pick.market}:
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {pick.pick}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="text-[11px] font-sans"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {pick.actual}
                        </span>
                        <span
                          className="font-bold font-heading text-[11px] tabular-nums"
                          style={{
                            color:
                              pick.outcome === "correct"
                                ? "var(--prediction-correct)"
                                : pick.outcome === "incorrect"
                                ? "var(--prediction-incorrect)"
                                : "var(--prediction-partial)",
                          }}
                        >
                          {pick.outcome === "correct" ? `+${pick.points} pts` : pick.outcome === "incorrect" ? "0 pts" : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
