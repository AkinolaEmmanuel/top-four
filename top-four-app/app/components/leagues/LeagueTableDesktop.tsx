'use client';

import Link from 'next/link';

export function LeagueTableDesktop({
  theme, rootNav, contextTabs, params, st, isLoading, isEmpty, isFinal, showRows,
  heroStyle, myPos, myPosLabel, myPoints, neighbours, pageLabel,
  refreshing, refresh, nudge, isReady,
  listRef, cols, legend, skeletons, rows, tiebreakers, showTies,
  hasStanding, selfPos, selfMove, selfCells, prevPage, nextPage,
  prevStyle, nextStyle, prevLabel, nextLabel, jumpToMe
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[22px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px]">
          <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
          <span className="text-[11px] text-[var(--text-muted)]">128 members</span>
          <span className="text-[9px] text-[var(--text-muted)] cursor-pointer">▾</span>
        </div>
        <div className="flex items-center gap-[2px] ml-auto">
          {contextTabs.map((t: any, i: number) => {
            const route = t.label === 'Overview' ? `/leagues/${params.id}` : `/leagues/${params.id}/${t.label.toLowerCase()}`;
            return (
              <Link href={route} key={i} style={t.style}>{t.label}</Link>
            );
          })}
        </div>
      </div>

      {hasStanding && (
        <div style={heroStyle}>
          <div className="max-w-[1080px] mx-auto px-[24px] flex items-end gap-[34px]">
            <div className="flex-none">
              <div className="font-heading font-bold text-[10px] tracking-[0.09em] uppercase text-[var(--nav-text-faint)]">{myPosLabel}</div>
              <div className="flex items-baseline gap-[15px] mt-[12px]">
                <span className="font-heading font-bold text-[78px] leading-[0.8] tracking-[-3.6px] font-tabular-nums">{myPos}</span>
                <span className="font-heading font-bold text-[25px] leading-[1] tracking-[-1px] font-tabular-nums text-[var(--nav-text-quiet)]">{myPoints}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0 pb-[7px] flex flex-col gap-[7px]">
              {neighbours.map((n: any, i: number) => (
                <div key={i} className="flex items-baseline gap-[9px] text-[12.5px] text-[var(--nav-text-faint)]">
                  <span style={n.deltaStyle}>{n.delta}</span>
                  <span>{n.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex-none flex flex-col items-end gap-[11px] pb-[7px]">
              <div onClick={jumpToMe} className="h-[38px] px-[16px] rounded-[10px] bg-[var(--nav-fill)] text-[var(--nav-text)] grid place-items-center font-heading font-bold text-[11px] tracking-[0.05em] cursor-pointer">JUMP TO MY ROW</div>
              <div className="text-[11px] text-[var(--nav-text-faint)]">{pageLabel} · updated moments ago</div>
            </div>
          </div>
        </div>
      )}

      {refreshing && (
        <div className="flex-none bg-[var(--accent-surface)] border-b border-[var(--accent-border)]">
          <div className="max-w-[1080px] mx-auto p-[11px_24px] flex items-center gap-[12px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-brand)] flex-none"></span>
            <div className="flex-1 text-[12.5px] leading-[1.4] text-[var(--accent-text)]">Positions have moved since you opened this.</div>
            <div onClick={refresh} className="flex-none font-heading font-bold text-[11px] tracking-[0.05em] text-[var(--text-link)] cursor-pointer">REFRESH</div>
          </div>
        </div>
      )}

      {isFinal && (
        <div className="flex-none bg-[var(--nav-surface-2)] text-[var(--nav-text)] border-t border-[rgba(255,255,255,0.1)]">
          <div className="max-w-[1080px] mx-auto p-[15px_24px] flex items-center gap-[13px]">
            <span className="w-[30px] h-[30px] rounded-full bg-[var(--color-crown)] flex-none"></span>
            <div className="flex-1 flex flex-col gap-[3px]">
              <span className="font-heading font-bold text-[15px]">Yemi wins</span>
              <span className="text-[11.5px] text-[var(--nav-text-faint)]">1,340 points · 128 members · predictions are now history</span>
            </div>
          </div>
        </div>
      )}

      <div className="tf-scroll flex-1 overflow-y-auto" ref={listRef}>
        <div className="max-w-[1080px] mx-auto px-[24px] flex flex-col">
          
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex items-center gap-[14px] p-[11px_4px] bg-[var(--surface-canvas)] border-b border-[var(--surface-border-strong)]">
              <span className="w-[44px] flex-none text-[10px] tracking-[0.08em] uppercase text-[var(--text-muted)]">Pos</span>
              <span className="w-[36px] flex-none"></span>
              <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--text-muted)]">Member</span>
              <div className="flex-1 min-w-0 flex items-center gap-[13px] pl-[4px]">
                {legend.map((l: any, i: number) => (
                  <span key={i} className="flex items-center gap-[5px]">
                    <span style={l.dotStyle}></span>
                    <span className="text-[10px] text-[var(--text-muted)]">{l.label}</span>
                  </span>
                ))}
              </div>
              {cols.map((c: any, i: number) => (
                <span key={i} style={c.style}>{c.label}</span>
              ))}
              <span className="w-[80px] flex-none text-right text-[10px] tracking-[0.08em] uppercase text-[var(--text-muted)]">Points</span>
              <span className="w-[20px] flex-none"></span>
            </div>

            {isLoading && skeletons.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-[14px] px-[4px] h-[54px] border-b border-[var(--surface-border)]">
                <div className="w-[44px] flex-none"><div className="w-[20px] h-[11px] rounded-full bg-[var(--surface-subtle)]"></div></div>
                <div className="w-[36px] h-[36px] rounded-full bg-[var(--surface-subtle)] flex-none"></div>
                <div className="flex-1 min-w-0"><div style={s.nameStyle}></div></div>
                {s.cells.map((c: any, j: number) => (
                  <div key={j} className="w-[92px] flex-none flex justify-end"><div style={c}></div></div>
                ))}
                <div className="w-[80px] flex-none flex justify-end"><div className="w-[44px] h-[11px] rounded-full bg-[var(--surface-subtle)]"></div></div>
                <span className="w-[20px] flex-none"></span>
              </div>
            ))}

            {isEmpty && (
              <div className="p-[70px_30px] flex flex-col gap-[9px] items-center text-center">
                <div className="font-heading font-semibold text-[17px]">Nobody has scored yet</div>
                <div className="text-[13px] text-[var(--text-secondary)] leading-[1.55] max-w-[420px]">Everyone is on zero until the first fixture settles. All 128 members are listed in join order.</div>
              </div>
            )}

            {showRows && (
              <div className="flex flex-col">
                {rows.map((r: any, i: number) => (
                  <div key={i} ref={r.ref} style={r.wrapStyle}>
                    <div onClick={r.toggle} className="flex items-center gap-[14px] px-[4px] h-[54px] cursor-pointer">
                      <div className="w-[44px] flex-none flex items-baseline gap-[2px]">
                        <span className="font-heading font-bold text-[14.5px] font-tabular-nums">{r.pos}</span>
                        <span style={r.tieStyle}>=</span>
                      </div>
                      <div style={r.avatarStyle}>{r.initials}</div>
                      <div className="flex-1 flex items-center gap-[8px] min-w-0">
                        <span className="font-heading font-semibold text-[14px] tracking-[-0.1px] whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</span>
                        <span style={r.roleDotStyle}></span>
                        <span style={r.captionStyle}>{r.caption}</span>
                      </div>
                      {r.cells.map((c: any, j: number) => (
                        <span key={j} style={c.style}>{c.value}</span>
                      ))}
                      <span className="w-[80px] flex-none text-right font-heading font-bold text-[15px] font-tabular-nums">{r.points}</span>
                      <span style={r.caretStyle}>⌄</span>
                    </div>
                    {r.open && (
                      <div className="p-[2px_4px_16px_88px] flex items-start gap-[40px] animate-[tfin_0.16s_ease]">
                        <div className="flex flex-col gap-[4px]">
                          <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-muted)]">{r.roleLine}</div>
                          <div className="text-[12px] text-[var(--text-secondary)] leading-[1.5]">{r.note}</div>
                        </div>
                        <div className="flex-1 h-[6px] rounded-full bg-[var(--surface-subtle)] overflow-hidden mt-[16px] max-w-[420px]">
                          <div style={r.barStyle}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasStanding && (
            <div className="sticky bottom-0 bg-[var(--nav-surface-2)] text-[var(--nav-text)] border-t border-[rgba(255,255,255,0.16)]">
              <div className="flex items-center gap-[14px] px-[4px] h-[62px]">
                <div className="w-[44px] flex-none"><span className="font-heading font-bold text-[15px] font-tabular-nums">{selfPos}</span></div>
                <div className="w-[36px] h-[36px] rounded-full bg-[var(--color-brand)] flex justify-center items-center text-[12px] font-heading font-bold text-[var(--color-on-brand)] flex-none">KA</div>
                <div className="flex-1 flex flex-col gap-[3px] min-w-0">
                  <div className="flex items-center gap-[7px]">
                    <span className="font-heading font-bold text-[14px]">Kolade</span>
                    <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_5px] rounded-[4px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">YOU</span>
                    <span className="w-[8px] h-[8px] rounded-full bg-[var(--role-owner)] flex-none"></span>
                  </div>
                  <span className="text-[11px] text-[var(--nav-text-faint)]">{selfMove}</span>
                </div>
                {selfCells.map((c: any, i: number) => (
                  <span key={i} style={c.style}>{c.value}</span>
                ))}
                <span className="w-[80px] flex-none text-right font-heading font-bold text-[18px] font-tabular-nums">846</span>
                <span className="w-[20px] flex-none"></span>
              </div>
            </div>
          )}

        </div>
        
        <div className="max-w-[1080px] mx-auto px-[24px]">
          <div className="flex items-center justify-between gap-[10px] py-[18px]">
            <div onClick={prevPage} style={prevStyle}>{prevLabel}</div>
            <span className="text-[11.5px] text-[var(--text-muted)]">{pageLabel}</span>
            <div onClick={nextPage} style={nextStyle}>{nextLabel}</div>
          </div>

          {showTies && (
            <div className="mb-[26px] pt-[20px] border-t border-[var(--surface-border)] flex items-start gap-[34px]">
              <div className="w-[230px] flex-none flex flex-col gap-[5px]">
                <div className="font-heading font-semibold text-[14px]">How ties are broken</div>
                <div className="text-[11px] text-[var(--text-muted)] leading-[1.5]">Set when the league was published and permanent.</div>
              </div>
              <div className="flex-1 flex">
                {tiebreakers.map((t: any, i: number) => (
                  <div key={i} style={t.style}>
                    <span className="font-heading font-bold text-[20px] text-[var(--text-muted)] tracking-[-1px] font-tabular-nums">{t.n}</span>
                    <span className="text-[12px] text-[var(--text-secondary)] leading-[1.45]">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
