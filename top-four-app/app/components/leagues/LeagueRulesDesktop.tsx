'use client';

import Link from 'next/link';

export function LeagueRulesDesktop({
  theme, rootNav, avatarInitials, avatarName, showContext, roleLine, contextTabs,
  isLoading, skeletons, isTerminal, termIcon, termIconColor, termTitle, termBody, termAction, termActionStyle, retry,
  isReady, showMaxPoints, heroStyle, maxPoints, maxNote, showFrozenBanner, lockIcon, frozenText,
  markets, tiebreakers, comps, deadlines, showDanger, dangerLines, showEditable, editable, showLeave, footNote
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      {showContext && (
        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
            <span className="text-[11px] text-[var(--text-muted)]">{roleLine}</span>
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const route = t.label === 'Overview' ? `/leagues/1` : `/leagues/1/${t.label.toLowerCase()}`;
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

                  {showDanger && (
                    <div className="pt-[22px] mt-[22px] border-t border-[var(--surface-border)]">
                      <div className="font-heading font-bold text-[14px] text-[var(--danger-text)]">Ending this league</div>
                      <div className="flex flex-col gap-[12px] mt-[12px]">
                        {dangerLines.map((d: any, i: number) => (
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
                          <div key={i} className="flex items-center gap-[12px] py-[12px] border-t border-[var(--surface-border)] cursor-pointer">
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
  );
}
