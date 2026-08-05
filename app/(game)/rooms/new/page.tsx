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
        onSuccess: (room) => router.push(`/rooms/${room.id}`),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">INITIALIZE ROOM</h1>
        </div>
        <p className="text-sm text-white/60 font-mono">
          CONFIGURE SYSTEM PARAMETERS FOR YOUR NEW PREDICTION CLUB.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* MODULE 1: TERMINAL ID */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-xl transition-all hover:border-primary/40 group">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <span className="text-xs font-black tracking-widest text-primary">MODULE 01</span>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">TERMINAL IDENTITY</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-white/60 uppercase tracking-widest">Room Name</Label>
              <Input 
                id="name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="E.g. The Invincibles" 
                className="h-12 bg-black/50 border-white/10 font-mono text-white focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold text-white/60 uppercase tracking-widest">Description <span className="text-white/30">(OPTIONAL)</span></Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sunday league banter only"
                className="h-12 bg-black/50 border-white/10 font-mono text-white focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>
        </div>

        {/* MODULE 2: RULES OF ENGAGEMENT */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-xl transition-all hover:border-primary/40 group">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <span className="text-xs font-black tracking-widest text-primary">MODULE 02</span>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">RULES OF ENGAGEMENT</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-white/60 uppercase tracking-widest">Active Competitions</Label>
              <div className="flex flex-wrap gap-2">
                {(competitionsData ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCompetition(c.id)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-bold font-mono transition-all",
                      competitions.includes(c.id)
                        ? "border-primary bg-primary text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                        : "border-white/10 bg-black/50 text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {c.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="scope" className="text-xs font-bold text-white/60 uppercase tracking-widest">League Duration</Label>
                <select
                  id="scope"
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value as LeagueScopeType)}
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/50 px-4 font-mono text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="gameweek">ONE GAMEWEEK</option>
                  <option value="range">A RANGE OF GAMEWEEKS</option>
                  <option value="season">THE ENTIRE SEASON</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="lockPreset" className="text-xs font-bold text-white/60 uppercase tracking-widest">Prediction Lock</Label>
                <select
                  id="lockPreset"
                  value={lockPreset}
                  onChange={(e) => setLockPreset(e.target.value as LockPreset)}
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/50 px-4 font-mono text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {ALL_LOCK_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {LOCK_PRESET_LABELS[preset].toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 3: MARKET PROTOCOLS */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-xl transition-all hover:border-primary/40 group">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <span className="text-xs font-black tracking-widest text-primary">MODULE 03</span>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">MARKET PROTOCOLS</h2>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 block">Joining Policy</Label>
            <div className="flex gap-3">
              {(["always_open", "closes_at_start"] as JoinPolicy[]).map((policy) => (
                <button
                  key={policy}
                  type="button"
                  onClick={() => setJoinPolicy(policy)}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-3 text-xs font-bold font-mono transition-all",
                    joinPolicy === policy
                      ? "border-primary bg-primary text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                      : "border-white/10 bg-black/50 text-white/60 hover:text-white hover:bg-white/5"
                  )}
              >
                {policy === "always_open" ? "Stays open" : "Closes at kickoff"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Available Markets & Scoring (PTS)</Label>
          <div className="space-y-3">
            {ALL_MARKETS.map((market) => (
              <div key={market} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/30">
                <button
                  type="button"
                  onClick={() => toggleMarket(market)}
                  className={cn(
                    "flex-1 text-left text-sm font-bold font-mono tracking-tight",
                    enabledMarkets.includes(market) ? "text-primary" : "text-white/30 line-through"
                  )}
                >
                  {MARKET_LABELS[market].toUpperCase()}
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Points:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={scoring[market]}
                      onChange={(e) => setScoring((s) => ({ ...s, [market]: Number(e.target.value) }))}
                      disabled={!enabledMarkets.includes(market)}
                      className="h-9 w-16 rounded-md border border-white/10 bg-black text-center text-sm font-mono text-white disabled:opacity-30 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!enabledMarkets.includes(market)}
                    onClick={() => toggleTiebreaker(market)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase transition-all disabled:opacity-30 w-[110px]",
                      tiebreakers.includes(market)
                        ? "border-primary bg-primary text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                        : "border-white/20 text-white/50 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {tiebreakers.includes(market) ? `TIEBREAK #${tiebreakers.indexOf(market) + 1}` : "SET TIEBREAK"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <label className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <input 
              type="checkbox" 
              checked={lonelyWolf} 
              onChange={(e) => setLonelyWolf(e.target.checked)} 
              className="mt-1 h-4 w-4 rounded border-white/20 bg-black text-primary focus:ring-primary focus:ring-offset-0"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Enable Lonely Wolf Bonus</span>
              <span className="text-xs text-white/50 font-mono mt-1">If only one player correctly predicts a fixture, they receive a +2 PTS bonus.</span>
            </div>
          </label>
        </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-center">
            <p className="text-sm font-bold text-destructive uppercase tracking-wide">Error: {error}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={createRoom.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-5 text-sm font-black tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(0,255,102,0.3)] uppercase"
        >
          {createRoom.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              INITIALIZING SYSTEM...
            </>
          ) : (
            "INITIALIZE ROOM NOW"
          )}
        </button>
      </form>
    </div>
  );
}
