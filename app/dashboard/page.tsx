import { getSession } from "@/lib/mock-auth/server";
import { findUserById } from "@/lib/mock-db/store";
import { getFixtures } from "@/lib/api-football/client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  const user = session ? findUserById(session.userId) : undefined;
  const name = user?.full_name ?? user?.username ?? "there";

  const { response: upcoming } = await getFixtures({ status: "NS" });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">The Hub</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Welcome back, {name} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your rooms.
        </p>
      </div>

      {/* Stats row — wire up real data as you build features */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming fixtures — sourced from the mock API-Football client */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Upcoming fixtures
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {upcoming.map((fixture) => (
            <li
              key={fixture.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="font-medium text-foreground">
                {fixture.teams.home.name} vs {fixture.teams.away.name}
              </span>
              <span className="text-muted-foreground">
                {new Date(fixture.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { label: "Rooms joined", value: "—" },
  { label: "Predictions made", value: "—" },
  { label: "Points total", value: "—" },
];
