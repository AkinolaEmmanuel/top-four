'use client';

import React, { useState } from 'react';

const CLUB = { ARS: "#c8182f" };
const SQUAD = [
  { id: "raya", name: "David Raya", n: 1, pos: "GK" },
  { id: "hein", name: "Karl Hein", n: 31, pos: "GK" },
  { id: "white", name: "Ben White", n: 4, pos: "DF" },
  { id: "saliba", name: "William Saliba", n: 2, pos: "DF" },
  { id: "gabriel", name: "Gabriel Magalhães", n: 6, pos: "DF" },
  { id: "calafiori", name: "Riccardo Calafiori", n: 33, pos: "DF" },
  { id: "timber", name: "Jurriën Timber", n: 12, pos: "DF" },
  { id: "tomiyasu", name: "Takehiro Tomiyasu", n: 18, pos: "DF" },
  { id: "kiwior", name: "Jakub Kiwior", n: 15, pos: "DF" },
  { id: "lewis", name: "Myles Lewis-Skelly", n: 49, pos: "DF" },
  { id: "rice", name: "Declan Rice", n: 41, pos: "MF" },
  { id: "odegaard", name: "Martin Ødegaard", n: 8, pos: "MF" },
  { id: "partey", name: "Thomas Partey", n: 5, pos: "MF" },
  { id: "merino", name: "Mikel Merino", n: 23, pos: "MF" },
  { id: "nwaneri", name: "Ethan Nwaneri", n: 53, pos: "MF" },
  { id: "saka", name: "Bukayo Saka", n: 7, pos: "FW" },
  { id: "havertz", name: "Kai Havertz", n: 29, pos: "FW" },
  { id: "martinelli", name: "Gabriel Martinelli", n: 11, pos: "FW" },
  { id: "trossard", name: "Leandro Trossard", n: 19, pos: "FW" },
  { id: "jesus", name: "Gabriel Jesus", n: 9, pos: "FW" }
];

const SHAPES: Record<string, number[]> = {
  "4-3-3": [4, 3, 3],
  "4-4-2": [4, 4, 2],
  "3-5-2": [3, 5, 2],
  "5-3-2": [5, 3, 2]
};

