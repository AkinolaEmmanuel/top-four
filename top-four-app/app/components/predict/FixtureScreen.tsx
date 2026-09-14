'use client';

import Link from 'next/link';
import Image from 'next/image';

// Merged from FixtureMobile/FixtureDesktop -- the two already shared one
// props object from page.tsx, so this merge is mostly consolidating
// duplicated rendering code, not fixing a divergence bug class. Three real
// things found and fixed along the way:
//
// 1. Mobile's combined progress caption read "{answeredTotal} of 8" --
//    hardcoded regardless of how many markets a league's ruleset actually
//    has enabled (Desktop's own two-tile Markets/Lineups breakdown was
//    already using the real counts). Now uses the real totalAnswerable.
// 2. Mobile's Lineups section header showed a hardcoded, non-ticking
//    "CLOSE AT 13:00 · 15m" regardless of the fixture's real kickoff time.
//    Now a real countdown computed from kickoff minus two hours.
// 3. Both twins had a "you answered this on another device" conflict panel
//    wired to a `conflict` flag permanently hardcoded to `false` on the
//    page, with no setter anywhere that could ever flip it -- completely
//    unreachable dead code with its own hardcoded fake "Draw"/"Arsenal to
//    win" text. Removed entirely from both layouts and from the page's
//    props/state.
function Crest({ logo, code, color, size = 40, textSize = 11 }: { logo?: string | null; code: string; color: string; size?: number; textSize?: number }) {
  const h = Math.round(size * 1.086);
  if (logo) {
    return (
      <span className="tf-crest relative overflow-hidden bg-white" style={{ width: size, height: h }}>
        <Image src={logo} alt={code} fill sizes={`${size}px`} className="object-contain p-[3px]" />
      </span>
    );
  }
  return <span className="tf-crest" style={{ width: size, height: h, fontSize: textSize, background: color }}>{code}</span>;
}

