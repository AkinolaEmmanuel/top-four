"use client";

import { useState } from "react";
import { Crest } from "@/components/ui/crest";
import { ChevronLeft, Check, Lock, AlertCircle, X } from "lucide-react";

type FixtureTask = {
  id: string;
  when: "today" | "week" | "later";
  kind: "fixture" | "question";
  home: string;
  away: string;
  homeName: string;
  awayName: string;
  title: string;
  league: string;
  time: string;
  kickoff: string;
  missing: string;
  urgent?: boolean;
  markets: {
    match_result?: "home" | "draw" | "away";
    exact_score?: { home: number; away: number };
    btts?: "yes" | "no";
    total_goals?: "over" | "under";
    double_chance?: "1X" | "12" | "X2";
    anytime_scorer?: string;
  };
};

const INITIAL_TASKS: FixtureTask[] = [
  {
    id: "task-1",
    when: "today",
    kind: "fixture",
    home: "ARS",
    away: "CHE",
    homeName: "Arsenal",
    awayName: "Chelsea",
    title: "Arsenal v Chelsea",
    league: "Premier Predictors · 8 pts",
    time: "2h 15m",
    kickoff: "Today 16:30",
    missing: "4 of 6 missing",
    urgent: true,
    markets: {
      match_result: "home",
      exact_score: { home: 2, away: 1 },
    },
  },
  {
    id: "task-2",
    when: "today",
    kind: "fixture",
    home: "LIV",
    away: "TOT",
    homeName: "Liverpool",
    awayName: "Tottenham",
    title: "Liverpool v Spurs",
    league: "Premier Predictors · 8 pts",
    time: "4h 40m",
    kickoff: "Today 19:00",
    missing: "2 of 6 missing",
    urgent: false,
    markets: {
      match_result: "home",
      btts: "yes",
    },
  },
  {
    id: "task-3",
    when: "today",
    kind: "fixture",
    home: "MCI",
    away: "EVE",
    homeName: "Man City",
    awayName: "Everton",
    title: "Man City v Everton",
    league: "Office League · 6 pts",
    time: "6h 05m",
    kickoff: "Today 20:15",
    missing: "6 of 6 missing",
    urgent: false,
    markets: {},
  },
  {
    id: "task-4",
    when: "week",
    kind: "fixture",
    home: "MUN",
    away: "NEW",
    homeName: "Man Utd",
    awayName: "Newcastle",
    title: "Man Utd v Newcastle",
    league: "Office League · 6 pts",
    time: "Thu 16:30",
    kickoff: "Thu 16:30",
    missing: "4 of 6 missing",
    markets: {},
  },
  {
    id: "task-5",
    when: "later",
    kind: "fixture",
    home: "RMA",
    away: "MIL",
    homeName: "Real Madrid",
    awayName: "AC Milan",
    title: "Real Madrid v Milan",
    league: "Alumni League · 6 pts",
    time: "Sat 20:00",
    kickoff: "Sat 20:00",
    missing: "6 of 6 missing",
    markets: {},
  },
];

const GROUPS = [
  { key: "today", label: "LOCKING TODAY", note: "act on these first" },
  { key: "week", label: "THIS WEEK", note: "nothing locks before Thursday" },
  { key: "later", label: "LATER", note: "open, but no rush" },
] as const;

