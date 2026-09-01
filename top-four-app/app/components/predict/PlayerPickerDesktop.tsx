'use client';

import Link from 'next/link';

export function PlayerPickerDesktop({
  theme, MARKET, CLUB, searching, ds, termIcon, TERM, isTerminal, isReady,
  chips, isLoading, groups, pickedPlayer, setDataState, searchIcon,
  contextTabs, rootNav, ghostRows, sheetTitle, sheetSub, modalWidth, columnTemplate,
  sideChips, posChips, skeletonCols, storedStyle, storedDotStyle, storedLabel,
  cancelStyle, primaryStyle, primaryLabel, footNote, leagueName, competitionLabel
}: any) {
  
  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      
      

      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px]">
          <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
          {competitionLabel && <span className="text-[11px] text-[var(--text-muted)]">{competitionLabel}</span>}
        </div>
        <div className="flex items-center gap-[2px] ml-auto">
          {contextTabs.map((t: any, i: number) => (
            <div key={i} style={t.style}>{t.label}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden p-[24px]" style={{ filter: 'blur(1px)' }}>
          <div className="max-w-[1032px] mx-auto grid grid-cols-2 gap-[14px]">
            {ghostRows.map((g: any, i: number) => (
              <div key={i} className="tf-card p-[16px_18px] flex items-center justify-between opacity-55">
                <span className="font-heading font-semibold text-[13.5px]">{g.label}</span>
                <span className="text-[12.5px] text-[var(--text-muted)]">{g.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-[var(--scrim)] grid place-items-center p-[26px]">
          <div className="tf-card flex flex-col overflow-hidden shadow-[var(--elev-4)] animate-[tfmodal_0.18s_ease]" style={{ width: modalWidth, maxHeight: '740px' }}>
            
            <div className="flex-none p-[20px_22px_15px] border-b border-[var(--surface-border)]">
              <div className="flex items-start gap-[14px]">
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.35px]">{sheetTitle}</div>
                  <div className="text-[12.5px] text-[var(--text-secondary)] mt-[5px]">{sheetSub}</div>
                </div>
                <Link href="/predict/fixture/ARS" className="w-[34px] h-[34px] rounded-full border border-[var(--surface-border-strong)] grid place-items-center text-[14px] text-[var(--text-secondary)] cursor-pointer flex-none hover:bg-[var(--surface-subtle)] transition-colors">×</Link>
              </div>

              <div className="flex items-center gap-[10px] h-[44px] mt-[15px] px-[14px] border border-[var(--surface-border-strong)] rounded-[11px]">
                <span className="text-[var(--text-muted)] flex-none">{searchIcon}</span>
                <input 
                  type="text"
                  placeholder="Search this match’s squads"
                  value={searching || ds === "noresults" ? "rodri" : ""}
                  readOnly
                  className="flex-1 text-[13px] bg-transparent outline-none border-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                />
                {(searching || ds === "noresults") && (
                  <span onClick={() => setDataState('live')} className="text-[12px] text-[var(--text-muted)] cursor-pointer">✕</span>
                )}
              </div>

              <div className="flex flex-wrap gap-[7px] mt-[12px]">
                {sideChips.map((c: any, i: number) => (
                  <div key={i} onClick={c.pick} className={c.cls}>{c.label}</div>
                ))}
                <span className="w-[1px] h-[32px] bg-[var(--surface-border)] mx-[2px]"></span>
                {posChips.map((c: any, i: number) => (
                  <div key={i} onClick={c.pick} className={c.cls}>{c.label}</div>
                ))}
              </div>
            </div>

            <div className="tf-scroll flex-1 overflow-y-auto min-h-[280px]">
              {isLoading && (
                <div className="p-[18px_22px] grid gap-[22px]" style={{ gridTemplateColumns: columnTemplate }}>
                  {skeletonCols.map((col: any, i: number) => (
                    <div key={i} className="flex flex-col gap-[14px]">
                      {col.rows.map((s: any, j: number) => (
                        <div key={j} className="flex items-center gap-[11px]">
                          <div className="w-[34px] h-[34px] rounded-full bg-[var(--surface-subtle)] flex-none"></div>
                          <div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {isTerminal && (
                <div className="p-[64px_40px] flex flex-col items-center text-center">
                  <div style={{ color: TERM[1] as string }}>{termIcon}</div>
                  <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.3px] mt-[18px]">{TERM[2]}</div>
                  <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[480px]">{TERM[3]}</div>
                  <div onClick={() => setDataState('live')} className="mt-[22px] px-[20px] h-[44px] border border-[var(--surface-border-strong)] rounded-[12px] grid place-items-center font-heading font-bold text-[12px] cursor-pointer">{TERM[4]}</div>
                </div>
              )}

              {isReady && (
                <div className="grid gap-[0]" style={{ gridTemplateColumns: columnTemplate }}>
                  {groups.map((g: any, i: number) => (
                    <div key={i} style={g.colStyle}>
                      <div className="sticky top-0 z-[1] flex items-center gap-[10px] p-[11px_20px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]">
                        <span className="w-[22px] h-[22px] rounded-[6px] grid place-items-center font-heading font-bold text-[8.5px] text-[var(--tf-white)] flex-none" style={{ background: g.color }}>{g.code}</span>
                        <span className="font-heading font-bold text-[12.5px] flex-1">{g.name}</span>
                        <span className="text-[10.5px] text-[var(--text-muted)]">{g.count}</span>
                      </div>
                      {g.players.map((p: any, j: number) => (
                        <div key={j} onClick={p.pick} style={p.rowStyle}>
                          <span className="w-[22px] text-right font-heading font-semibold text-[11px] text-[var(--text-muted)] font-tabular-nums flex-none">{p.shirt}</span>
                          <div style={p.badgeStyle}>{p.initials}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-heading font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{p.name}</div>
                            <div className="text-[10.5px] mt-[2px]" style={{ color: p.metaColor }}>{p.meta}</div>
                          </div>
                          <span style={p.markStyle}>{p.mark}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-none border-t border-[var(--surface-border)] p-[15px_22px_18px]">
              <div className="flex items-center gap-[16px]">
                <div className="flex-1"></div>
                <div style={storedStyle}>
                  <span style={storedDotStyle}></span>
                  <span>{storedLabel}</span>
                </div>
                <Link href="/predict/fixture/ARS" style={cancelStyle}>Cancel</Link>
                <Link href="/predict/fixture/ARS" style={primaryStyle}>{primaryLabel}</Link>
              </div>
              <div className="text-[11px] leading-[1.55] text-[var(--text-muted)] mt-[12px]">{footNote}</div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
