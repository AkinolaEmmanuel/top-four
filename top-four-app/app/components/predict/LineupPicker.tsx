'use client';

import { useState } from 'react';

export function LineupPicker({ players, onSave, isSaving, initialSelection = [] }: { players: any[], onSave: (lineup: string[]) => void, isSaving: boolean, initialSelection?: string[] }) {
  const [view, setView] = useState<'list' | 'pitch'>('list');
  const [selected, setSelected] = useState<string[]>(initialSelection);

  const togglePlayer = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 11) {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    if (selected.length === 11) {
      onSave(selected);
    }
  };

  const byId: Record<string, any> = {};
  players.forEach((p) => { byId[p.id] = p; });

  const bucketOf = (position: string | null | undefined) => {
    const p = (position || '').toLowerCase();
    if (p.includes('keeper')) return 'GK';
    if (p.includes('defen') || p.includes('back')) return 'DEF';
    if (p.includes('mid')) return 'MID';
    if (p.includes('forward') || p.includes('wing') || p.includes('striker') || p.includes('attack')) return 'FWD';
    return 'MID';
  };

  const selectedPlayers = selected.map((id) => byId[id]).filter(Boolean);
  const rows: Record<'GK' | 'DEF' | 'MID' | 'FWD', any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  selectedPlayers.forEach((p) => { rows[bucketOf(p.position) as 'GK' | 'DEF' | 'MID' | 'FWD'].push(p); });

  const formationLabel = selected.length === 11
    ? `${rows.DEF.length}-${rows.MID.length}-${rows.FWD.length}`
    : null;

  // Attacking third at the top of the pitch, own goal at the bottom.
  const pitchRows: Array<{ key: 'FWD' | 'MID' | 'DEF' | 'GK'; top: string }> = [
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

      <div className="text-[12px] text-[var(--text-secondary)] mb-[16px]">
        {selected.length} / 11 selected
      </div>

      {view === 'pitch' && (
        <div className="text-center mb-[10px]">
          <span className="inline-block px-[10px] py-[3px] rounded-[6px] bg-[var(--surface-canvas)] font-heading font-bold text-[12px]">
            {formationLabel ? `Formation ${formationLabel}` : `Pick ${11 - selected.length} more to see the formation`}
          </span>
        </div>
      )}

      {view === 'list' ? (
        <div className="flex flex-col gap-[8px] max-h-[300px] overflow-y-auto pr-[8px] tf-scroll">
          {players.map((p) => {
            const isSel = selected.includes(p.id);
            return (
              <div 
                key={p.id} 
                onClick={() => togglePlayer(p.id)}
                className={`flex items-center gap-[12px] p-[12px] rounded-[8px] border cursor-pointer transition-colors ${isSel ? 'border-[var(--color-brand)] bg-[rgba(var(--color-brand-rgb),0.1)]' : 'border-[var(--surface-border)] bg-[var(--surface-canvas)]'}`}
              >
                <div className={`w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center ${isSel ? 'border-[var(--color-brand)] bg-[var(--color-brand)]' : 'border-[var(--text-muted)]'}`}>
                  {isSel && <div className="w-[6px] h-[6px] bg-[var(--tf-white)] rounded-full" />}
                </div>
                <div className="font-heading font-semibold text-[13px]">{p.displayName}</div>
                <div className="ml-auto text-[11px] text-[var(--text-muted)]">{p.position || 'Player'}</div>
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
              Pick 11 players in List view to see them on the pitch
            </div>
          )}
        </div>
      )}

      <button 
        onClick={handleSave}
        disabled={selected.length !== 11 || isSaving}
        className="mt-[20px] w-full h-[46px] rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)] font-heading font-bold text-[14px] disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Lineup'}
      </button>
    </div>
  );
}
