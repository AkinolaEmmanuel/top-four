'use client';

import Link from 'next/link';

export function FixtureDesktop({ 
  theme, isLoading, isReady, settled, locked, urgent, clock, HERO, heroTone, 
  answeredTotal, conflict, setResolved, a, setAnswers, markets, lineups, 
  carryLabels, setCopy, copy, targets, carrying, chosen, outcomes, CLUB,
  contextTabs, heroStyle, homeColor, awayColor, heroKicker, heroDotStyle,
  scoreline, scoreSize, kickoffLine, bannerLabel, bannerText, bannerRight,
  marketsDone, lineupsDone, pointsLabel, pointsValue, pointsHeroColor,
  marketsHint, footNote, canCopy, copySub, showConflict,
  copyPrimary, copyPrimaryStyle, leagueName, competitionLabel
}: any) {
  
  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Level Two Context Bar */}
      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px] min-w-0">
          <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px] whitespace-nowrap">{leagueName || 'League'}</span>
          {competitionLabel && <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{competitionLabel}</span>}
        </div>
        <div className="flex items-center gap-[2px] ml-auto">
          {contextTabs.map((t: any, i: number) => (
            <div key={i} style={t.style}>{t.label}</div>
          ))}
        </div>
      </div>

      <div className="tf-scroll flex-1 overflow-y-auto">

        {/* Breadcrumb */}
        <div className="max-w-[1080px] mx-auto px-[24px]">
          <div className="flex items-center gap-[9px] m-[20px_0_16px] text-[12px] text-[var(--text-muted)]">
            <Link href="/predict" className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">Predict</Link>
            <span>›</span>
            <span className="text-[var(--text-primary)]">Arsenal v Chelsea</span>
          </div>
        </div>

        {/* HERO */}
        <div style={heroStyle}>
          <div className="absolute left-0 right-0 top-[50%] h-[1px] bg-[rgba(255,255,255,0.06)]"></div>
          <div className="absolute left-[50%] top-[50%] w-[300px] h-[300px] mt-[-150px] ml-[-150px] border border-[rgba(255,255,255,0.06)] rounded-full"></div>
          
          <div className="relative max-w-[1080px] mx-auto px-[24px]">
            <div className="flex items-center gap-[10px]">
              <span style={heroDotStyle}></span>
              <span className="tf-kicker" style={{ color: heroTone }}>{heroKicker}</span>
              <span className="flex-1"></span>
              <span className="font-heading font-semibold text-[11px] text-[var(--nav-text-faint)]">{kickoffLine}</span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-[26px] items-center m-[24px_auto_0] max-w-[780px]">
              <div className="flex items-center justify-end gap-[16px] min-w-0">
                <div className="text-right min-w-0">
                  <div className="font-heading font-bold text-[32px] leading-[1] tracking-[-1.1px] whitespace-nowrap overflow-hidden text-ellipsis">Arsenal</div>
                  <div className="text-[10px] text-[var(--nav-text-faint)] mt-[7px] tracking-[0.1em]">HOME</div>
                </div>
                <span className="tf-crest w-[58px] h-[63px] text-[14px]" style={{ background: homeColor }}>ARS</span>
              </div>
              <div className="text-center flex-none min-w-[150px]">
                <div className="tf-num font-heading font-bold leading-[1] tracking-[-2px]" style={{ fontSize: scoreSize }}>{scoreline}</div>
              </div>
              <div className="flex items-center gap-[16px] min-w-0">
                <span className="tf-crest w-[58px] h-[63px] text-[14px]" style={{ background: awayColor }}>CHE</span>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[32px] leading-[1] tracking-[-1.1px] whitespace-nowrap overflow-hidden text-ellipsis">Chelsea</div>
                  <div className="text-[10px] text-[var(--nav-text-faint)] mt-[7px] tracking-[0.1em]">AWAY</div>
                </div>
              </div>
            </div>

            <div className="flex items-stretch mt-[26px] pt-[18px] border-t border-[rgba(255,255,255,0.13)]">
              <div className="flex-1 min-w-0 pr-[24px]">
                <div className="tf-kicker text-[var(--nav-text-faint)]">{bannerLabel}</div>
                <div className="flex items-baseline gap-[10px] mt-[9px]">
                  <span className="tf-num font-heading font-bold text-[26px] tracking-[-0.9px]" style={{ color: heroTone }}>{bannerRight}</span>
                  <span className="text-[12px] text-[var(--nav-text-faint)]">{bannerText}</span>
                </div>
              </div>
              <div className="flex-none w-[150px] px-[24px] border-l border-[rgba(255,255,255,0.13)]">
                <div className="tf-kicker text-[var(--nav-text-faint)]">Markets</div>
                <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.9px] mt-[9px]">{marketsDone}</div>
              </div>
              <div className="flex-none w-[150px] px-[24px] border-l border-[rgba(255,255,255,0.13)]">
                <div className="tf-kicker text-[var(--nav-text-faint)]">Lineups</div>
                <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.9px] mt-[9px]">{lineupsDone}</div>
              </div>
              <div className="flex-none w-[160px] pl-[24px] border-l border-[rgba(255,255,255,0.13)]">
                <div className="tf-kicker text-[var(--nav-text-faint)]">{pointsLabel}</div>
                <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.9px] mt-[9px]" style={{ color: pointsHeroColor }}>{pointsValue}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1080px] mx-auto px-[24px]">
          
          {showConflict && (
            <div className="tf-card mt-[14px] border-[var(--color-warning)] p-[16px_18px] grid grid-cols-[minmax(0,1fr)_auto] gap-[20px] items-center">
              <div>
                <div className="font-heading font-semibold text-[14px]">You answered this on another device</div>
                <div className="text-[12.5px] text-[var(--text-secondary)] leading-[1.5] mt-[5px]">Now stored: <strong>Draw</strong>. You were about to save <strong>Arsenal to win</strong>.</div>
              </div>
              <div className="flex gap-[9px] flex-none">
                <div onClick={() => { setResolved(true); setAnswers({ ...a, result: "home" }); }} className="p-[0_18px] h-[42px] rounded-[11px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center cursor-pointer font-heading font-semibold text-[12.5px]">Replace it</div>
                <div onClick={() => { setResolved(true); setAnswers({ ...a, result: "draw" }); }} className="p-[0_18px] h-[42px] rounded-[11px] border border-[var(--surface-border-strong)] grid place-items-center cursor-pointer font-heading font-semibold text-[12.5px]">Keep stored</div>
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between mt-[26px]">
            <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Markets</span>
            <span className="text-[11.5px] text-[var(--text-muted)]">{marketsHint}</span>
          </div>

          {/* MARKETS */}
          <div className="mt-[11px]">
            {markets.map((m: any, idx: number) => (
              <div key={idx} className={m.cardStyle}>
                <div className="grid grid-cols-[250px_452px_minmax(0,1fr)] gap-[30px] items-start p-[18px]">
                  
                  <div className="min-w-0 pt-[3px]">
                    <div className="flex items-center gap-[8px]">
                      <span className="font-heading font-bold text-[15px] tracking-[-0.25px]">{m.name}</span>
                      <span className="text-[10.5px] text-[var(--text-muted)]">{m.points}</span>
                    </div>
                    <div className={m.answerStyle}>{m.answer}</div>
                    <div className={m.footStyle}>
                      <span>{m.lockLine}</span>
                      <span onClick={m.toggleHistory} className={m.historyLinkStyle}>{m.historyLink}</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    {m.showChoices && (
                      <div className="flex gap-[8px]">
                        {(m.options || []).map((opt: any, j: number) => (
                          <div key={j} onClick={opt.pick} className={opt.style}>
                            <span className="font-heading font-semibold text-[13px]">{opt.label}</span>
                            <span className={opt.subStyle}>{opt.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {m.showScore && (
                      <div className="flex gap-[16px]">
                        {(m.steppers || []).map((st: any, j: number) => (
                          <div key={j} className="flex-1 flex items-center gap-[8px]">
                            <div onClick={st.dec} className={st.btnStyle}>−</div>
                            <div className={st.boxStyle}>
                              <span className="tf-num font-heading font-bold text-[20px] leading-[1]">{st.value}</span>
                              <span className="text-[9.5px] text-[var(--text-muted)] mt-[2px]">{st.team}</span>
                            </div>
                            <div onClick={st.inc} className={st.btnStyle}>+</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.showPlayers && (
                      <div className="flex flex-col gap-[6px]">
                        {((m as any).players || []).map((pl: any, j: number) => (
                          <div key={j} onClick={pl.pick} className={pl.style}>
                            <div className={pl.badgeStyle}>{pl.initials}</div>
                            <div className="flex-1 min-w-0"><span className="font-heading font-semibold text-[12.5px]">{pl.name}</span></div>
                            <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{pl.meta}</span>
                            <span className={pl.tickStyle}>✓</span>
                          </div>
                        ))}
                        {m.searchLabel && (
                          <div className={m.searchStyle}>{m.searchLabel}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={m.outcomeWrapStyle}>
                    <span className={m.chipStyle}>{m.chip}</span>
                    <span className={m.savedStyle}>Saved</span>
                  </div>

                </div>

                {m.showHistory && (
                  <div className="p-[0_17px_15px]">
                    <div className="border-t border-[var(--surface-border)] pt-[12px]">
                      <div className="tf-kicker text-[var(--text-muted)]">Your edits</div>
                      <div className="flex flex-col mt-[9px]">
                        {(m.history || []).map((h: any, j: number) => (
                          <div key={j} className="flex items-baseline gap-[11px] py-[7px]">
                            <span className={h.dotStyle}></span>
                            <span className={h.valueStyle}>{h.value}</span>
                            <span className="flex-1"></span>
                            <span className="text-[10.5px] text-[var(--text-muted)] font-tabular-nums">{h.when}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[8px]">{m.historyNote}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-between mt-[26px]">
            <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Lineups</span>
            <span className="text-[11.5px] text-[var(--text-muted)]">Lock 2h before kick-off, not at kick-off</span>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-[14px] mt-[11px]">
            {lineups.map((l: any, i: number) => (
              <div key={i} onClick={l.pick} className="tf-card p-[16px_17px] flex gap-[13px] items-center cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors">
                <div className="w-[40px] h-[40px] rounded-[11px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[11px] text-[var(--text-secondary)] flex-none">{l.crest}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px]">
                    <span className="font-heading font-semibold text-[14px] tracking-[-0.15px]">{l.name}</span>
                    <span className="text-[10.5px] text-[var(--text-muted)]">{l.points}</span>
                  </div>
                  <div className={l.answerStyle}>{l.answer}</div>
                </div>
                <span className={l.chipStyle}>{l.chip}</span>
                <span className="font-heading font-bold text-[18px] text-[var(--text-muted)]">›</span>
              </div>
            ))}
          </div>

          {canCopy && (
            <div className="mt-[30px] pt-[22px] border-t border-[var(--surface-border)]">
              <div className="flex items-baseline justify-between">
                <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Answer this match once</span>
                <span className="text-[11.5px] text-[var(--text-muted)]">{copySub}</span>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-[26px] mt-[16px] items-start">
                <div className="flex flex-col gap-[10px]">
                  {targets.map((t: any, i: number) => (
                    <div key={i} onClick={t.toggle} className={t.cardStyle}>
                      <div className={t.boxStyle}>{t.check}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13.5px]">{t.league}</div>
                        <div className="text-[11.5px] text-[var(--text-muted)] leading-[1.45] mt-[3px]">{t.note}</div>
                      </div>
                      <span className={t.flagStyle}>{t.flag}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="tf-kicker">Carrying across</div>
                  <div className="flex flex-wrap gap-[7px] mt-[11px]">
                    {carrying.map((c: any, i: number) => (
                      <span key={i} className={c.style}>{c.label}</span>
                    ))}
                  </div>
                  <div className={copyPrimaryStyle} onClick={() => { if(chosen) setCopy('done'); }}>{copyPrimary}</div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[11px]">Copying replaces whatever is already there. A market the target league doesn't run, or runs on a different line, is skipped rather than guessed.</div>
                </div>
              </div>
            </div>
          )}

          <div className="m-[20px_0_30px] text-[11.5px] leading-[1.55] text-[var(--text-muted)] max-w-[640px]">{footNote}</div>

        </div>
      </div>
    </div>
  );
}
