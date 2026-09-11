'use client';

import Link from 'next/link';

// Merged from LeagueRulesMobile/LeagueRulesDesktop. Desktop's own top nav
// (rootNav/avatarInitials/avatarName) was dead -- DesktopLevelOne in the
// root layout is the real one. Two real bugs found and fixed here:
//
// 1. Mobile's "points from one match, at most" hero hardcoded a literal
//    "40" plus a matching hardcoded breakdown sentence ("2 result + 5
//    score + ... + 22 lineup"), regardless of the league's actual enabled
//    markets and point values -- maxPoints/maxNote were computed for
//    Desktop only and never even reached Mobile's props. Both platforms
//    now share the same real computation.
// 2. The terminal-state selector was `isTerminal ? "error" : "error"` --
//    both branches identical, so the distinct "not found" copy (with its
//    own "BACK TO MY LEAGUES" action) was unreachable dead code; a
//    genuinely missing or inaccessible league always showed the generic
//    "check your connection" message instead. Both "RETRY" and "BACK TO
//    MY LEAGUES" were also a no-op () => {} regardless of which was shown.
export function LeagueRulesScreen({
  theme, params, isLoading, isTerminal, isReady, isOwner,
  IconMap, TERM, headTitle, headSub, frozenText, showMaxPoints,
  footNote, retry, leagueName, maxPoints, maxNote,
  sections, showDanger, dangerLinesMobile,
  showContext, roleLine, contextTabs, skeletons,
  termIcon, termIconColor, termTitle, termBody, termAction, termActionStyle,
  heroStyle, showFrozenBanner, lockIcon,
  markets, tiebreakers, comps, deadlines, showDangerDesktop, dangerLinesDesktop,
  showEditable, editable, showLeave,
}: any) {
  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[10px_var(--gutter)_18px] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${params.id}/more`} className="tf-tap w-[44px] h-[44px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)]">
              {IconMap.back(18)}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[18px] leading-[1.1] tracking-[-0.3px]">{headTitle}</div>
              <div className="font-heading font-medium text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
            </div>
          </div>

          {showMaxPoints && (
            <div className="flex items-end gap-[12px] mt-[18px]">
              <div className="tf-num font-heading font-bold text-[44px] leading-[0.9] tracking-[-1.8px]">{maxPoints}</div>
              <div className="pb-[5px] min-w-0">
                <div className="font-heading font-semibold text-[11.5px]">points from one match, at most</div>
                <div className="text-[10.5px] leading-[1.45] text-[var(--nav-text-faint)] mt-[3px]">{maxNote}</div>
              </div>
            </div>
          )}

          {isReady && (
            <div className="mt-[16px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.08)] border border-[var(--nav-border)] flex items-start gap-[10px]">
              <span className="text-[var(--nav-accent)] flex-none mt-[1px]">{IconMap.lock(16)}</span>
              <span className="font-heading font-medium text-[11.5px] leading-[1.5] text-[var(--nav-text-quiet)]">{frozenText}</span>
            </div>
          )}
        </header>

        <main className="tf-scroll flex-1 overflow-auto pb-[26px]">
          {isLoading && (
            <div className="p-[22px_var(--gutter)] flex flex-col gap-[26px]">
              {[{ w: "72%" }, { w: "58%" }, { w: "66%" }, { w: "49%" }, { w: "70%" }].map((s, i) => (
                <div key={i} className="flex flex-col gap-[9px]">
                  <div className="h-[9px] w-[32%] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                  <div className="h-[12px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="h-[9px] w-[56%] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                </div>
              ))}
            </div>
          )}

          {isTerminal && (
            <div className="p-[56px_30px] flex flex-col items-center text-center">
              <div style={{ color: TERM[1] as string }}>{IconMap[TERM[0]](34)}</div>
              <div className="font-heading font-bold text-[21px] leading-[1.15] tracking-[-0.4px] mt-[22px]">{TERM[2]}</div>
              <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[284px]">{TERM[3]}</div>
              <div onClick={retry} className="tf-tap mt-[24px] min-h-[47px] px-[22px] border border-[var(--surface-border-strong)] rounded-[13px] bg-[var(--surface-card)] text-[var(--text-primary)] font-heading font-bold text-[12.5px] flex items-center cursor-pointer">{TERM[4]}</div>
            </div>
          )}

          {isReady && (
            <div>
              {sections.map((sec: any, i: number) => (
                <div key={i}>
                  <div className="p-[20px_var(--gutter)_8px] font-heading font-bold text-[10px] leading-[1] tracking-[0.12em] uppercase text-[var(--text-muted)]">{sec.label}</div>
                  {sec.hasIntro && (
                    <div className="p-[0_var(--gutter)_10px] text-[11.5px] leading-[1.55] text-[var(--text-muted)]">{sec.intro}</div>
                  )}
                  <div className="border-y border-[var(--surface-border)]">
                    {sec.lines.map((l: any, j: number) => (
                      <div key={j} className={l.cls} onClick={l.onClick}>
                        {l.locked && <span className="w-[15px] h-[15px] flex-none text-[var(--text-muted)]">{IconMap.lock(15)}</span>}
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-semibold text-[13px] leading-[1.25]" style={{ color: l.titleColor }}>{l.title}</div>
                          {l.hasNote && <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[4px]">{l.note}</div>}
                        </div>
                        <span className={`font-heading font-semibold text-[12.5px] leading-[1.3] text-[var(--text-secondary)] text-right flex-none max-w-[150px] ${l.valStyle}`}>{l.value}</span>
                        {l.chevron && <span className="text-[var(--text-muted)] font-heading font-semibold text-[15px] flex-none">›</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {showDanger && (
                <div>
                  <div className="p-[20px_var(--gutter)_8px] font-heading font-bold text-[10px] leading-[1] tracking-[0.12em] uppercase text-[var(--danger-text)]">Ending the league</div>
                  <div className="border-y border-[var(--surface-border)]">
                    {dangerLinesMobile.map((d: any, i: number) => (
                      <div key={i} className="tf-tap flex items-center gap-[12px] p-[16px_var(--gutter)] border-b border-[var(--surface-border)] last:border-b-0 cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-semibold text-[13px] leading-[1.25] text-[var(--danger-text)]">{d.title}</div>
                          <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[4px]">{d.note}</div>
                        </div>
                        <span className="text-[var(--text-muted)] font-heading font-semibold text-[15px] flex-none">›</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-[18px_var(--gutter)_8px] text-[11px] leading-[1.6] text-[var(--text-muted)] text-center">{footNote}</div>
            </div>
          )}
        </main>
      </div>

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        {showContext && (
          <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
            <div className="flex items-center gap-[10px] pb-[11px]">
              <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
              <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
              <span className="text-[11px] text-[var(--text-muted)]">{roleLine}</span>
            </div>
            <div className="flex items-center gap-[2px] ml-auto">
              {contextTabs.map((t: any, i: number) => {
                const leagueId = params?.id || '';
                const route = t.label === 'Overview' ? `/leagues/${leagueId}` : `/leagues/${leagueId}/${t.label.toLowerCase()}`;
                return (
                  <Link href={route} key={i} style={t.style}>{t.label}</Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="tf-scroll flex-1 overflow-y-auto">
          <div className="max-w-[1080px] mx-auto px-[24px] pb-[30px]">

            {isLoading && (
              <div>
                <div className="bg-[var(--nav-surface)] py-[24px] pb-[26px]">
                  <div className="flex items-end gap-[20px]">
                    <div className="w-[96px] h-[48px] rounded-[10px] bg-[rgba(255,255,255,0.13)]"></div>
                    <div className="flex-1 flex flex-col gap-[9px] pb-[4px]">
                      <div className="w-[210px] h-[12px] rounded-full bg-[rgba(255,255,255,0.12)]"></div>
                      <div className="w-[46%] h-[10px] rounded-full bg-[rgba(255,255,255,0.08)]"></div>
                    </div>
                  </div>
                </div>
                <div className="pt-[22px] grid grid-cols-[minmax(0,1fr)_360px] gap-[18px] items-start">
                  <div>
                    {skeletons.map((s: any, i: number) => (
                      <div key={i} className="py-[15px] px-[4px] border-b border-[var(--surface-border)] flex items-center gap-[14px]">
                        <div className="h-[12px] flex-1 max-w-[100%] rounded-[6px] bg-[var(--surface-subtle)]" style={{ maxWidth: s.w }}></div>
                        <div className="h-[11px] w-[48px] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="h-[11px] w-[120px] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="h-[9px] w-[80%] mt-[12px] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="h-[9px] w-[66%] mt-[8px] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                  </div>
                </div>
              </div>
            )}

            {isTerminal && (
              <div className="py-[120px] px-[30px] flex flex-col items-center text-center">
                <div style={{ color: termIconColor }}>{termIcon}</div>
                <div className="font-heading font-bold text-[26px] leading-[1.15] tracking-[-0.5px] mt-[20px]">{termTitle}</div>
                <div className="text-[14px] leading-[1.55] text-[var(--text-secondary)] mt-[11px] max-w-[460px]">{termBody}</div>
                <div onClick={retry} style={termActionStyle}>{termAction}</div>
              </div>
            )}

            {isReady && (
              <div>
                {showMaxPoints && (
                  <div style={heroStyle}>
                    <div className="flex items-end gap-[20px]">
                      <span className="font-heading font-bold text-[56px] leading-[0.86] tracking-[-2.4px] font-tabular-nums">{maxPoints}</span>
                      <div className="flex-1 min-w-0 pb-[5px]">
                        <div className="font-heading font-semibold text-[13.5px]">points from one match, at most</div>
                        <div className="text-[11.5px] leading-[1.5] text-[var(--nav-text-faint)] mt-[4px] max-w-[64ch]">{maxNote}</div>
                      </div>
                    </div>
                    {showFrozenBanner && (
                      <div className="flex items-center gap-[12px] mt-[18px] pt-[15px] border-t border-[var(--nav-border)]">
                        <span className="text-[var(--nav-text-faint)] flex-none">{lockIcon}</span>
                        <div className="flex-1 text-[12px] leading-[1.5] text-[var(--nav-text-faint)]">{frozenText}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-[18px] mt-[22px] items-start">
                  <div className="flex flex-col gap-[16px]">
                    <div>
                      <div className="px-[4px] pb-[12px] border-b border-[var(--surface-border-strong)]">
                        <div className="font-heading font-bold text-[14px]">Scoring</div>
                        <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px]">Frozen when the league was published</div>
                      </div>
                      {markets.map((m: any, i: number) => (
                        <div key={i} style={m.rowStyle}>
                          <span style={m.swatchStyle}></span>
                          <div className="flex-1 min-w-0">
                            <div className="font-heading font-semibold text-[13.5px]" style={{ color: m.nameColor }}>{m.name}</div>
                            <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{m.note}</div>
                          </div>
                          <span style={m.ptsStyle}>{m.pts}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-[22px] mt-[22px] border-t border-[var(--surface-border)]">
                      <div className="font-heading font-bold text-[14px]">Tiebreakers, in order</div>
                      <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px]">Applied top down. Anything not listed never separates two members.</div>
                      <div className="grid grid-cols-2 gap-[9px] mt-[14px]">
                        {tiebreakers.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-[11px] p-[11px_13px] rounded-[11px] bg-[var(--surface-subtle)]">
                            <span className="font-semibold text-[11px] font-[ui-monospace,Menlo,monospace] text-[var(--text-muted)] flex-none">{t.n}</span>
                            <span className="text-[12px]">{t.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showDangerDesktop && (
                      <div className="pt-[22px] mt-[22px] border-t border-[var(--surface-border)]">
                        <div className="font-heading font-bold text-[14px] text-[var(--danger-text)]">Ending this league</div>
                        <div className="flex flex-col gap-[12px] mt-[12px]">
                          {dangerLinesDesktop.map((d: any, i: number) => (
                            <div key={i} className="flex items-start gap-[14px] pt-[12px] border-t border-[var(--surface-border)]">
                              <div className="flex-1 min-w-0">
                                <div className="font-heading font-semibold text-[13px]">{d.label}</div>
                                <div className="text-[11.5px] text-[var(--text-muted)] leading-[1.5] mt-[3px]">{d.note}</div>
                              </div>
                              <div style={d.btnStyle}>{d.action}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showLeave && (
                      <div className="pt-[22px] mt-[22px] border-t border-[var(--surface-border)]">
                        <div className="font-heading font-bold text-[14px] text-[var(--danger-text)]">Leaving</div>
                        <div className="text-[12px] text-[var(--text-secondary)] leading-[1.55] mt-[6px] max-w-[60ch]">Your points and answers stay in the table — leaving stops you playing on, it does not remove what you already did. You would need a fresh invitation to come back.</div>
                        <div className="mt-[14px] px-[18px] h-[42px] w-[180px] rounded-[11px] border border-[var(--color-danger)] text-[var(--danger-text)] grid place-items-center font-heading font-semibold text-[12.5px] cursor-pointer">Leave this league</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-[16px]">
                    <div className="pb-[20px] border-b border-[var(--surface-border)]">
                      <div className="font-heading font-bold text-[14px]">Deadlines</div>
                      <div className="mt-[11px]">
                        {deadlines.map((d: any, i: number) => (
                          <div key={i} className="flex items-baseline justify-between gap-[12px] py-[11px] border-t border-[var(--surface-border)]">
                            <div className="min-w-0">
                              <div className="text-[12.5px]">{d.label}</div>
                              <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{d.note}</div>
                            </div>
                            <span className="font-heading font-semibold text-[12.5px] flex-none text-right">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pb-[20px] border-b border-[var(--surface-border)]">
                      <div className="font-heading font-bold text-[14px]">Competitions</div>
                      <div className="flex flex-col gap-[9px] mt-[12px]">
                        {comps.map((c: any, i: number) => (
                          <div key={i} className="flex items-center gap-[11px]">
                            <span style={c.abbrStyle}>{c.abbr}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</div>
                              <div className="text-[10.5px] text-[var(--text-muted)] mt-[2px]">{c.scope}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showEditable && (
                      <div className="pb-[20px] border-b border-[var(--surface-border)]">
                        <div className="font-heading font-bold text-[14px]">Still editable</div>
                        <div className="flex flex-col mt-[6px]">
                          {editable.map((e: any, i: number) => (
                            <div key={i} onClick={e.onClick} className="flex items-center gap-[12px] py-[12px] border-t border-[var(--surface-border)] cursor-pointer">
                              <div className="flex-1 min-w-0">
                                <div className="font-heading font-semibold text-[12.5px]">{e.label}</div>
                                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{e.note}</div>
                              </div>
                              <span className="text-[15px] text-[var(--text-muted)]">›</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11.5px] text-[var(--text-muted)] leading-[1.55] mt-[18px] max-w-[78ch]">{footNote}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
