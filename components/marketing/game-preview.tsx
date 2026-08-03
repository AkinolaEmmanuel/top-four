"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Fixture } from "@/lib/api-football/types";

/**
 * Read-only previews of the actual game surfaces (Lobby fixture cards, the
 * Board leaderboard) for signed-out visitors — same card/row markup as
 * components/rooms/room-view.tsx, just non-interactive with a lock affordance
 * instead of a submit control, so logging in feels like a continuation of
 * what was already on screen rather than a different app.
 */

export function PreviewCardChrome({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-border px-5 py-4">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function PreviewFixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {fixture.teams.home.name} vs {fixture.teams.away.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {fixture.league.name} · {fixture.round} ·{" "}
          {new Date(fixture.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <PreviewMarketRow label="Match Result" options={["HOME", "DRAW", "AWAY"]} />
        <PreviewMarketRow label="Both Teams to Score" options={["YES", "NO"]} />
      </div>
    </div>
  );
}

function PreviewMarketRow({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/[0.15] px-3 py-2">
      <span className="w-32 shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        {options.map((option, i) => (
          <span
            key={option}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-bold uppercase",
              i === 0 ? "bg-primary/30 text-foreground" : "bg-black/20 text-muted-foreground"
            )}
          >
            {option}
          </span>
        ))}
      </div>
      <span className="flex items-center gap-1.5 rounded-md bg-black/20 px-2.5 py-1.5 text-[10px] font-bold uppercase text-muted-foreground">
        <Lock className="h-3 w-3" />
        Sign in
      </span>
    </div>
  );
}

export type PreviewLeaderboardRow = { rank: number; displayName: string; points: number };

export function PreviewLeaderboardCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: PreviewLeaderboardRow[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <PreviewCardChrome title={title} subtitle={subtitle} />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5">Pos</th>
            <th className="px-4 py-2.5">Manager</th>
            <th className="px-4 py-2.5 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.displayName}`}>
              <td className="px-4 py-2.5 font-bold text-foreground">{row.rank}</td>
              <td className="px-4 py-2.5 text-foreground">{row.displayName}</td>
              <td className="px-4 py-2.5 text-right font-mono font-extrabold text-foreground">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
