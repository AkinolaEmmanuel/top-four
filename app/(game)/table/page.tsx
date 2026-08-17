"use client";

import { Trophy, Crown, Medal } from "lucide-react";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Kolade", points: 1340, pl: 820, ucl: 520, ident: 1, self: false },
  { rank: 2, name: "David Beckham", points: 1250, pl: 780, ucl: 470, ident: 2, self: false },
  { rank: 3, name: "Marcus Rashford", points: 1120, pl: 710, ucl: 410, ident: 3, self: false },
  { rank: 4, name: "Akinola Emmanuel", points: 1080, pl: 690, ucl: 390, ident: 4, self: true },
  { rank: 5, name: "Bukayo Saka", points: 980, pl: 620, ucl: 360, ident: 5, self: false },
  { rank: 6, name: "Cole Palmer", points: 910, pl: 580, ucl: 330, ident: 6, self: false },
  { rank: 7, name: "Phil Foden", points: 840, pl: 530, ucl: 310, ident: 7, self: false },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function StandingsTablePage() {
  const myStanding = MOCK_LEADERBOARD.find((r) => r.self);

  return (
    <div className="space-y-6 pb-24 md:pb-0 w-full min-w-0">
      {/* ── Standings Lead Hero (Mobile & Desktop) ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest font-heading block"
              style={{ color: "var(--text-muted)" }}
            >
              LEAGUE STANDINGS
            </span>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight font-heading mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              Premier Predictors
            </h1>
            <p
              className="text-xs mt-1 font-sans"
              style={{ color: "var(--text-secondary)" }}
            >
              Updated after Gameweek 2 · 128 members
            </p>
          </div>

          {myStanding && (
            <div
              className="flex items-center gap-4 px-4 py-3 rounded-xl sm:self-center"
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--surface-border)",
              }}
            >
              <div>
                <div
                  className="text-[10px] font-bold uppercase font-heading"
                  style={{ color: "var(--text-muted)" }}
                >
                  YOUR POSITION
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span
                    className="text-2xl font-black font-heading tabular-nums"
                    style={{ color: "var(--color-brand)" }}
                  >
                    #{myStanding.rank}
                  </span>
                  <span
                    className="text-xs font-bold font-heading"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    of 128
                  </span>
                </div>
              </div>
              <div
                className="h-8 w-px"
                style={{ background: "var(--surface-border)" }}
              />
              <div>
                <div
                  className="text-[10px] font-bold uppercase font-heading"
                  style={{ color: "var(--text-muted)" }}
                >
                  POINTS
                </div>
                <div
                  className="text-2xl font-black font-heading tabular-nums mt-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {myStanding.points}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Standings Table Container ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        {/* Table Header */}
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider font-heading"
          style={{
            background: "var(--surface-subtle)",
            borderBottom: "1px solid var(--surface-border)",
            color: "var(--text-muted)",
          }}
        >
          <span className="w-8 text-center shrink-0">POS</span>
          <span className="flex-1">MEMBER</span>
          <span className="hidden sm:inline-block w-16 text-right shrink-0">PL</span>
          <span className="hidden sm:inline-block w-16 text-right shrink-0">UCL</span>
          <span className="w-16 text-right shrink-0">PTS</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[var(--surface-border)]">
          {MOCK_LEADERBOARD.map((row) => {
            const isSelf = row.self;
            return (
              <div
                key={row.rank}
                className="flex items-center gap-3 px-4 sm:px-6 py-3.5 transition-colors text-xs"
                style={{
                  background: isSelf ? "var(--accent-surface)" : undefined,
                }}
              >
                {/* Pos */}
                <div className="w-8 text-center shrink-0 flex items-center justify-center font-heading font-bold">
                  {row.rank === 1 ? (
                    <Crown className="h-4 w-4" style={{ color: "var(--color-crown)" }} />
                  ) : row.rank === 2 ? (
                    <Medal className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                  ) : row.rank === 3 ? (
                    <Medal className="h-4 w-4" style={{ color: "var(--tf-amber-600)" }} />
                  ) : (
                    <span
                      className="tabular-nums"
                      style={{
                        color: isSelf ? "var(--accent-text)" : "var(--text-muted)",
                      }}
                    >
                      {row.rank}
                    </span>
                  )}
                </div>

                {/* Avatar disc + Name */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold font-heading shrink-0"
                    style={{
                      background: `var(--ident-${row.ident})`,
                      color: "var(--text-primary)",
                    }}
                  >
                    {getInitials(row.name)}
                  </div>
                  <div className="min-w-0 truncate">
                    <span
                      className="font-bold font-heading truncate block"
                      style={{
                        color: isSelf ? "var(--accent-text)" : "var(--text-primary)",
                      }}
                    >
                      {row.name}
                      {isSelf && (
                        <span
                          className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-heading inline-block"
                          style={{
                            background: "var(--brand-fill)",
                            color: "var(--color-on-brand)",
                          }}
                        >
                          You
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* PL Points */}
                <span
                  className="hidden sm:inline-block w-16 text-right tabular-nums font-heading shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {row.pl}
                </span>

                {/* UCL Points */}
                <span
                  className="hidden sm:inline-block w-16 text-right tabular-nums font-heading shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {row.ucl}
                </span>

                {/* Total Points */}
                <span
                  className="w-16 text-right font-black font-heading tabular-nums shrink-0 text-sm"
                  style={{
                    color: isSelf ? "var(--accent-text)" : "var(--text-primary)",
                  }}
                >
                  {row.points}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