export function PredictView() {
  const [tasks, setTasks] = useState<FixtureTask[]>(INITIAL_TASKS);
  const [activeFixture, setActiveFixture] = useState<FixtureTask | null>(null);

  const totalOwed = tasks.reduce((acc, t) => {
    const answeredCount = Object.keys(t.markets).length;
    return acc + Math.max(0, 6 - answeredCount);
  }, 0);

  function handleUpdateMarket(marketKey: string, value: any) {
    if (!activeFixture) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeFixture.id) {
          const updatedMarkets = { ...t.markets, [marketKey]: value };
          const newActive = { ...t, markets: updatedMarkets };
          setActiveFixture(newActive);
          return newActive;
        }
        return t;
      })
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8 w-full min-w-0 font-sans">
      {/* ── QUEUE HEADER (Predict.dc.html) ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase font-heading block"
              style={{ color: "var(--text-muted)" }}
            >
              PREDICTION QUEUE
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span
                className="text-4xl sm:text-5xl font-black font-heading tabular-nums"
                style={{
                  color: totalOwed > 0 ? "var(--color-brand)" : "var(--prediction-correct)",
                }}
              >
                {totalOwed}
              </span>
              <div>
                <h1
                  className="text-sm sm:text-base font-bold font-heading"
                  style={{ color: "var(--text-primary)" }}
                >
                  {totalOwed > 0 ? "markets owed across fixtures" : "all markets completed"}
                </h1>
                <p
                  className="text-xs font-sans mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  One queue across all leagues, ordered by deadline
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUEUE LIST BY TIMELINE GROUPS ── */}
      <div className="space-y-5">
        {GROUPS.map((g) => {
          const groupTasks = tasks.filter((t) => t.when === g.key);
          if (groupTasks.length === 0) return null;

          return (
            <section key={g.key} className="space-y-2">
              <div className="flex items-baseline gap-2 px-1">
                <span
                  className="text-[10px] font-bold tracking-wider uppercase font-heading"
                  style={{
                    color: g.key === "today" ? "var(--danger-text)" : "var(--text-muted)",
                  }}
                >
                  {g.label}
                </span>
                <span
                  className="text-[11px] font-sans"
                  style={{ color: "var(--text-muted)" }}
                >
                  · {g.note}
                </span>
              </div>

              <div
                className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                  boxShadow: "var(--elev-1)",
                }}
              >
                {groupTasks.map((t) => {
                  const answeredCount = Object.keys(t.markets).length;
                  const isComplete = answeredCount >= 6;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveFixture(t)}
                      className="flex items-center gap-3.5 p-3.5 sm:p-4 hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer active:scale-[0.99]"
                      style={{
                        background: t.urgent ? "var(--accent-surface)" : undefined,
                        boxShadow: t.urgent ? "inset 3px 0 0 0 var(--color-brand)" : undefined,
                      }}
                    >
                      {/* Stacked Crests */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <Crest code={t.home} size="xs" />
                        <Crest code={t.away} size="xs" />
                      </div>

                      {/* Match & League */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-bold text-sm font-heading truncate flex items-center gap-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <span>{t.title}</span>
                          {isComplete && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-heading bg-emerald-500/10 text-emerald-500"
                            >
                              Done
                            </span>
                          )}
                        </div>
                        <div
                          className="text-[11px] font-sans truncate mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.league}
                        </div>
                      </div>

                      {/* Deadline & Answer Progress */}
                      <div className="text-right shrink-0">
                        <div
                          className="text-xs sm:text-sm font-bold font-heading tabular-nums"
                          style={{
                            color: t.urgent ? "var(--danger-text)" : "var(--text-primary)",
                          }}
                        >
                          {t.time}
                        </div>
                        <div
                          className="text-[10px] font-sans mt-0.5 tabular-nums"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {answeredCount} of 6 answered
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── INTERACTIVE FIXTURE PREDICT MODAL / SHEET (Fixture Predict.dc.html) ── */}
      {activeFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: "var(--surface-canvas)",
              border: "1px solid var(--surface-border)",
              color: "var(--text-primary)",
            }}
          >
            {/* Modal Pitch Header */}
            <div
              className="p-5 relative text-white"
              style={{
                background: "linear-gradient(180deg, var(--pitch-bg-top) 0%, var(--pitch-bg-bottom) 100%)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveFixture(null)}
                  className="flex items-center gap-1 text-xs font-bold font-heading text-white/80 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to queue
                </button>

                <span className="text-[10px] font-bold uppercase font-heading px-2 py-0.5 rounded bg-black/30 text-white/90">
                  {activeFixture.league}
                </span>
              </div>

              {/* Match Header */}
              <div className="flex items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Crest code={activeFixture.home} size="lg" />
                  <span className="font-bold text-base font-heading truncate">
                    {activeFixture.homeName}
                  </span>
                </div>

                <div className="text-center shrink-0">
                  <span className="text-xs font-bold font-heading uppercase px-2 py-1 rounded bg-black/30">
                    {activeFixture.kickoff}
                  </span>
                </div>

                <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                  <span className="font-bold text-base font-heading truncate text-right">
                    {activeFixture.awayName}
                  </span>
                  <Crest code={activeFixture.away} size="lg" />
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(Object.keys(activeFixture.markets).length / 6) * 100}%`,
                      background: "var(--color-brand)",
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold font-heading tabular-nums shrink-0">
                  {Object.keys(activeFixture.markets).length} of 6 answered
                </span>
              </div>
            </div>

            {/* Markets List (Scrollable) */}
            <div className="p-4 sm:p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* MARKET 1: Match Result (1X2) */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-heading">
                    Match Result (1X2)
                  </span>
                  <span className="text-[11px] font-bold font-heading text-emerald-500">
                    +2 pts
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "home", label: `${activeFixture.homeName} Win` },
                    { key: "draw", label: "Draw" },
                    { key: "away", label: `${activeFixture.awayName} Win` },
                  ].map((opt) => {
                    const isPicked = activeFixture.markets.match_result === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleUpdateMarket("match_result", opt.key)}
                        className="py-2.5 px-2 rounded-xl text-xs font-bold font-heading transition-all duration-150 active:scale-95 text-center"
                        style={{
                          background: isPicked ? "var(--brand-fill)" : "var(--surface-subtle)",
                          color: isPicked ? "var(--color-on-brand)" : "var(--text-primary)",
                          border: isPicked
                            ? "1px solid var(--brand-fill)"
                            : "1px solid var(--surface-border)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MARKET 2: Exact Score */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-heading">
                    Exact Score
                  </span>
                  <span className="text-[11px] font-bold font-heading text-emerald-500">
                    +5 pts
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs font-heading">{activeFixture.home}</span>
                    <select
                      value={activeFixture.markets.exact_score?.home ?? 2}
                      onChange={(e) =>
                        handleUpdateMarket("exact_score", {
                          home: parseInt(e.target.value, 10),
                          away: activeFixture.markets.exact_score?.away ?? 1,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-subtle)] font-mono font-bold text-sm"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="font-black font-heading text-sm text-[var(--text-muted)]">-</span>

                  <div className="flex items-center gap-2">
                    <select
                      value={activeFixture.markets.exact_score?.away ?? 1}
                      onChange={(e) =>
                        handleUpdateMarket("exact_score", {
                          home: activeFixture.markets.exact_score?.home ?? 2,
                          away: parseInt(e.target.value, 10),
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-subtle)] font-mono font-bold text-sm"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span className="font-bold text-xs font-heading">{activeFixture.away}</span>
                  </div>
                </div>
              </div>

              {/* MARKET 3: Both Teams To Score (BTTS) */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-heading">
                    Both Teams To Score
                  </span>
                  <span className="text-[11px] font-bold font-heading text-emerald-500">
                    +1 pt
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "yes", label: "Yes (Both Score)" },
                    { key: "no", label: "No (Clean Sheet / 0-0)" },
                  ].map((opt) => {
                    const isPicked = activeFixture.markets.btts === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleUpdateMarket("btts", opt.key)}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold font-heading transition-all duration-150 active:scale-95 text-center"
                        style={{
                          background: isPicked ? "var(--brand-fill)" : "var(--surface-subtle)",
                          color: isPicked ? "var(--color-on-brand)" : "var(--text-primary)",
                          border: isPicked
                            ? "1px solid var(--brand-fill)"
                            : "1px solid var(--surface-border)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MARKET 4: Total Goals (Over/Under 2.5) */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-heading">
                    Total Goals (O/U 2.5)
                  </span>
                  <span className="text-[11px] font-bold font-heading text-emerald-500">
                    +1 pt
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "over", label: "Over 2.5 (3+ goals)" },
                    { key: "under", label: "Under 2.5 (0-2 goals)" },
                  ].map((opt) => {
                    const isPicked = activeFixture.markets.total_goals === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleUpdateMarket("total_goals", opt.key)}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold font-heading transition-all duration-150 active:scale-95 text-center"
                        style={{
                          background: isPicked ? "var(--brand-fill)" : "var(--surface-subtle)",
                          color: isPicked ? "var(--color-on-brand)" : "var(--text-primary)",
                          border: isPicked
                            ? "1px solid var(--brand-fill)"
                            : "1px solid var(--surface-border)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MARKET 5: Double Chance */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-heading">
                    Double Chance
                  </span>
                  <span className="text-[11px] font-bold font-heading text-emerald-500">
                    +1 pt
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "1X", label: "1X (Home or Draw)" },
                    { key: "12", label: "12 (Home or Away)" },
                    { key: "X2", label: "X2 (Draw or Away)" },
                  ].map((opt) => {
                    const isPicked = activeFixture.markets.double_chance === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleUpdateMarket("double_chance", opt.key)}
                        className="py-2.5 px-2 rounded-xl text-xs font-bold font-heading transition-all duration-150 active:scale-95 text-center"
                        style={{
                          background: isPicked ? "var(--brand-fill)" : "var(--surface-subtle)",
                          color: isPicked ? "var(--color-on-brand)" : "var(--text-primary)",
                          border: isPicked
                            ? "1px solid var(--brand-fill)"
                            : "1px solid var(--surface-border)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t border-[var(--surface-border)] flex items-center justify-between"
              style={{ background: "var(--surface-card)" }}
            >
              <span className="text-xs font-sans" style={{ color: "var(--text-secondary)" }}>
                Picks autosave immediately
              </span>

              <button
                onClick={() => setActiveFixture(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold font-heading transition-transform active:scale-95"
                style={{
                  background: "var(--brand-fill)",
                  color: "var(--color-on-brand)",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
