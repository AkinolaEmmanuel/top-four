import type { Profile } from "@/types";

export async function HubView({ user }: { user: Profile }) {
  const name = user.displayName || "there";

  // Attempt to fetch user's leagues (rooms) for real stats
  let roomCount = 0;
  let fixtures: { teams: { home: { name: string }; away: { name: string } }; date: string; id: number }[] = [];

  try {
    const { apiFetch } = await import("@/lib/api/fetcher");
    const leaguesData = await apiFetch<{ items: any[] }>("/leagues", {
      cache: "no-store",
    });
    roomCount = leaguesData.items?.length ?? 0;
  } catch {
    // Not authenticated or API unavailable — show defaults
  }

  try {
    const { getFixtures } = await import("@/lib/api-football/client");
    const { response: upcoming } = await getFixtures({ status: "NS" });
    fixtures = upcoming;
  } catch {
    // Fixtures unavailable
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">The Hub</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Welcome back, {name} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your rooms.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Rooms joined
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {roomCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Predictions made
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            —
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Points total
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            —
          </p>
        </div>
      </div>

      {/* Upcoming fixtures */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Upcoming fixtures
        </h2>
        {fixtures.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No upcoming fixtures found.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {fixtures.map((fixture) => (
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
        )}
      </div>
    </div>
  );
}
