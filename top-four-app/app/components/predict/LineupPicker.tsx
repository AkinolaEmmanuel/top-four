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
        <div className="relative w-full aspect-[2/3] bg-[#2a8b38] rounded-[8px] border-2 border-[rgba(255,255,255,0.3)] p-[8px] overflow-hidden select-none flex flex-wrap gap-[4px] content-start">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {/* Simple pitch markings */}
            <div className="absolute top-[50%] left-0 w-full h-[2px] bg-white transform -translate-y-[50%]"></div>
            <div className="absolute top-[50%] left-[50%] w-[60px] h-[60px] border-[2px] border-white rounded-full transform -translate-x-[50%] -translate-y-[50%]"></div>
            <div className="absolute top-0 left-[50%] w-[100px] h-[60px] border-[2px] border-t-0 border-white transform -translate-x-[50%]"></div>
            <div className="absolute bottom-0 left-[50%] w-[100px] h-[60px] border-[2px] border-b-0 border-white transform -translate-x-[50%]"></div>
          </div>
          
          <div className="relative z-10 w-full flex flex-col justify-around h-full">
            {/* Since we don't have formation data, just render them in a rough grid, or a list style overlay */}
            <div className="flex flex-wrap justify-center gap-[10px]">
              {players.map((p) => {
                const isSel = selected.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={`cursor-pointer px-[8px] py-[4px] rounded-[4px] text-[10px] font-bold shadow-md transition-transform ${isSel ? 'bg-[var(--color-brand)] text-white scale-110' : 'bg-white text-black bg-opacity-80'}`}
                  >
                    {p.displayName.split(' ').pop()}
                  </div>
                );
              })}
            </div>
          </div>
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
