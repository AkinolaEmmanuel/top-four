'use client';

import { useState } from 'react';

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2', '5-4-1'];

type Bucket = 'GK' | 'DEF' | 'MID' | 'FWD';

function quotasFor(formation: string): Record<Bucket, number> {
  const [def, mid, fwd] = formation.split('-').map(Number);
  return { GK: 1, DEF: def, MID: mid, FWD: fwd };
}

const BUCKET_LABEL: Record<Bucket, string> = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' };

function bucketOf(position: string | null | undefined): Bucket {
  const p = (position || '').toLowerCase();
  if (p.includes('keeper')) return 'GK';
  if (p.includes('defen') || p.includes('back')) return 'DEF';
  if (p.includes('mid')) return 'MID';
  if (p.includes('forward') || p.includes('wing') || p.includes('striker') || p.includes('attack')) return 'FWD';
  return 'MID';
}

// A previously-saved lineup carries no formation of its own on the wire (just
// 11 player ids), so re-derive the matching preset from the roster's real
// positions instead of forcing the user to re-pick one just to see their own XI.
function deriveFormation(ids: string[], byId: Record<string, any>): string | null {
  if (ids.length !== 11) return null;
  const counts: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const id of ids) {
    const p = byId[id];
    if (!p) return null;
    counts[bucketOf(p.position)]++;
  }
  const label = `${counts.DEF}-${counts.MID}-${counts.FWD}`;
  return FORMATIONS.includes(label) ? label : null;
}