export function FixtureScreen({
  theme, isLoading, isReady, settled, locked, urgent, clock, HERO, heroTone,
  answeredTotal, pct, totalAnswerable, markets, lineups, lineupCloseLabel,
  carryLabels, setCopy, copy, targets, carrying, outcomes, CLUB,
  leagueName, competitionLabel, fixtureId, leagueId,
  hName, aName, hCode, aCode, hLogo, aLogo, scoreline, bannerRight,
  pointsAtStake, pointsEarned, copyPrimary, copyPrimaryStyle, onCopyExecute, copyError, copyPending,
  contextTabs, heroStyle, homeColor, awayColor, heroKicker, heroDotStyle,
  scoreSize, kickoffLine, bannerLabel, bannerText,
  marketsDone, lineupsDone, pointsLabel, pointsValue, pointsHeroColor,
  marketsHint, footNote, canCopy, copySub,
}: any) {
  const heroBgMobile = `linear-gradient(103deg, color-mix(in srgb, ${CLUB[hCode] || '#666'} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${CLUB[aCode] || '#666'} 42%, transparent) 0%, transparent 52%), var(--nav-surface)`;

  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_4px] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href="/predict" className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[15px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{competitionLabel || ''}</div>
            </div>
            <div className="tf-tap w-[40px] h-[40px] grid place-items-center text-[var(--nav-text-quiet)] flex-none text-[17px]">⋯</div>
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)] relative">

          {isLoading && (
            <div>
              <div className="h-[230px] bg-[var(--nav-surface)]"></div>
              <div className="p-[18px_var(--gutter)]">
                <div className="h-[96px] rounded-[14px] bg-[var(--surface-subtle)]"></div>
                <div className="h-[96px] rounded-[14px] bg-[var(--surface-subtle)] mt-[12px]"></div>
                <div className="h-[96px] rounded-[14px] bg-[var(--surface-subtle)] mt-[12px]"></div>
              </div>
            </div>
          )}

          {isReady && (
            <div>
              <section className="relative overflow-hidden flex-none text-[var(--nav-text)] p-[8px_var(--gutter)_0]" style={{ background: heroBgMobile }}>
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(255,255,255,0.07)]"></div>
                <div className="absolute left-1/2 top-1/2 w-[150px] h-[150px] -ml-[75px] -mt-[75px] border border-[rgba(255,255,255,0.07)] rounded-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-[8px]">
                    <span className={`w-[7px] h-[7px] rounded-full flex-none ${urgent ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`} style={{ background: heroTone }}></span>
                    <span className="tf-kicker" style={{ color: heroTone }}>{HERO[0]}</span>
                  </div>

                  <div className="flex items-end gap-[10px] mt-[9px]">
                    <div className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]" style={{ color: urgent ? 'var(--color-danger)' : 'var(--nav-text)' }}>
                      {bannerRight}
                    </div>
                    <div className="text-[11px] leading-[1.4] text-[var(--nav-text-faint)] pb-[6px]">{HERO[1]}</div>
                  </div>

                  <div className="flex items-center gap-[14px] mt-[20px]">
                    <div className="flex-1 flex items-center gap-[9px] min-w-0">
                      <Crest logo={hLogo} code={hCode} color={CLUB[hCode] || '#666'} />
                      <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{hName}</span>
                    </div>
                    <span className={settled ? "font-heading font-bold text-[19px] tracking-[-0.6px] flex-none tf-num" : "font-heading font-semibold text-[10px] text-[var(--nav-text-faint)] flex-none"}>{scoreline}</span>
                    <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                      <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis text-right">{aName}</span>
                      <Crest logo={aLogo} code={aCode} color={CLUB[aCode] || '#666'} />
                    </div>
                  </div>

                  {!settled && (
                    <div className="flex items-center gap-[10px] mt-[20px]">
                      <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, background: locked ? 'var(--nav-text-faint)' : urgent ? 'var(--color-danger)' : 'var(--nav-accent)' }}></div>
                      </div>
                      <span className="tf-num font-heading font-bold text-[11px] flex-none">{answeredTotal} of {totalAnswerable}</span>
                    </div>
                  )}

                  <div className="text-[10.5px] leading-[1.5] text-[var(--nav-text-faint)] mt-[14px] pb-[16px]">{HERO[2]}</div>
                </div>
              </section>

              <section className="mt-[20px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_12px]">
                  <span className="tf-kicker text-[var(--text-muted)]">{settled ? "HOW IT SCORED" : "MARKETS"}</span>
                  <span className="tf-num font-heading font-bold text-[10px] text-[var(--text-muted)]">{settled ? `+${pointsEarned} OF ${pointsAtStake}` : `${pointsAtStake} POINTS AT STAKE`}</span>
                </div>

                {markets.map((m: any, idx: number) => (
                  <div key={idx} className={m.blockStyle}>
                    <div className="flex items-center gap-[10px]">
                      <span className="font-heading font-[650] text-[14px] leading-[1.2] tracking-[-0.2px]">{m.name}</span>
                      <span className={m.ptsStyle}>{m.pts}</span>
                      <span className="flex-1"></span>
                      <span className={m.rightStyle}>{m.right}</span>
                    </div>

                    {m.showChoices && (
                      <div className="flex gap-[7px] mt-[11px]">
                        {(m.tiles || []).map((o: any, j: number) => (
                          <div key={j} onClick={o.pick} className={o.style}>
                            <span className="font-heading font-[650] text-[12.5px] leading-[1.1]">{o.label}</span>
                            <span className={o.subStyle}>{o.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.showScore && (
                      <div>
                        <div className="flex items-end gap-[14px] mt-[11px]">
                          {(m.steppers || []).map((st: any, j: number) => (
                            <div key={j} className="flex-1 min-w-0">
                              <div className="flex items-center gap-[7px] mb-[7px]">
                                <span className="tf-crest w-[18px] h-[19px] text-[6.5px]" style={{ background: st.color }}>{st.code}</span>
                                <span className="font-heading font-[650] text-[11px] whitespace-nowrap overflow-hidden text-ellipsis">{st.team}</span>
                              </div>
                              <div className="flex items-center gap-[6px]">
                                <div onClick={st.dec} className={st.btnStyle}>−</div>
                                <div className={st.valueStyle}>{st.value}</div>
                                <div onClick={st.inc} className={st.btnStyle}>+</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={m.scoreNoteStyle}>{m.scoreNote}</div>
                      </div>
                    )}

                    {m.showPlayers && (
                      <div>
                        <div className="flex flex-col gap-[6px] mt-[11px]">
                          {((m as any).playerItems || []).map((p: any, j: number) => (
                            <div key={j} onClick={p.pick} className={p.style}>
                              <span className={p.badgeStyle}>{p.initials}</span>
                              <span className={p.nameStyle}>{p.name}</span>
                              <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{p.meta}</span>
                              <span className={p.markStyle}>{p.mark}</span>
                            </div>
                          ))}
                        </div>
                        {(m as any).searchHref ? (
                          <Link href={(m as any).searchHref} className={(m as any).searchStyle}>{(m as any).search}</Link>
                        ) : (
                          <div className={(m as any).searchStyle}>{(m as any).search}</div>
                        )}
                      </div>
                    )}

                    <div className={m.footStyle}>
                      <span onClick={m.toggleHistory} className={m.historyStyle}>{m.historyLink}</span>
                      <span className="flex-1"></span>
                      <span className={m.savedStyle}>SAVED</span>
                    </div>

                    {m.showHistory && (
                      <div className="mt-[10px] pt-[10px] border-t border-[var(--surface-border)]">
                        {(m.histories || []).map((h: any, j: number) => (
                          <div key={j} className="flex items-center gap-[9px] py-[4px]">
                            <span className={h.dotStyle}></span>
                            <span className={h.valueStyle}>{h.value}</span>
                            <span className="flex-1"></span>
                            <span className="tf-num text-[10px] text-[var(--text-muted)]">{h.when}</span>
                          </div>
                        ))}
                        <div className="text-[10px] leading-[1.5] text-[var(--text-muted)] mt-[6px]">Only the top line counted. The rest are kept so you can check a score, never re-score it.</div>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              <section className="mt-[22px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_12px]">
                  <span className="tf-kicker text-[var(--text-muted)]">LINEUPS</span>
                  <span className={locked ? "font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-muted)]" : "font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--danger-text)]"}>{lineupCloseLabel}</span>
                </div>
                {lineups.map((l: any, i: number) => (
                  <div onClick={l.pick} key={i} className={`tf-tap cursor-pointer ${l.rowStyle}`}>
                    <span className="tf-crest w-[30px] h-[32px] text-[9px]" style={{ background: l.color }}>{l.code}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{l.name}</div>
                      <div className={l.subStyle}>{l.sub}</div>
                    </div>
                    <span className={l.rightStyle}>{l.right}</span>
                  </div>
                ))}
              </section>

              {!locked && !settled && carryLabels.length > 0 && (
                <div onClick={() => setCopy('idle')} className="tf-tap flex items-center gap-[12px] mt-[22px] p-[15px_var(--gutter)] border-y border-[var(--surface-border)]">
                  <span className="w-[28px] h-[28px] rounded-[8px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-muted)] flex-none">⇉</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[13px]">Answer this match once</div>
                    <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{targets.length} other {targets.length === 1 ? 'league includes' : 'leagues include'} this match · {carryLabels.length} answers ready to carry</div>
                  </div>
                  <span className="font-heading font-bold text-[10px] text-[var(--text-link)] flex-none">COPY →</span>
                </div>
              )}

              <div className="p-[18px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">
                {settled ? "Provisional scores become final once review closes. If a market is voided it scores nothing for everyone, so nobody gains on you." : "There is no save button on this screen. Each market stores its own answer the moment you pick it, and you can change any of them until it locks."}
              </div>
            </div>
          )}

          {/* COPY SHEET */}
          {copy !== null && (
            <div className="absolute inset-0 z-50 bg-[var(--scrim)] flex flex-col justify-end">
              <div className="tf-scroll bg-[var(--surface-card)] rounded-[18px_18px_0_0] max-h-[88%] overflow-auto animate-[tfsheet_0.18s_ease]">
                <div className="p-[12px_var(--gutter)_20px]">
                  <div className="w-[34px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[16px]"></div>

                  {copy === 'idle' && (
                    <div>
                      <div className="font-heading font-bold text-[20px] leading-[1.15] tracking-[-0.5px]">Use these answers elsewhere</div>
                      <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Three other leagues you are in include this match. Each keeps its own copy — a later edit here changes nothing there.</div>

                      <div className="flex flex-col gap-[8px] mt-[16px]">
                        {targets.map((t: any, i: number) => (
                          <div key={i} onClick={t.toggle} className={t.cardStyle}>
                            <span className={t.boxStyle}>{t.check}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{t.league}</div>
                              <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{t.note}</div>
                              {t.hasFlag && <span className={t.flagStyle}>{t.flag}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="tf-kicker text-[var(--text-muted)] mt-[20px]">ANSWERS BEING COPIED</div>
                      <div className="flex flex-wrap gap-[6px] mt-[10px]">
                        {carrying.map((c: any, i: number) => (
                          <span key={i} className={c.style}>{c.label}</span>
                        ))}
                      </div>
                      <div className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[9px]">Only markets you have answered travel. Anything still blank here stays blank there.</div>

                      {copyError && (
                        <div className="mt-[14px] p-[10px_14px] rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] text-[var(--danger-text)] text-[12px]">{copyError}</div>
                      )}

                      <div onClick={() => { if (!copyPending) onCopyExecute?.(); }} className={copyPrimaryStyle}>
                        {copyPrimary}
                      </div>
                      <div onClick={() => setCopy(null)} className="tf-tap mt-[8px] h-[44px] grid place-items-center font-heading font-bold text-[12px] text-[var(--text-secondary)]">Not now</div>
                    </div>
                  )}

                  {copy === 'done' && (
                    <div>
                      <div className="font-heading font-bold text-[20px] leading-[1.15] tracking-[-0.5px]">Copied into {outcomes.filter((o: any) => o.icon === '✓').length} of {outcomes.length} leagues</div>
                      <div className="flex flex-col mt-[14px]">
                        {outcomes.map((o: any, i: number) => (
                          <div key={i} className={o.rowStyle}>
                            <span className={o.iconStyle}>{o.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-heading font-[650] text-[13px]">{o.league}</div>
                              <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[3px]">{o.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10.5px] leading-[1.6] text-[var(--text-muted)] mt-[13px]">Running it again is safe and changes nothing — the same answers land in the same places.</div>
                      <div onClick={() => setCopy(null)} className="tf-tap mt-[16px] h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]">Back to the fixture</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>

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

          <div className="max-w-[1080px] mx-auto px-[24px]">
            <div className="flex items-center gap-[9px] m-[20px_0_16px] text-[12px] text-[var(--text-muted)]">
              <Link href="/predict" className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">Predict</Link>
              <span>›</span>
              <span className="text-[var(--text-primary)]">{hName} v {aName}</span>
            </div>
          </div>

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
                    <div className="font-heading font-bold text-[32px] leading-[1] tracking-[-1.1px] whitespace-nowrap overflow-hidden text-ellipsis">{hName}</div>
                    <div className="text-[10px] text-[var(--nav-text-faint)] mt-[7px] tracking-[0.1em]">HOME</div>
                  </div>
                  <Crest logo={hLogo} code={hCode} color={homeColor} size={58} textSize={14} />
                </div>
                <div className="text-center flex-none min-w-[150px]">
                  <div className="tf-num font-heading font-bold leading-[1] tracking-[-2px]" style={{ fontSize: scoreSize }}>{scoreline}</div>
                </div>
                <div className="flex items-center gap-[16px] min-w-0">
                  <Crest logo={aLogo} code={aCode} color={awayColor} size={58} textSize={14} />
                  <div className="min-w-0">
                    <div className="font-heading font-bold text-[32px] leading-[1] tracking-[-1.1px] whitespace-nowrap overflow-hidden text-ellipsis">{aName}</div>
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

            <div className="flex items-baseline justify-between mt-[26px]">
              <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Markets</span>
              <span className="text-[11.5px] text-[var(--text-muted)]">{marketsHint}</span>
            </div>

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
                            <div key={j} onClick={opt.pick} style={opt.style}>
                              <span className="font-heading font-semibold text-[13px]">{opt.label}</span>
                              <span style={opt.subStyle}>{opt.sub}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {m.showScore && (
                        <div className="flex gap-[16px]">
                          {(m.steppers || []).map((st: any, j: number) => (
                            <div key={j} className="flex-1 flex items-center gap-[8px]">
                              <div onClick={st.dec} className={st.btnStyle}>−</div>
                              <div style={st.boxStyle}>
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
                            <div key={j} onClick={pl.pick} style={pl.style}>
                              <div style={pl.badgeStyle}>{pl.initials}</div>
                              <div className="flex-1 min-w-0"><span className="font-heading font-semibold text-[12.5px]">{pl.name}</span></div>
                              <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{pl.meta}</span>
                              <span style={pl.tickStyle}>✓</span>
                            </div>
                          ))}
                          {m.searchLabel && ((m as any).searchHref ? (
                            <Link href={(m as any).searchHref} className={m.searchStyle}>{m.searchLabel}</Link>
                          ) : (
                            <div className={m.searchStyle}>{m.searchLabel}</div>
                          ))}
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
                              <span style={h.dotStyle}></span>
                              <span style={h.valueStyle}>{h.value}</span>
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

            {canCopy && copy !== 'done' && (
              <div className="mt-[30px] pt-[22px] border-t border-[var(--surface-border)]">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Answer this match once</span>
                  <span className="text-[11.5px] text-[var(--text-muted)]">{copySub}</span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-[26px] mt-[16px] items-start">
                  <div className="flex flex-col gap-[10px]">
                    {targets.map((t: any, i: number) => (
                      <div key={i} className={t.cardStyle}>
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
                    {copyError && (
                      <div className="mt-[11px] p-[9px_12px] rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] text-[var(--danger-text)] text-[11.5px]">{copyError}</div>
                    )}
                    <div className={copyPrimaryStyle} onClick={() => { if (!copyPending) onCopyExecute?.(); }}>{copyPrimary}</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[11px]">Copying replaces whatever is already there. A market the target league doesn't run, or runs on a different line, is skipped rather than guessed.</div>
                  </div>
                </div>
              </div>
            )}

            {canCopy && copy === 'done' && (
              <div className="mt-[30px] pt-[22px] border-t border-[var(--surface-border)]">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading font-bold text-[19px] tracking-[-0.3px]">Copied into {outcomes.filter((o: any) => o.icon === '✓').length} of {outcomes.length} leagues</span>
                  <span onClick={() => setCopy(null)} className="text-[11.5px] font-heading font-semibold text-[var(--text-link)] cursor-pointer">Dismiss</span>
                </div>
                <div className="flex flex-col mt-[14px] max-w-[480px]">
                  {outcomes.map((o: any, i: number) => (
                    <div key={i} className={o.rowStyle}>
                      <span className={o.iconStyle}>{o.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-[650] text-[13px]">{o.league}</div>
                        <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[3px]">{o.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[13px]">Running it again is safe and changes nothing — the same answers land in the same places.</div>
              </div>
            )}

            <div className="m-[20px_0_30px] text-[11.5px] leading-[1.55] text-[var(--text-muted)] max-w-[640px]">{footNote}</div>

          </div>
        </div>
      </div>
    </>
  );
}
