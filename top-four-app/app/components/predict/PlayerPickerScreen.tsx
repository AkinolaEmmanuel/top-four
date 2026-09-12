'use client';

import Link from 'next/link';

// The Desktop context tab bar (Overview/Fixtures/Table/Questions/More) used
// to render as plain, non-navigating divs styled with cursor:pointer and an
// active-tab underline -- it looked exactly like the real per-section nav
// League*Screen pages use elsewhere, but clicking it did nothing. leagueId
// is already available here, so it now navigates for real, matching the
// pattern established on those pages.
export function PlayerPickerScreen({
  theme, MARKET, CLUB, searching, termIcon, TERM, isTerminal, isReady,
  chips, isLoading, groups, pickedPlayer, onRetry, searchIcon, backHref,
  homeCode, awayCode, homeName, awayName, searchQuery, onSearchChange,
  primaryLabel, primaryStyle, primaryAction,
  contextTabs, leagueId, ghostRows, sheetTitle, sheetSub, modalWidth, columnTemplate,
  sideChips, posChips, skeletonCols, storedStyle, storedDotStyle, storedLabel,
  cancelStyle, footNote, leagueName, competitionLabel,
}: any) {

  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_14px] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href={backHref || "/predict"} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px]">{MARKET[0]}</div>
              <div className="flex items-center gap-[7px] mt-[5px]">
                <span className="tf-crest w-[15px] h-[16px] text-[5.5px]" style={{ background: CLUB[homeCode] }}>{homeCode}</span>
                <span className="tf-crest w-[15px] h-[16px] text-[5.5px]" style={{ background: CLUB[awayCode] }}>{awayCode}</span>
                <span className="text-[10.5px] text-[var(--nav-text-faint)]">{homeName} v {awayName}</span>
              </div>
            </div>
            <div className="tf-num font-heading font-bold text-[15px] text-[var(--nav-accent)] flex-none">{MARKET[1]}</div>
          </div>

          <div className="h-[42px] rounded-[11px] bg-[rgba(255,255,255,0.08)] border border-[var(--nav-border)] flex items-center gap-[9px] px-[12px] mt-[13px]">
            <span className="text-[var(--nav-text-faint)] grid place-items-center">{searchIcon}</span>
            <input
              type="text"
              placeholder="Search this match’s squads"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-[13px] bg-transparent outline-none border-none text-[var(--nav-text)] placeholder-[var(--nav-text-faint)]"
            />
            {searching && (
              <span onClick={() => onSearchChange('')} className="text-[12px] text-[var(--nav-text-quiet)] cursor-pointer">✕</span>
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
              <div onClick={onRetry} className="tf-tap mt-[22px] h-[46px] px-[20px] border border-[var(--surface-border-strong)] rounded-[12px] bg-[var(--surface-card)] grid place-items-center font-heading font-bold text-[12px]">{TERM[4]}</div>
            </div>
          )}

          {isReady && (
            <div>
              {groups.mobile.map((g: any, i: number) => (
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
            </div>
          )}
        </main>

        {isReady && (
          <div className="flex-none p-[12px_var(--gutter)_calc(12px+env(safe-area-inset-bottom))] border-t border-[var(--surface-border)] bg-[var(--surface-card)]">
            <div onClick={() => primaryAction?.()} className="tf-tap h-[46px] rounded-[12px] grid place-items-center font-heading font-bold text-[13px]" style={primaryStyle}>{primaryLabel}</div>
          </div>
        )}

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

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
            {competitionLabel && <span className="text-[11px] text-[var(--text-muted)]">{competitionLabel}</span>}
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const route = t.label === 'Overview' ? `/leagues/${leagueId}` : `/leagues/${leagueId}/${t.label.toLowerCase()}`;
              return (
                <Link href={leagueId ? route : '#'} key={i} style={t.style}>{t.label}</Link>
              );
            })}
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
                  <Link href={backHref || "/predict"} className="w-[34px] h-[34px] rounded-full border border-[var(--surface-border-strong)] grid place-items-center text-[14px] text-[var(--text-secondary)] cursor-pointer flex-none hover:bg-[var(--surface-subtle)] transition-colors">×</Link>
                </div>

                <div className="flex items-center gap-[10px] h-[44px] mt-[15px] px-[14px] border border-[var(--surface-border-strong)] rounded-[11px]">
                  <span className="text-[var(--text-muted)] flex-none">{searchIcon}</span>
                  <input
                    type="text"
                    placeholder="Search this match’s squads"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 text-[13px] bg-transparent outline-none border-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                  />
                  {searching && (
                    <span onClick={() => onSearchChange('')} className="text-[12px] text-[var(--text-muted)] cursor-pointer">✕</span>
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
                    <div onClick={onRetry} className="mt-[22px] px-[20px] h-[44px] border border-[var(--surface-border-strong)] rounded-[12px] grid place-items-center font-heading font-bold text-[12px] cursor-pointer">{TERM[4]}</div>
                  </div>
                )}

                {isReady && (
                  <div className="grid gap-[0]" style={{ gridTemplateColumns: columnTemplate }}>
                    {groups.desktop.map((g: any, i: number) => (
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
                  <Link href={backHref || "/predict"} style={cancelStyle}>Cancel</Link>
                  <div onClick={() => primaryAction?.()} style={primaryStyle}>{primaryLabel}</div>
                </div>
                <div className="text-[11px] leading-[1.55] text-[var(--text-muted)] mt-[12px]">{footNote}</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
