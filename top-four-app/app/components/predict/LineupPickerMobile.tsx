import React, { useState } from 'react';

const CLUB = { ARS: "#c8182f" };
const SQUAD = [
 {id:"raya",name:"D. Raya",n:1,pos:"GK"},
 {id:"hein",name:"K. Hein",n:31,pos:"GK"},
 {id:"white",name:"B. White",n:4,pos:"DF"},
 {id:"saliba",name:"W. Saliba",n:2,pos:"DF"},
 {id:"gabriel",name:"G. Magalhães",n:6,pos:"DF"},
 {id:"calafiori",name:"R. Calafiori",n:33,pos:"DF"},
 {id:"timber",name:"J. Timber",n:12,pos:"DF"},
 {id:"tomiyasu",name:"T. Tomiyasu",n:18,pos:"DF"},
 {id:"kiwior",name:"K. Kiwior",n:15,pos:"DF"},
 {id:"lewis",name:"M. Lewis-Skelly",n:49,pos:"DF"},
 {id:"rice",name:"D. Rice",n:41,pos:"MF"},
 {id:"odegaard",name:"M. Ødegaard",n:8,pos:"MF"},
 {id:"partey",name:"T. Partey",n:5,pos:"MF"},
 {id:"merino",name:"J. Merino",n:23,pos:"MF"},
 {id:"nwaneri",name:"E. Nwaneri",n:53,pos:"MF"},
 {id:"saka",name:"B. Saka",n:7,pos:"FW"},
 {id:"havertz",name:"K. Havertz",n:29,pos:"FW"},
 {id:"martinelli",name:"G. Martinelli",n:11,pos:"FW"},
 {id:"trossard",name:"L. Trossard",n:19,pos:"FW"},
 {id:"jesus",name:"G. Jesus",n:9,pos:"FW"}
];

const SHAPES: Record<string, number[]> = {"4-3-3":[4,3,3],"4-4-2":[4,4,2],"3-5-2":[3,5,2],"5-3-2":[5,3,2]};

