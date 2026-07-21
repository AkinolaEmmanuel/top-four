"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCreateRoom } from "@/hooks/use-room-actions";
import { getCompetitions } from "@/lib/api-football/client";
import {
  DEFAULT_SCORING_CONFIG,
  LOCK_PRESET_LABELS,
  MARKET_LABELS,
  type JoinPolicy,
  type LeagueScopeType,
  type LockPreset,
  type MarketType,
  type ScoringConfig,
} from "@/types";

const ALL_MARKETS = Object.keys(MARKET_LABELS) as MarketType[];
const ALL_LOCK_PRESETS = Object.keys(LOCK_PRESET_LABELS) as LockPreset[];

export default function NewRoomPage() {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const { data: competitionsData } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => (await getCompetitions()).response,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [competitions, setCompetitions] = useState<number[]>([39]); // Premier League
  const [scopeType, setScopeType] = useState<LeagueScopeType>("season");
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>("always_open");
  const [lockPreset, setLockPreset] = useState<LockPreset>("5m");
  const [enabledMarkets, setEnabledMarkets] = useState<MarketType[]>(ALL_MARKETS);
  const [scoring, setScoring] = useState<ScoringConfig>({ ...DEFAULT_SCORING_CONFIG });
  const [tiebreakers, setTiebreakers] = useState<MarketType[]>([]);
  const [lonelyWolf, setLonelyWolf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCompetition(id: number) {
    setCompetitions((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  function toggleMarket(market: MarketType) {
    setEnabledMarkets((m) => (m.includes(market) ? m.filter((x) => x !== market) : [...m, market]));
    setTiebreakers((t) => t.filter((x) => x !== market)); // drop from tiebreakers if disabled
  }

  function toggleTiebreaker(market: MarketType) {
    setTiebreakers((t) => (t.includes(market) ? t.filter((x) => x !== market) : [...t, market]));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (competitions.length === 0) {
      setError("Pick at least one competition.");
      return;
    }
    if (enabledMarkets.length === 0) {
      setError("Enable at least one market.");
      return;
    }

    createRoom.mutate(
      {
        name,
        description,
        competitions,
        scope: { type: scopeType },
        join_policy: joinPolicy,
        lock_preset: lockPreset,
        enabled_markets: enabledMarkets,
        scoring_config: scoring,
        tiebreaker_order: tiebreakers,
        lonely_wolf_enabled: lonelyWolf,
      },
      {
        onSuccess: (room) => router.push(`/dashboard/rooms/${room.id}`),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Create a room</h1>
      <p className="mt-1 text-sm text-muted-foreground">Give it a name your group chat will recognize.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Room name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="The Gaffers" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sunday league, no away goals"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Competitions</Label>
          <div className="flex flex-wrap gap-2">
            {(competitionsData ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompetition(c.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  competitions.includes(c.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="scope">League duration</Label>
            <select
              id="scope"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as LeagueScopeType)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground"
            >
              <option value="gameweek">One gameweek</option>
              <option value="range">A range of gameweeks</option>
              <option value="season">The entire season</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lockPreset">Prediction lock</Label>
            <select
              id="lockPreset"
              value={lockPreset}
              onChange={(e) => setLockPreset(e.target.value as LockPreset)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground"
            >
              {ALL_LOCK_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {LOCK_PRESET_LABELS[preset]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Joining</Label>
          <div className="flex gap-2">
            {(["always_open", "closes_at_start"] as JoinPolicy[]).map((policy) => (
              <button
                key={policy}
                type="button"
                onClick={() => setJoinPolicy(policy)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  joinPolicy === policy
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                {policy === "always_open" ? "Stays open" : "Closes at kickoff"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Markets &amp; scoring</Label>
          <div className="space-y-2">
            {ALL_MARKETS.map((market) => (
              <div key={market} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <button
                  type="button"
                  onClick={() => toggleMarket(market)}
                  className={cn(
                    "flex-1 text-left text-sm font-semibold",
                    enabledMarkets.includes(market) ? "text-foreground" : "text-muted-foreground line-through"
                  )}
                >
                  {MARKET_LABELS[market]}
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={scoring[market]}
                  onChange={(e) => setScoring((s) => ({ ...s, [market]: Number(e.target.value) }))}
                  disabled={!enabledMarkets.includes(market)}
                  className="h-8 w-16 rounded-md border border-input bg-background text-center text-sm text-foreground disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={!enabledMarkets.includes(market)}
                  onClick={() => toggleTiebreaker(market)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase transition-colors disabled:opacity-30",
                    tiebreakers.includes(market)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground"
                  )}
                >
                  {tiebreakers.includes(market) ? `Tiebreak #${tiebreakers.indexOf(market) + 1}` : "Tiebreaker"}
                </button>
              </div>
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={lonelyWolf} onChange={(e) => setLonelyWolf(e.target.checked)} />
            Lonely Wolf bonus — sole correct predictor on a fixture gets +2 (house rule, not required)
          </label>
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={createRoom.isPending}>
          {createRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create room
        </Button>
      </form>
    </div>
  );
}
