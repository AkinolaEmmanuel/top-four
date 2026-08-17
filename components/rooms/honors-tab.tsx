"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trophy, Award, Check, UserPlus, ChevronRight } from "lucide-react";
import { AvatarDisc } from "@/components/ui/avatar-disc";

type Formation = "4-3-3" | "4-4-2" | "3-5-2";

type AwardCategory = {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  pick?: string;
};

const INITIAL_AWARDS: AwardCategory[] = [
  { id: "golden_boot", title: "Golden Boot Winner", subtitle: "Top goal scorer of the tournament", points: 25, pick: "Erling Haaland" },
  { id: "golden_ball", title: "Golden Ball Winner", subtitle: "Best overall player", points: 25, pick: "Mohamed Salah" },
  { id: "young_player", title: "Young Player of the Season", subtitle: "Best U-21 player", points: 15, pick: "Cole Palmer" },
  { id: "golden_glove", title: "Golden Glove Winner", subtitle: "Most clean sheets", points: 15, pick: "David Raya" },
];

const INITIAL_LINEUP: Record<string, string> = {
  GK: "David Raya",
  LB: "Josko Gvardiol",
  CB1: "William Saliba",
  CB2: "Gabriel Magalhães",
  RB: "Trent Alexander-Arnold",
  CM1: "Declan Rice",
  CM2: "Rodri",
  CAM: "Martin Ødegaard",
  LW: "Bukayo Saka",
  ST: "Erling Haaland",
  RW: "Mohamed Salah",
};

export function HonorsTab({ roomId }: { roomId: string }) {
  const [formation, setFormation] = useState<Formation>("4-3-3");
  const [awards, setAwards] = useState<AwardCategory[]>(INITIAL_AWARDS);
  const [lineup, setLineup] = useState(INITIAL_LINEUP);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const filledCount = Object.keys(lineup).length;

  function handleSave() {
    toast.success("Tournament honors & XI lineup saved!");
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── SECTION HEADER ── */}
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
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold tracking-wider uppercase font-heading"
                style={{ color: "var(--text-muted)" }}
              >
                TOURNAMENT HONORS & XI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-heading bg-amber-500/10 text-amber-500 border border-amber-500/20">
                25 PTS EACH
              </span>
            </div>
            <h2
              className="text-lg sm:text-xl font-bold font-heading mt-1"
              style={{ color: "var(--text-primary)" }}
            >
              Pick Your Honors & Best XI
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Lock in your season predictions before Gameweek 5 cutoff.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
            style={{
              background: "var(--brand-fill)",
              color: "var(--color-on-brand)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <Check className="h-4 w-4" />
            Save Predictions
          </button>
        </div>
      </div>

      {/* ── AWARD PICKS GRID ── */}
      <div className="grid sm:grid-cols-2 gap-3.5">
        {awards.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl p-4 flex flex-col justify-between gap-3 border transition-all"
            style={{
              background: "var(--surface-card)",
              borderColor: item.pick ? "var(--accent-border)" : "var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.subtitle}</p>
              </div>
              <span className="text-[10px] font-bold font-heading tabular-nums text-amber-500 shrink-0">
                +{item.points} PTS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.pick || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setAwards((prev) =>
                    prev.map((a) => (a.id === item.id ? { ...a, pick: val } : a))
                  );
                }}
                placeholder="Type player name..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-[var(--surface-border)] bg-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
              {item.pick && (
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── STADIUM GRASS PITCH LINEUP PICKER (Lineup Picker.dc.html) ── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--elev-2)",
        }}
      >
        {/* Pitch top bar with formation selector */}
        <div
          className="p-4 flex items-center justify-between gap-3"
          style={{ background: "var(--nav-surface)", color: "var(--nav-text)" }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase font-heading text-[var(--nav-text-quiet)]">
              TEAM XI FORMATION
            </div>
            <div className="text-sm font-bold font-heading">{filledCount} of 11 positions filled</div>
          </div>

          <div className="flex gap-1.5 bg-[var(--nav-fill)] p-1 rounded-xl">
            {(["4-3-3", "4-4-2", "3-5-2"] as Formation[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold font-heading transition-all"
                style={{
                  background: formation === f ? "var(--color-brand)" : "transparent",
                  color: formation === f ? "var(--color-on-brand)" : "var(--nav-text-quiet)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Turf Pitch Field */}
        <div
          className="relative min-h-[420px] sm:min-h-[480px] p-6 flex flex-col justify-between items-center select-none"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0, rgba(0,0,0,0.06) 46px, transparent 92px), linear-gradient(180deg, var(--pitch-bg-top), var(--pitch-bg-bottom))",
          }}
        >
          {/* Pitch Markings */}
          <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-white/20 rounded-b-lg" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-white/20 rounded-t-lg" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
          </div>

          {/* FORWARD ROW */}
          <div className="relative z-10 w-full flex justify-around items-center pt-4">
            {["LW", "ST", "RW"].map((pos) => (
              <SlotCard
                key={pos}
                pos={pos}
                name={lineup[pos]}
                onSelect={() => setActiveSlot(pos)}
              />
            ))}
          </div>

          {/* MIDFIELD ROW */}
          <div className="relative z-10 w-full flex justify-around items-center">
            {["CM1", "CAM", "CM2"].map((pos) => (
              <SlotCard
                key={pos}
                pos={pos}
                name={lineup[pos]}
                onSelect={() => setActiveSlot(pos)}
              />
            ))}
          </div>

          {/* DEFENSE ROW */}
          <div className="relative z-10 w-full flex justify-around items-center">
            {["LB", "CB1", "CB2", "RB"].map((pos) => (
              <SlotCard
                key={pos}
                pos={pos}
                name={lineup[pos]}
                onSelect={() => setActiveSlot(pos)}
              />
            ))}
          </div>

          {/* GOALKEEPER ROW */}
          <div className="relative z-10 w-full flex justify-center items-center pb-2">
            <SlotCard
              pos="GK"
              name={lineup["GK"]}
              onSelect={() => setActiveSlot("GK")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotCard({ pos, name, onSelect }: { pos: string; name?: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-1 group transition-transform active:scale-95"
    >
      {name ? (
        <AvatarDisc name={name} size="md" className="ring-2 ring-emerald-400 shadow-lg" />
      ) : (
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/40 bg-white/10 flex items-center justify-center text-white/60 group-hover:border-white">
          <UserPlus className="h-4 w-4" />
        </div>
      )}
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-heading bg-black/60 text-white backdrop-blur-sm truncate max-w-[90px]">
        {name || pos}
      </span>
    </button>
  );
}
