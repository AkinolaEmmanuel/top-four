"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Loader2, Trophy, Shield, Clock } from "lucide-react";
import { useCreateRoom } from "@/hooks/use-room-actions";
import {
  DEFAULT_SCORING_CONFIG,
  LOCK_PRESET_LABELS,
  MARKET_LABELS,
  type LockPreset,
  type MarketType,
  type ScoringConfig,
} from "@/types";

const ALL_MARKETS = Object.keys(MARKET_LABELS) as MarketType[];
const ALL_LOCK_PRESETS = Object.keys(LOCK_PRESET_LABELS) as LockPreset[];

const COMPETITIONS = [
  { id: 39, name: "Premier League", country: "England", code: "PL" },
  { id: 2, name: "Champions League", country: "Europe", code: "UCL" },
  { id: 140, name: "La Liga", country: "Spain", code: "ESP" },
  { id: 135, name: "Serie A", country: "Italy", code: "ITA" },
  { id: 78, name: "Bundesliga", country: "Germany", code: "GER" },
];

export default function NewRoomPage() {
  const router = useRouter();
  const createRoom = useCreateRoom();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [competitions, setCompetitions] = useState<number[]>([39]);
  const [lockPreset, setLockPreset] = useState<LockPreset>("5m");
  const [enabledMarkets, setEnabledMarkets] = useState<MarketType[]>([
    "match_result",
    "exact_score",
    "btts",
    "total_goals",
  ]);
  const [scoring, setScoring] = useState<ScoringConfig>({ ...DEFAULT_SCORING_CONFIG });
  const [error, setError] = useState<string | null>(null);

  function toggleCompetition(id: number) {
    setCompetitions((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  function toggleMarket(market: MarketType) {
    setEnabledMarkets((m) =>
      m.includes(market) ? m.filter((x) => x !== market) : [...m, market]
    );
  }

  async function handlePublish() {
    setError(null);
    if (!name.trim()) {
      setError("Please give your league a name.");
      setStep(1);
      return;
    }
    if (competitions.length === 0) {
      setError("Pick at least one competition.");
      setStep(2);
      return;
    }
    if (enabledMarkets.length === 0) {
      setError("Enable at least one market.");
      setStep(3);
      return;
    }

    createRoom.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        competitions,
        scope: { type: "season" },
        join_policy: "always_open",
        lock_preset: lockPreset,
        enabled_markets: enabledMarkets,
        scoring_config: scoring,
        tiebreaker_order: [],
        lonely_wolf_enabled: false,
      },
      {
        onSuccess: (room) => router.push(`/rooms/${room.id}`),
        onError: (err) => setError(err.message),
      }
    );
  }

  const maxPointsPerMatch = enabledMarkets.reduce((sum, m) => sum + (scoring[m] || 0), 0);

  return (
    <div className="mx-auto max-w-xl pb-16 px-4 space-y-6 font-sans">
      {/* ── HEADER WITH PROGRESS SPINE (League Setup.dc.html) ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase font-heading block"
              style={{ color: "var(--text-muted)" }}
            >
              STEP {step} OF 4
            </span>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight font-heading mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {step === 1 && "Name & description"}
              {step === 2 && "Pick competitions"}
              {step === 3 && "Scoring & markets"}
              {step === 4 && "Review & publish"}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
              MAX PER FIXTURE
            </span>
            <div className="text-xl font-black font-heading tabular-nums" style={{ color: "var(--color-brand)" }}>
              {maxPointsPerMatch} pts
            </div>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--surface-border)]">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: s <= step ? "var(--color-brand)" : "var(--surface-subtle)",
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-xs font-bold font-heading"
          style={{
            background: "var(--danger-surface)",
            color: "var(--danger-text)",
            border: "1px solid var(--danger-border)",
          }}
        >
          {error}
        </div>
      )}

      {/* ── STEP 1: BASICS ── */}
      {step === 1 && (
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase font-heading block" style={{ color: "var(--text-muted)" }}>
              League Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunday League Pundits"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl text-sm font-bold font-heading border border-[var(--surface-border)] bg-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase font-heading block" style={{ color: "var(--text-muted)" }}>
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="A brief note for members..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl text-xs font-sans border border-[var(--surface-border)] bg-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (!name.trim()) {
                  setError("Please provide a league name.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center gap-2 transition-transform active:scale-95"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              Continue to Competitions
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: COMPETITIONS ── */}
      {step === 2 && (
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <span className="text-[10px] font-bold uppercase font-heading block" style={{ color: "var(--text-muted)" }}>
            Select Active Competitions
          </span>

          <div className="grid gap-2.5">
            {COMPETITIONS.map((comp) => {
              const isSelected = competitions.includes(comp.id);
              return (
                <div
                  key={comp.id}
                  onClick={() => toggleCompetition(comp.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99]"
                  style={{
                    background: isSelected ? "var(--accent-surface)" : "var(--surface-subtle)",
                    borderColor: isSelected ? "var(--accent-border)" : "var(--surface-border)",
                  }}
                >
                  <div>
                    <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
                      {comp.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{comp.country}</div>
                  </div>

                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                    style={{
                      background: isSelected ? "var(--brand-fill)" : "transparent",
                      border: isSelected ? "none" : "1px solid var(--surface-border-strong)",
                      color: "var(--color-on-brand)",
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl font-bold text-xs font-heading border border-[var(--surface-border)] text-[var(--text-secondary)]"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (competitions.length === 0) {
                  setError("Select at least one competition.");
                  return;
                }
                setError(null);
                setStep(3);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center gap-2"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              Continue to Markets
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: MARKETS & WEIGHTS ── */}
      {step === 3 && (
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <span className="text-[10px] font-bold uppercase font-heading block" style={{ color: "var(--text-muted)" }}>
            Enabled Markets & Points
          </span>

          <div className="grid gap-2.5">
            {ALL_MARKETS.map((market) => {
              const isEnabled = enabledMarkets.includes(market);
              return (
                <div
                  key={market}
                  className="flex items-center justify-between p-3.5 rounded-xl border transition-all"
                  style={{
                    background: isEnabled ? "var(--surface-card)" : "var(--surface-subtle)",
                    borderColor: isEnabled ? "var(--color-brand)" : "var(--surface-border)",
                  }}
                >
                  <div
                    onClick={() => toggleMarket(market)}
                    className="flex-1 cursor-pointer select-none"
                  >
                    <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
                      {MARKET_LABELS[market]}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-heading tabular-nums" style={{ color: "var(--color-brand)" }}>
                      {scoring[market] ?? 1} pts
                    </span>
                    <button
                      onClick={() => toggleMarket(market)}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                      style={{
                        background: isEnabled ? "var(--brand-fill)" : "transparent",
                        border: isEnabled ? "none" : "1px solid var(--surface-border-strong)",
                        color: "var(--color-on-brand)",
                      }}
                    >
                      {isEnabled && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl font-bold text-xs font-heading border border-[var(--surface-border)] text-[var(--text-secondary)]"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (enabledMarkets.length === 0) {
                  setError("Enable at least one market.");
                  return;
                }
                setError(null);
                setStep(4);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center gap-2"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              Review League
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REVIEW & PUBLISH ── */}
      {step === 4 && (
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-5"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
              FINAL REVIEW
            </span>
            <h3 className="font-bold text-base font-heading" style={{ color: "var(--text-primary)" }}>
              {name}
            </h3>
            {description && <p className="text-xs text-[var(--text-secondary)]">{description}</p>}
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Competitions:</span>
              <span className="font-bold font-heading">{competitions.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Markets Enabled:</span>
              <span className="font-bold font-heading">{enabledMarkets.length} markets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Max Points Per Match:</span>
              <span className="font-bold font-heading text-emerald-500">{maxPointsPerMatch} pts</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl font-bold text-xs font-heading border border-[var(--surface-border)] text-[var(--text-secondary)]"
            >
              Back
            </button>
            <button
              onClick={handlePublish}
              disabled={createRoom.isPending}
              className="px-6 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              {createRoom.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish League"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