export function LineupPicker({ players, onSave, isSaving, initialSelection = [] }: { players: any[], onSave: (lineup: string[]) => void, isSaving: boolean, initialSelection?: string[] }) {
  const [view, setView] = useState<'list' | 'pitch'>('list');

  const byId: Record<string, any> = {};
  players.forEach((p) => { byId[p.id] = p; });

  const [formation, setFormation] = useState<string | null>(() => deriveFormation(initialSelection, byId));
  const [selected, setSelected] = useState<string[]>(initialSelection);

  const quotas = formation ? quotasFor(formation) : null;

  const selectedPlayers = selected.map((id) => byId[id]).filter(Boolean);
  const counts: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  selectedPlayers.forEach((p) => { counts[bucketOf(p.position)]++; });

  const isComplete = !!quotas && counts.GK === quotas.GK && counts.DEF === quotas.DEF && counts.MID === quotas.MID && counts.FWD === quotas.FWD;

  const togglePlayer = (id: string) => {
    if (!quotas) return;
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
      return;
    }
    const player = byId[id];
    if (!player) return;
    const bucket = bucketOf(player.position);
    if (counts[bucket] >= quotas[bucket]) return;
    setSelected([...selected, id]);
  };

  const handleFormationChange = (next: string) => {
    const nextQuotas = quotasFor(next);
    const running: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    const trimmed: string[] = [];
    for (const id of selected) {
      const p = byId[id];
      if (!p) continue;
      const b = bucketOf(p.position);
      if (running[b] < nextQuotas[b]) {
        running[b]++;
        trimmed.push(id);
      }
    }
    setFormation(next);
    setSelected(trimmed);
  };

  const handleSave = () => {
    if (isComplete) onSave(selected);
  };

  const rows: Record<Bucket, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  selectedPlayers.forEach((p) => { rows[bucketOf(p.position)].push(p); });

  const pitchRows: Array<{ key: Bucket; top: string }> = [
    { key: 'FWD', top: '13%' },
    { key: 'MID', top: '40%' },
    { key: 'DEF', top: '67%' },
    { key: 'GK', top: '90%' },
  ];

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border-strong)] rounded-[12px] p-[16px] mt-[16px]">
      <div className="flex justify-between items-center mb-[16px]">
        <div className="font-heading font-bold text-[14px]">Starting XI</div>
        <div className="flex gap-[8px] bg-[var(--surface-canvas)] p-[4px] rounded-[8px]">
          <button
            className={`px-[12px] py-[4px] rounded-[4px] text-[12px] font-heading font-semibold ${view === 'list' ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            className={`px-[12px] py-[4px] rounded-[4px] text-[12px] font-heading font-semibold ${view === 'pitch' ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
            onClick={() => setView('pitch')}
          >
            Pitch
          </button>
        </div>
      </div>

      <div className="mb-[16px]">
        <div className="text-[11px] font-heading font-semibold text-[var(--text-muted)] mb-[8px]">
          {formation ? 'Formation' : 'Choose a formation to start picking'}
        </div>
        <div className="flex flex-wrap gap-[6px]">
          {FORMATIONS.map((f) => (
            <div
              key={f}
              onClick={() => handleFormationChange(f)}
              className={`cursor-pointer px-[11px] py-[6px] rounded-[7px] text-[12px] font-heading font-bold border ${formation === f ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white' : 'border-[var(--surface-border)] text-[var(--text-secondary)]'}`}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {quotas && (
        <div className="flex flex-wrap gap-[10px] text-[11.5px] text-[var(--text-secondary)] mb-[16px]">
          {(['GK', 'DEF', 'MID', 'FWD'] as Bucket[]).map((b) => (
            <span key={b} className={counts[b] === quotas[b] ? 'text-[var(--color-brand)] font-semibold' : ''}>
              {BUCKET_LABEL[b]} {counts[b]}/{quotas[b]}
            </span>
          ))}
        </div>
      )}

      {view === 'pitch' && (
        <div className="text-center mb-[10px]">
          <span className="inline-block px-[10px] py-[3px] rounded-[6px] bg-[var(--surface-canvas)] font-heading font-bold text-[12px]">
            {formation ? `Formation ${formation}` : 'Pick a formation first'}
          </span>
        </div>
      )}

      {view === 'list' ? (
        <div className="flex flex-col gap-[8px] max-h-[300px] overflow-y-auto pr-[8px] tf-scroll">
          {!quotas && (
            <div className="text-[12px] text-[var(--text-muted)] italic p-[8px_2px]">Pick a formation above before choosing players.</div>
          )}
          {players.map((p) => {
            const isSel = selected.includes(p.id);
            const bucket = bucketOf(p.position);
            const bucketFull = !!quotas && counts[bucket] >= quotas[bucket];
            const disabled = !quotas || (!isSel && bucketFull);
            return (
              <div
                key={p.id}
                onClick={() => !disabled && togglePlayer(p.id)}
                className={`flex items-center gap-[12px] p-[12px] rounded-[8px] border transition-colors ${disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${isSel ? 'border-[var(--color-brand)] bg-[rgba(var(--color-brand-rgb),0.1)]' : 'border-[var(--surface-border)] bg-[var(--surface-canvas)]'}`}
              >
                <div className={`w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center ${isSel ? 'border-[var(--color-brand)] bg-[var(--color-brand)]' : 'border-[var(--text-muted)]'}`}>
                  {isSel && <div className="w-[6px] h-[6px] bg-[var(--tf-white)] rounded-full" />}
                </div>
                <div className="font-heading font-semibold text-[13px]">{p.displayName}</div>
                <div className="ml-auto text-[11px] text-[var(--text-muted)]">
                  {p.position || 'Player'}{!isSel && bucketFull ? ' · slot full' : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative w-full aspect-[2/3] bg-[#2a8b38] rounded-[8px] border-2 border-[rgba(255,255,255,0.3)] overflow-hidden select-none">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {/* Simple pitch markings */}
            <div className="absolute top-[50%] left-0 w-full h-[2px] bg-white transform -translate-y-[50%]"></div>
            <div className="absolute top-[50%] left-[50%] w-[60px] h-[60px] border-[2px] border-white rounded-full transform -translate-x-[50%] -translate-y-[50%]"></div>
            <div className="absolute top-0 left-[50%] w-[100px] h-[60px] border-[2px] border-t-0 border-white transform -translate-x-[50%]"></div>
            <div className="absolute bottom-0 left-[50%] w-[100px] h-[60px] border-[2px] border-b-0 border-white transform -translate-x-[50%]"></div>
          </div>

          {selected.length > 0 ? (
            pitchRows.map(({ key, top }) => {
              const rowPlayers = rows[key];
              if (rowPlayers.length === 0) return null;
              return (
                <div
                  key={key}
                  className="absolute left-0 right-0 z-10 flex justify-evenly px-[10px]"
                  style={{ top }}
                >
                  {rowPlayers.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => togglePlayer(p.id)}
                      className="cursor-pointer flex flex-col items-center gap-[3px] transition-transform hover:scale-105"
                    >
                      <div className="w-[30px] h-[30px] rounded-full bg-white text-black grid place-items-center font-heading font-bold text-[11px] shadow-md border-2 border-[var(--color-brand)]">
                        {p.shirtNumber ?? ''}
                      </div>
                      <div className="px-[6px] py-[1px] rounded-[4px] bg-black/60 text-white text-[9.5px] font-semibold whitespace-nowrap max-w-[74px] overflow-hidden text-ellipsis">
                        {p.displayName.split(' ').pop()}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="relative z-10 w-full h-full grid place-items-center text-white/70 text-[12px] font-heading font-semibold">
              {formation ? 'Pick players in List view to see them on the pitch' : 'Pick a formation and players in List view first'}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!isComplete || isSaving}
        className="mt-[20px] w-full h-[46px] rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)] font-heading font-bold text-[14px] disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Lineup'}
      </button>
    </div>
  );
}