export function LineupPickerDesktop({ onSave, onBack }: { onSave: (picks: any) => void; onBack: () => void }) {
  const [formation, setFormation] = useState("4-3-3");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>("GK0");
  const [searchQuery, setSearchQuery] = useState("");
  const [posFilter, setPosFilter] = useState("All");

  const slotKeys = () => {
    const [d, m, f] = SHAPES[formation] || [4, 3, 3];
    const keys = ["GK0"];
    for (let i = 0; i < d; i++) keys.push("DF" + i);
    for (let i = 0; i < m; i++) keys.push("MF" + i);
    for (let i = 0; i < f; i++) keys.push("FW" + i);
    return keys;
  };

  const keys = slotKeys();
  const currentCount = Object.keys(picks).length;
  const isComplete = currentCount === 11;

  const rowsMap = {
    FW: keys.filter((k) => k.startsWith("FW")),
    MF: keys.filter((k) => k.startsWith("MF")),
    DF: keys.filter((k) => k.startsWith("DF")),
    GK: keys.filter((k) => k.startsWith("GK")),
  };

  const handleSlotClick = (key: string) => {
    setSelectedSlot(key);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!selectedSlot) return;

    // Check if player is already assigned somewhere else
    const existingSlot = Object.keys(picks).find((k) => picks[k] === playerId);
    const newPicks = { ...picks };

    if (existingSlot && existingSlot !== selectedSlot) {
      // Swap
      const currentInSlot = picks[selectedSlot];
      if (currentInSlot) {
        newPicks[existingSlot] = currentInSlot;
      } else {
        delete newPicks[existingSlot];
      }
    }

    newPicks[selectedSlot] = playerId;
    setPicks(newPicks);

    // Auto-advance to next empty slot
    const nextEmpty = keys.find((k) => !newPicks[k]);
    if (nextEmpty) {
      setSelectedSlot(nextEmpty);
    }
  };

  const handleClearSlot = (key: string) => {
    const next = { ...picks };
    delete next[key];
    setPicks(next);
  };

  const filteredSquad = SQUAD.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (posFilter !== "All" && p.pos !== posFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-[1280px] w-full mx-auto p-[32px] flex flex-col gap-[24px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-[16px] border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-[16px]">
            <button
              onClick={onBack}
              className="h-[38px] px-[14px] rounded-[10px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[13px] font-heading font-semibold flex items-center gap-[6px] transition-colors cursor-pointer"
            >
              <span>‹</span> Back
            </button>
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[#c8182f] text-white grid place-items-center font-heading font-bold text-[12px]">
                ARS
              </div>
              <div>
                <h1 className="font-heading font-bold text-[18px]">Arsenal Starting XI</h1>
                <p className="text-[11.5px] text-[var(--text-muted)]">Predict the 11 starting players (1 pt per correct player)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[16px]">
            {/* Formation Selector */}
            <div className="flex items-center gap-[6px] bg-[var(--surface-card)] p-[4px] rounded-[10px] border border-[var(--surface-border-strong)]">
              {Object.keys(SHAPES).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`h-[30px] px-[12px] rounded-[7px] text-[11.5px] font-heading font-semibold transition-all cursor-pointer ${
                    formation === f
                      ? 'bg-[var(--color-brand)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => isComplete && onSave(picks)}
              disabled={!isComplete}
              className={`h-[42px] px-[24px] rounded-[12px] font-heading font-bold text-[13px] transition-all ${
                isComplete
                  ? 'bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white shadow-[var(--elev-glow)] cursor-pointer'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
              }`}
            >
              {isComplete ? "Save Lineup (11/11)" : `Select ${11 - currentCount} more`}
            </button>
          </div>
        </div>

        {/* 2-Column Split: Pitch on Left (7 cols), Squad on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[28px] items-start">
          {/* Tactical Pitch (7 cols) */}
          <div className="lg:col-span-7 rounded-[24px] bg-[linear-gradient(180deg,#143823_0%,#0c2517_100%)] p-[28px_20px] relative overflow-hidden border-2 border-[rgba(255,255,255,0.15)] shadow-[var(--elev-4)] min-h-[580px] flex flex-col justify-between">
            {/* Pitch Markings */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 left-0 right-0 h-[48%] border-b border-white" />
              <div className="absolute top-[48%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[120px] h-[120px] rounded-full border border-white" />
              <div className="absolute bottom-0 left-[50%] -translate-x-[50%] w-[240px] h-[100px] border-t border-l border-r border-white" />
              <div className="absolute bottom-0 left-[50%] -translate-x-[50%] w-[120px] h-[40px] border-t border-l border-r border-white" />
            </div>

            {/* Pitch Rows: FW -> MF -> DF -> GK */}
            {[rowsMap.FW, rowsMap.MF, rowsMap.DF, rowsMap.GK].map((rowSlots, rowIdx) => (
              <div key={rowIdx} className="flex justify-around items-center w-full z-10 my-[8px]">
                {rowSlots.map((slotKey) => {
                  const playerId = picks[slotKey];
                  const player = playerId ? SQUAD.find((p) => p.id === playerId) : null;
                  const isSelected = selectedSlot === slotKey;

                  return (
                    <div
                      key={slotKey}
                      onClick={() => handleSlotClick(slotKey)}
                      className="flex flex-col items-center gap-[6px] group cursor-pointer"
                    >
                      <div
                        className={`w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center font-heading font-bold transition-all shadow-md ${
                          player
                            ? 'bg-[#c8182f] text-white border-2 border-white'
                            : 'bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.7)] border-2 border-dashed border-[rgba(255,255,255,0.3)] hover:border-white'
                        } ${isSelected ? 'ring-4 ring-[var(--color-brand)] scale-110' : ''}`}
                      >
                        {player ? (
                          <>
                            <span className="text-[10px] opacity-80">{player.pos}</span>
                            <span className="text-[13px] leading-[1] font-tabular-nums">{player.n}</span>
                          </>
                        ) : (
                          <span className="text-[13px] font-semibold">{slotKey.substring(0, 2)}</span>
                        )}
                      </div>

                      <div className="text-center max-w-[90px]">
                        <div
                          className={`text-[11.5px] font-heading font-semibold truncate px-[6px] py-[2px] rounded-[6px] ${
                            player
                              ? 'bg-[rgba(0,0,0,0.6)] text-white'
                              : 'bg-[rgba(0,0,0,0.3)] text-[rgba(255,255,255,0.6)]'
                          }`}
                        >
                          {player ? player.name.split(' ').pop() : 'Empty'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Squad Selection Panel (5 cols) */}
          <div className="lg:col-span-5 rounded-[20px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-3)] flex flex-col gap-[18px]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-[16px]">Select Player</h2>
                {selectedSlot && (
                  <span className="text-[11.5px] font-heading font-semibold px-[8px] py-[2px] rounded-[6px] bg-[var(--accent-surface)] text-[var(--accent-text-strong)]">
                    Target: {selectedSlot}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-muted)] mt-[2px]">
                Click any slot on the pitch then click a player to assign.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-[10px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squad..."
                className="h-[40px] px-[12px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)]"
              />

              <div className="flex gap-[6px]">
                {["All", "GK", "DF", "MF", "FW"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPosFilter(p)}
                    className={`h-[28px] px-[10px] rounded-full text-[11px] font-heading font-semibold transition-colors cursor-pointer ${
                      posFilter === p
                        ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]'
                        : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Player List */}
            <div className="divide-y divide-[var(--surface-border)] max-h-[380px] overflow-y-auto pr-[4px]">
              {filteredSquad.map((player) => {
                const assignedSlot = Object.keys(picks).find((k) => picks[k] === player.id);

                return (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerSelect(player.id)}
                    className={`py-[10px] px-[8px] rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      assignedSlot ? 'bg-[var(--accent-surface)]/60' : 'hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-[10px]">
                      <span className="w-[28px] h-[28px] rounded-full bg-[var(--surface-subtle)] font-heading font-bold text-[11px] grid place-items-center text-[var(--text-secondary)]">
                        {player.n}
                      </span>
                      <div>
                        <div className="font-heading font-semibold text-[13px]">{player.name}</div>
                        <div className="text-[10.5px] text-[var(--text-muted)]">{player.pos}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-[8px]">
                      {assignedSlot ? (
                        <span className="text-[10px] font-heading font-bold px-[6px] py-[2px] rounded-[4px] bg-[var(--color-brand)] text-white">
                          {assignedSlot}
                        </span>
                      ) : (
                        <span className="text-[11px] font-heading font-semibold text-[var(--text-link)] opacity-0 group-hover:opacity-100 hover:underline">
                          + Pick
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