export function LineupPickerMobile({ onSave, onBack }: { onSave: (picks: any) => void, onBack: () => void }) {
  const [formation, setFormation] = useState("4-3-3");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [sheetTarget, setSheetTarget] = useState<string | null>(null);

  const slotKeys = () => {
    const [d,m,f] = SHAPES[formation];
    const keys = ["GK0"];
    for(let i=0; i<d; i++) keys.push("DF"+i);
    for(let i=0; i<m; i++) keys.push("MF"+i);
    for(let i=0; i<f; i++) keys.push("FW"+i);
    return keys;
  };

  const getRows = () => {
    const keys = slotKeys();
    const rowsMap = {
      GK: keys.filter(k => k.startsWith("GK")),
      DF: keys.filter(k => k.startsWith("DF")),
      MF: keys.filter(k => k.startsWith("MF")),
      FW: keys.filter(k => k.startsWith("FW"))
    };
    
    return [rowsMap.FW, rowsMap.MF, rowsMap.DF, rowsMap.GK].map((rowKeys, idx) => {
      const slots = rowKeys.map(k => {
        const playerId = picks[k];
        const player = playerId ? SQUAD.find(p => p.id === playerId) : null;
        return {
          key: k,
          name: player ? player.name.split('. ').pop() : 'Empty',
          initials: player ? player.name.charAt(0) : '+',
          pos: k.substring(0, 2),
          hasPlayer: !!player
        };
      });
      return { id: idx, slots };
    });
  };

  const currentCount = Object.keys(picks).length;
  const isComplete = currentCount === 11;

  const handleSlotTap = (key: string) => {
    setSheetTarget(key);
  };

  const handlePickPlayer = (playerId: string) => {
    if (sheetTarget) {
      setPicks(prev => ({ ...prev, [sheetTarget]: playerId }));
    }
    setSheetTarget(null);
  };

  const handleSave = () => {
    if (isComplete) {
      onSave(picks);
    }
  };

  const availableSquad = SQUAD.filter(p => !Object.values(picks).includes(p.id));

  return (
    <div className="flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] font-['Sora',sans-serif] relative text-[var(--text-primary)]">
      
      {/* Header */}
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_12px] flex-none z-10">
        <div className="flex items-center gap-[11px]">
          <div onClick={onBack} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">{"<"}</div>
          <span className="tf-crest w-[30px] h-[32px] text-[9px] bg-[#c8182f] flex-none">ARS</span>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[15px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">Arsenal Lineup</div>
          </div>
          <div className="text-right flex-none">
            <div className={`tf-num font-heading font-bold text-[22px] leading-none tracking-[-0.8px] ${isComplete ? 'text-[var(--nav-positive)]' : 'text-[var(--nav-warning)]'}`}>{currentCount}</div>
            <div className="font-heading font-semibold text-[8.5px] tracking-[0.09em] text-[var(--nav-text-faint)] mt-[4px]">PICKED</div>
          </div>
        </div>

        <div className="flex items-center gap-[8px] mt-[12px]">
          <span className={`w-[6px] h-[6px] rounded-full flex-none ${isComplete ? 'bg-[var(--nav-positive)]' : 'bg-[var(--nav-warning)]'}`}></span>
          <span className={`tf-kicker ${isComplete ? 'text-[var(--nav-positive)]' : 'text-[var(--nav-warning)]'}`}>{isComplete ? 'READY TO SAVE' : 'NEEDS 11'}</span>
        </div>
      </header>

      {/* Pitch Area */}
      <div className="flex-1 relative overflow-hidden bg-[var(--pitch-surface)]">
        {/* Pitch Lines (simplified for MVP) */}
        <div className="absolute left-[16px] right-[16px] top-[16px] bottom-[16px] border border-[var(--pitch-line)]"></div>
        <div className="absolute left-[16px] right-[16px] top-[50%] h-[1px] bg-[var(--pitch-line)]"></div>
        
        <div className="relative h-full p-[18px_12px] flex flex-col justify-between">
          {getRows().map(row => (
            <div key={row.id} className="flex justify-center gap-[12px]">
              {row.slots.map(slot => (
                <div key={slot.key} onClick={() => handleSlotTap(slot.key)} className="flex flex-col items-center gap-[6px] cursor-pointer w-[48px]">
                  <div className={`w-[36px] h-[36px] rounded-full border-[1.5px] grid place-items-center font-heading font-bold text-[14px] ${slot.hasPlayer ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-on-brand)]' : 'bg-[var(--pitch-slot-empty)] border-[var(--pitch-slot-empty-border)] text-[var(--pitch-slot-empty-text)]'}`}>
                    {slot.initials}
                  </div>
                  <div className={`text-[10px] whitespace-nowrap ${slot.hasPlayer ? 'text-[var(--text-primary)] font-[650]' : 'text-[var(--text-secondary)]'}`}>
                    {slot.name}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Save */}
      <div className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] p-[12px_var(--gutter)_16px]">
        {isComplete ? (
          <div onClick={handleSave} className="h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">
            Save lineup
          </div>
        ) : (
          <div className="h-[48px] rounded-[13px] bg-[var(--surface-subtle)] text-[var(--text-muted)] grid place-items-center font-heading font-bold text-[13.5px]">
            Pick {11 - currentCount} more
          </div>
        )}
      </div>

      {/* Squad Sheet */}
      {sheetTarget && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetTarget(null)}></div>
          <div className="relative bg-[var(--surface-card)] h-[70vh] rounded-t-[18px] border-t border-[var(--surface-border-strong)] flex flex-col animate-[tfsheet_0.18s_ease]">
            <div className="flex-none p-[11px_var(--gutter)_12px] border-b border-[var(--surface-border)]">
              <div className="w-[34px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[11px]"></div>
              <div className="flex items-center gap-[10px]">
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-[650] text-[15px] tracking-[-0.3px]">Squad</div>
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">Select a player for {sheetTarget}</div>
                </div>
                <div onClick={() => setSheetTarget(null)} className="w-[32px] h-[32px] rounded-full border border-[var(--surface-border-strong)] grid place-items-center text-[14px] text-[var(--text-secondary)]">X</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-[0_var(--gutter)]">
              {availableSquad.filter(p => sheetTarget.startsWith(p.pos)).length > 0 ? (
                availableSquad.filter(p => sheetTarget.startsWith(p.pos)).map(p => (
                  <div key={p.id} onClick={() => handlePickPlayer(p.id)} className="flex items-center gap-[12px] py-[12px] border-b border-[var(--surface-border)] cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{p.name}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[2px]">{p.pos} • #{p.n}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[12px] text-[var(--text-muted)] text-center py-[20px]">No more available {sheetTarget.substring(0,2)}s.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
