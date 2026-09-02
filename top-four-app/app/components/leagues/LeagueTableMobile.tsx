'use client';

import Link from 'next/link';

export function LeagueTableMobile({
  theme, params, st, isLoading, isEmpty, isFinal, showRows,
  headSub, myPos, myPosLabel, myGap, refreshing, hasStanding,
  rows, TINTS, breakdown, selfBreakdown, listRef,
  page, PAGES, range, prevStyle, nextStyle, prevPage, nextPage,
  selfOpen, setSelfOpen, setRefreshing, leagueName, myName, myInitials, myPoints,
  winnerName, winnerLine, totalMembers
}: any) {

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_18px] flex-none">
        <div className="flex items-center gap-[11px]">
          <Link href={`/leagues/${params.id}`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
          </div>
          <div className="tf-tap w-[40px] h-[40px] grid place-items-center text-[var(--nav-text-quiet)] flex-none text-[17px]">⋯</div>
        </div>

        {hasStanding && (
          <div className="flex items-end gap-[13px] mt-[18px]">
            <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px]">{myPos}</div>
            <div className="flex-1 pb-[4px] min-w-0">
              <div className="font-heading font-semibold text-[12.5px]">{myPosLabel}</div>
              <div className="text-[11px] text-[var(--nav-text-faint)] mt-[3px]">{myGap}</div>
            </div>
            <div className="flex-none px-[12px] h-[34px] rounded-[9px] bg-[var(--nav-fill)] text-[var(--nav-text)] grid place-items-center font-heading font-bold text-[10px] cursor-pointer">JUMP</div>
          </div>
        )}
      </header>

      {refreshing && (
        <div className="flex-none flex items-center gap-[10px] p-[11px_var(--gutter)] bg-[var(--accent-surface)] border-b border-[var(--accent-border)]">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-brand)] flex-none"></span>
          <span className="flex-1 text-[11.5px] leading-[1.4] text-[var(--accent-text)]">Positions have moved since you opened this.</span>
          <span onClick={() => setRefreshing(false)} className="tf-tap font-heading font-bold text-[10.5px] text-[var(--text-link)] flex-none">REFRESH</span>
        </div>
      )}

      <div className="flex-none flex items-center gap-[10px] p-[9px_var(--gutter)] bg-[var(--surface-canvas)] border-b border-[var(--surface-border)]">
        <span className="tf-kicker w-[30px] flex-none text-[var(--text-muted)]">POS</span>
        <span className="tf-kicker flex-1 text-[var(--text-muted)]">MEMBER</span>
        <span className="flex items-center gap-[5px] flex-none"><span className="w-[7px] h-[7px] rounded-full bg-[var(--role-owner)]"></span><span className="text-[9.5px] text-[var(--text-muted)]">Owner</span></span>
        <span className="flex items-center gap-[5px] flex-none"><span className="w-[7px] h-[7px] rounded-full bg-[var(--role-admin)]"></span><span className="text-[9.5px] text-[var(--text-muted)]">Admin</span></span>
        <span className="tf-kicker flex-none text-[var(--text-muted)]">PTS</span>
      </div>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]" ref={listRef}>
        {isLoading && (
          <div>
            {[{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }, { w: "44%" }, { w: "58%" }, { w: "69%" }, { w: "51%" }].map((s, i) => (
              <div key={i} className="flex items-center gap-[11px] p-[13px_var(--gutter)] border-b border-[var(--surface-border)]">
                <div className="w-[22px] h-[11px] rounded-full bg-[var(--surface-subtle)]"></div>
                <div className="w-[30px] h-[30px] rounded-full bg-[var(--surface-subtle)]"></div>
                <div className="flex-1 h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ maxWidth: s.w }}></div>
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="p-[70px_30px] flex flex-col items-center text-center">
            <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px]">Nobody has scored yet</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">Everyone is on zero until the first fixture settles. All {totalMembers} members are listed in the order they joined.</div>
          </div>
        )}

        {showRows && (
          <div>
            {isFinal && (
              <div className="flex items-center gap-[12px] p-[14px_var(--gutter)] bg-[var(--tf-navy-800)]">
                <span className="w-[30px] h-[30px] rounded-full bg-[var(--color-crown)] flex-none"></span>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[14px] text-[var(--tf-white)]">{winnerName ? `${winnerName} wins` : 'League complete'}</div>
                  <div className="text-[10.5px] text-[rgba(255,255,255,0.65)] mt-[3px]">{winnerLine}</div>
                </div>
              </div>
            )}

            {rows.map((r: any, i: number) => (
              <div key={i} className={r.wrapStyle}>
                <div onClick={r.toggle} className="flex items-center gap-[11px] p-[12px_var(--gutter)] cursor-pointer">
                  <div className="w-[30px] flex-none flex items-baseline gap-[1px]">
                    <span className={`tf-num ${r.posStyle}`}>{r.pos}</span>
                    <span className={r.tieStyle}>=</span>
                  </div>
                  <div className={r.avatarStyle} style={{ background: r.avatarBg }}>{r.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[7px]">
                      <span className={r.nameStyle}>{r.name}</span>
                      <span className={r.roleDot}></span>
                    </div>
                    <div className={r.subStyle}>{r.sub}</div>
                  </div>
                  <span className={`tf-num ${r.pointsStyle}`}>{r.points}</span>
                  <span className={r.caretStyle}>⌄</span>
                </div>
                {r.open && (
                  <div className="p-[0_var(--gutter)_14px_71px] animate-[tfin_0.16s_ease]">
                    <div className="tf-kicker text-[var(--text-muted)]">{r.breakLabel}</div>
                    <div className="mt-[8px]">
                      {r.breakdown.map((b: any, j: number) => (
                        <div key={j} className={b.rowStyle}>
                          <span className={b.labelStyle} dangerouslySetInnerHTML={{ __html: b.label.replace(/Total|Premier League|Champions League|FA Cup|Custom questions/g, (match: string) => `<span class="${b.total ? 'font-heading font-bold text-[' + (b.labelStyle.includes('rgba') ? 'var(--tf-white)' : 'var(--text-primary)') + ']' : ''}">${match}</span>`) }}></span>
                          <span className={`tf-num ${b.valueStyle}`}>{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="p-[18px_var(--gutter)_8px]"><span className="tf-kicker text-[var(--text-muted)]">HOW TIES ARE BROKEN</span></div>
            {[["1", "Total points"], ["2", "Exact scores correct"], ["3", "Match results correct"], ["4", "Lineup players correct"]].map(([n, label], i) => (
              <div key={i} className={`flex items-center gap-[11px] p-[10px_var(--gutter)] border-t border-[var(--surface-border)] ${i === 3 ? 'border-b' : ''}`}>
                <span className="tf-num w-[16px] flex-none font-semibold text-[10.5px] font-[ui-monospace,Menlo,monospace] text-[var(--text-muted)]">{n}</span>
                <span className="flex-1 text-[12px] text-[var(--text-secondary)]">{label}</span>
              </div>
            ))}
            <div className="p-[12px_var(--gutter)_22px] text-[11px] leading-[1.55] text-[var(--text-muted)]">Set when the league was published and permanent. Anything not listed never separates two members — they stay level and share the position.</div>
          </div>
        )}
      </main>

      {hasStanding && (
        <div onClick={() => setSelfOpen(!selfOpen)} className="flex-none bg-[var(--tf-navy-800)] text-[var(--tf-white)] cursor-pointer">
          <div className="flex items-center gap-[11px] p-[13px_var(--gutter)]">
            <span className="tf-num w-[30px] flex-none font-heading font-bold text-[13px]">{myPos}</span>
            <div className="w-[30px] h-[30px] rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[10px] flex-none">{myInitials || '??'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[7px]">
                <span className="font-heading font-bold text-[13.5px]">{myName || 'You'}</span>
                <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_5px] rounded-[4px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">YOU</span>
                <span className="w-[7px] h-[7px] rounded-full bg-[var(--role-owner)] flex-none"></span>
              </div>
              <div className="text-[10.5px] text-[rgba(255,255,255,0.6)] mt-[2px]">{isFinal ? "final position" : "current position"}</div>
            </div>
            <span className="tf-num font-heading font-bold text-[15px] flex-none">{myPoints}</span>
            <span className={`text-[12px] text-[rgba(255,255,255,0.6)] flex-none transition-transform duration-150 ${selfOpen ? 'rotate-180' : ''}`}>⌄</span>
          </div>
          {selfOpen && (
            <div className="p-[0_var(--gutter)_14px_71px] animate-[tfin_0.16s_ease]">
              {selfBreakdown.map((b: any, j: number) => (
                <div key={j} className={b.rowStyle}>
                  <span className={b.labelStyle} dangerouslySetInnerHTML={{ __html: b.label.replace(/Total|Premier League|Champions League|FA Cup|Custom questions/g, (match: string) => `<span class="${b.total ? 'font-heading font-bold text-[var(--tf-white)]' : ''}">${match}</span>`) }}></span>
                  <span className={`tf-num ${b.valueStyle}`}>{b.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-none flex items-center justify-between gap-[8px] p-[10px_var(--gutter)_12px] bg-[var(--surface-card)] border-t border-[var(--surface-border)]">
        <div onClick={prevPage} className={prevStyle}>‹ Prev</div>
        <span className="tf-num text-[11px] text-[var(--text-muted)]">{range[0]}–{range[1]} of {totalMembers}</span>
        <div onClick={nextPage} className={nextStyle}>Next ›</div>
      </div>
    </div>
  );
}
