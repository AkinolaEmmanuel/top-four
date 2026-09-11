'use client';

import Link from 'next/link';

// Merged from LeagueTableMobile/LeagueTableDesktop. Mobile has no context
// tab bar or bottom nav on this screen -- it's a drill-down reached only via
// Overview's back arrow, which is an intentional, pre-existing choice kept
// as-is here, not something this merge changes.
export function LeagueTableScreen({
  theme, params, st, isLoading, isEmpty, isFinal, showRows,
  myPos, myGap, myName, myInitials, myPoints,
  refreshing, hasStanding, totalMembers, winnerName, winnerLine,
  listRef, jumpToMe, prevPage, nextPage, leagueName,
  // Mobile-specific
  headSub, myPosLabelMobile, rowsMobile, selfBreakdown,
  range, prevStyle: prevStyleMobile, nextStyle: nextStyleMobile,
  selfOpen, setSelfOpen, setRefreshing,
  // Desktop-specific
  contextTabs, heroStyle, myPosLabel, neighbours, pageLabel, refresh,
  cols, legend, skeletons, rowsDesktop, tiebreakers, showTies,
  selfPos, selfMove, selfPoints, selfCells,
  prevStyle: prevStyleDesktop, nextStyle: nextStyleDesktop, prevLabel, nextLabel,
  memberCount,
}: any) {
  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
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
                <div className="font-heading font-semibold text-[12.5px]">{myPosLabelMobile}</div>
                <div className="text-[11px] text-[var(--nav-text-faint)] mt-[3px]">{myGap}</div>
              </div>
              <div onClick={jumpToMe} className="flex-none px-[12px] h-[34px] rounded-[9px] bg-[var(--nav-fill)] text-[var(--nav-text)] grid place-items-center font-heading font-bold text-[10px] cursor-pointer">JUMP</div>
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

              {rowsMobile.map((r: any, i: number) => (
                <div key={i} ref={r.ref} className={r.wrapStyle}>
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
                            <span className={b.labelStyle}>{b.label}</span>
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
                    <span className={b.labelStyle}>{b.label}</span>
                    <span className={`tf-num ${b.valueStyle}`}>{b.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-none flex items-center justify-between gap-[8px] p-[10px_var(--gutter)_12px] bg-[var(--surface-card)] border-t border-[var(--surface-border)]">
          <div onClick={prevPage} className={prevStyleMobile}>‹ Prev</div>
          <span className="tf-num text-[11px] text-[var(--text-muted)]">{range[0]}–{range[1]} of {totalMembers}</span>
          <div onClick={nextPage} className={nextStyleMobile}>Next ›</div>
        </div>
      </div>

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[22px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
            {memberCount && <span className="text-[11px] text-[var(--text-muted)]">{memberCount} members</span>}
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
                <span className="font-heading font-bold text-[15px]">{winnerName ? `${winnerName} wins` : 'League complete'}</span>
                <span className="text-[11.5px] text-[var(--nav-text-faint)]">{winnerLine}</span>
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
                  <div className="text-[13px] text-[var(--text-secondary)] leading-[1.55] max-w-[420px]">Everyone is on zero until the first fixture settles. All {totalMembers} members are listed in join order.</div>
                </div>
              )}

              {showRows && (
                <div className="flex flex-col">
                  {rowsDesktop.map((r: any, i: number) => (
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
                  <div className="w-[36px] h-[36px] rounded-full bg-[var(--color-brand)] flex justify-center items-center text-[12px] font-heading font-bold text-[var(--color-on-brand)] flex-none">{myInitials || '??'}</div>
                  <div className="flex-1 flex flex-col gap-[3px] min-w-0">
                    <div className="flex items-center gap-[7px]">
                      <span className="font-heading font-bold text-[14px]">{myName || 'You'}</span>
                      <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_5px] rounded-[4px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">YOU</span>
                      <span className="w-[8px] h-[8px] rounded-full bg-[var(--role-owner)] flex-none"></span>
                    </div>
                    <span className="text-[11px] text-[var(--nav-text-faint)]">{selfMove}</span>
                  </div>
                  {selfCells.map((c: any, i: number) => (
                    <span key={i} style={c.style}>{c.value}</span>
                  ))}
                  <span className="w-[80px] flex-none text-right font-heading font-bold text-[18px] font-tabular-nums">{selfPoints}</span>
                  <span className="w-[20px] flex-none"></span>
                </div>
              </div>
            )}

          </div>

          <div className="max-w-[1080px] mx-auto px-[24px]">
            <div className="flex items-center justify-between gap-[10px] py-[18px]">
              <div onClick={prevPage} style={prevStyleDesktop}>{prevLabel}</div>
              <span className="text-[11.5px] text-[var(--text-muted)]">{pageLabel}</span>
              <div onClick={nextPage} style={nextStyleDesktop}>{nextLabel}</div>
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
    </>
  );
}
