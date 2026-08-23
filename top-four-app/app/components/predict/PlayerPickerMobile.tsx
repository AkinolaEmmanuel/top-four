'use client';

import Link from 'next/link';

export function PlayerPickerMobile({
  theme, MARKET, CLUB, searching, ds, termIcon, TERM, isTerminal, isReady,
  chips, isLoading, groups, pickedPlayer, setDataState, searchIcon
}: any) {
  
  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_14px] flex-none">
        <div className="flex items-center gap-[11px]">
          <Link href="/predict/fixture/ARS" className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px]">{MARKET[0]}</div>
            <div className="flex items-center gap-[7px] mt-[5px]">
              <span className="tf-crest w-[15px] h-[16px] text-[5.5px]" style={{ background: CLUB.ARS }}>ARS</span>
              <span className="tf-crest w-[15px] h-[16px] text-[5.5px]" style={{ background: CLUB.CHE }}>CHE</span>
              <span className="text-[10.5px] text-[var(--nav-text-faint)]">Arsenal v Chelsea · locks in 2h 15m</span>
            </div>
          </div>
          <div className="tf-num font-heading font-bold text-[15px] text-[var(--nav-accent)] flex-none">{MARKET[1]}</div>
        </div>

        <div className="h-[42px] rounded-[11px] bg-[rgba(255,255,255,0.08)] border border-[var(--nav-border)] flex items-center gap-[9px] px-[12px] mt-[13px]">
          <span className="text-[var(--nav-text-faint)] grid place-items-center">{searchIcon}</span>
          <input 
            type="text"
            placeholder="Search this match’s squads"
            value={searching || ds === "noresults" ? "rodri" : ""}
            readOnly
            className="flex-1 text-[13px] bg-transparent outline-none border-none text-[var(--nav-text)] placeholder-[var(--nav-text-faint)]"
          />
          {(searching || ds === "noresults") && (
            <span onClick={() => setDataState('live')} className="text-[12px] text-[var(--nav-text-quiet)] cursor-pointer">✕</span>
          )}
        </div>
      </header>

      {isReady && (
        <div className="tf-scroll flex-none flex gap-[6px] overflow-x-auto p-[11px_var(--gutter)] bg-[var(--surface-canvas)] border-b border-[var(--surface-border)]">
          {chips.map((c: any, i: number) => (
            <div key={i} onClick={c.pick} className={c.style}>{c.label}</div>
          ))}
        </div>
      )}

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {isLoading && (
          <div className="p-[16px_var(--gutter)] flex flex-col gap-[19px]">
            {[{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }, { w: "44%" }, { w: "58%" }].map((s, i) => (
              <div key={i} className="flex items-center gap-[12px]">
                <div className="w-[22px]"><div className="h-[13px] rounded-[4px] bg-[var(--surface-subtle)]"></div></div>
                <div className="w-[34px] h-[34px] rounded-full bg-[var(--surface-subtle)] flex-none"></div>
                <div className="flex-1 flex flex-col gap-[7px]">
                  <div className="h-[13px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="w-[38%] h-[9px] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isTerminal && (
          <div className="p-[60px_30px] flex flex-col items-center text-center">
            <div style={{ color: TERM[1] as string }}>{termIcon}</div>
            <div className="font-heading font-bold text-[20px] leading-[1.2] tracking-[-0.4px] mt-[20px]">{TERM[2]}</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[275px]">{TERM[3]}</div>
            <div onClick={() => setDataState('live')} className="tf-tap mt-[22px] h-[46px] px-[20px] border border-[var(--surface-border-strong)] rounded-[12px] bg-[var(--surface-card)] grid place-items-center font-heading font-bold text-[12px]">{TERM[4]}</div>
          </div>
        )}

        {isReady && (
          <div>
            {groups.map((g: any, i: number) => (
              <div key={i}>
                <div className="flex items-center gap-[9px] p-[10px_var(--gutter)] bg-[var(--surface-subtle)] sticky top-0 border-b border-[var(--surface-border)]">
                  <span className="tf-crest w-[24px] h-[26px]" style={{ background: g.color }}>{g.code}</span>
                  <span className="tf-kicker text-[var(--text-secondary)]">{g.name}</span>
                  <span className="ml-auto text-[10.5px] text-[var(--text-muted)]">{g.count}</span>
                </div>
                {g.players.map((p: any, j: number) => (
                  <div key={j} onClick={p.pick} className={p.rowStyle}>
                    <span className="min-w-[22px] text-center font-heading font-bold text-[12px] leading-[1] tf-num text-[var(--text-muted)] flex-none">{p.shirt}</span>
                    <div className="w-[34px] h-[34px] rounded-full grid place-items-center font-heading font-bold text-[11px] leading-[1] text-[var(--text-primary)] flex-none" style={{ background: p.tint }}>{p.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className={p.nameStyle}>{p.name}</div>
                      <div className="text-[10.5px] mt-[3px]" style={{ color: p.metaColor }}>{p.meta}</div>
                    </div>
                    <span className={p.markStyle}>{p.mark}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="tf-tap p-[16px] text-center font-heading font-bold text-[11px] tracking-[0.05em] text-[var(--text-link)]">LOAD MORE PLAYERS</div>
          </div>
        )}
      </main>

      <div className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] p-[12px_var(--gutter)_16px]">
        <div className={`flex items-center gap-[11px] p-[9px_11px] rounded-[12px] ${pickedPlayer ? 'bg-[var(--accent-surface)] border border-[var(--color-brand)]' : 'border border-dashed border-[var(--surface-border-strong)]'}`}>
          <span className={`w-[32px] h-[32px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] ${pickedPlayer ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
            {pickedPlayer ? pickedPlayer.initials : "?"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-[650] text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
              {pickedPlayer ? pickedPlayer.name : "Nothing stored yet"}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">
              {pickedPlayer ? "Stored · you can change it until the lock" : "This market scores nothing until you name someone"}
            </div>
          </div>
          <span className={pickedPlayer ? "font-heading font-bold text-[9px] tracking-[0.06em] text-[var(--success-text)] flex-none" : "hidden"}>
            {pickedPlayer ? "SAVED" : ""}
          </span>
        </div>
        <div className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[11px]">{MARKET[2]}</div>
      </div>
    </div>
  );
}
