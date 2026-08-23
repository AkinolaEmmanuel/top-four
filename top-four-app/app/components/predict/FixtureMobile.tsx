'use client';

import Link from 'next/link';

export function FixtureMobile({ 
  theme, isLoading, isReady, settled, locked, urgent, clock, HERO, heroTone, 
  answeredTotal, pct, conflict, setResolved, a, setAnswers, markets, lineups, 
  carryLabels, setCopy, copy, targets, carrying, chosen, outcomes, CLUB
}: any) {
  
  const heroBg = `linear-gradient(103deg, color-mix(in srgb, ${CLUB.ARS} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${CLUB.CHE} 42%, transparent) 0%, transparent 52%), var(--nav-surface)`;

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_4px] flex-none">
        <div className="flex items-center gap-[11px]">
          <Link href="/predict" className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[15px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">Premier Predictors</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">Premier League · Round 3</div>
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
            <section className="relative overflow-hidden flex-none text-[var(--nav-text)] p-[8px_var(--gutter)_0]" style={{ background: heroBg }}>
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(255,255,255,0.07)]"></div>
              <div className="absolute left-1/2 top-1/2 w-[150px] h-[150px] -ml-[75px] -mt-[75px] border border-[rgba(255,255,255,0.07)] rounded-full"></div>
              <div className="relative">
                <div className="flex items-center gap-[8px]">
                  <span className={`w-[7px] h-[7px] rounded-full flex-none ${urgent ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`} style={{ background: heroTone }}></span>
                  <span className="tf-kicker" style={{ color: heroTone }}>{HERO[0]}</span>
                </div>

                <div className="flex items-end gap-[10px] mt-[9px]">
                  <div className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]" style={{ color: urgent ? 'var(--color-danger)' : 'var(--nav-text)' }}>
                    {settled ? "+3" : locked ? "15:00" : clock}
                  </div>
                  <div className="text-[11px] leading-[1.4] text-[var(--nav-text-faint)] pb-[6px]">{HERO[1]}</div>
                </div>

                <div className="flex items-center gap-[14px] mt-[20px]">
                  <div className="flex-1 flex items-center gap-[9px] min-w-0">
                    <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: CLUB.ARS }}>ARS</span>
                    <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">Arsenal</span>
                  </div>
                  <span className={settled ? "font-heading font-bold text-[19px] tracking-[-0.6px] flex-none tf-num" : "font-heading font-semibold text-[10px] text-[var(--nav-text-faint)] flex-none"}>{settled ? "2 — 0" : "SAT 15:00"}</span>
                  <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                    <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis text-right">Chelsea</span>
                    <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: CLUB.CHE }}>CHE</span>
                  </div>
                </div>

                {!settled && (
                  <div className="flex items-center gap-[10px] mt-[20px]">
                    <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, background: locked ? 'var(--nav-text-faint)' : urgent ? 'var(--color-danger)' : 'var(--nav-accent)' }}></div>
                    </div>
                    <span className="tf-num font-heading font-bold text-[11px] flex-none">{answeredTotal} of 8</span>
                  </div>
                )}

                <div className="text-[10.5px] leading-[1.5] text-[var(--nav-text-faint)] mt-[14px] pb-[16px]">{HERO[2]}</div>
              </div>
            </section>

            {conflict && (
              <section className="p-[16px_var(--gutter)] bg-[var(--warn-surface)] border-b border-[var(--surface-border)]">
                <div className="tf-kicker text-[var(--warn-text)]">ANSWERED SOMEWHERE ELSE</div>
                <div className="text-[12.5px] leading-[1.55] text-[var(--text-primary)] mt-[9px]">Match result is stored as <strong>Draw</strong>. This device was about to save <strong>Arsenal to win</strong>.</div>
                <div className="flex gap-[8px] mt-[13px]">
                  <div onClick={() => { setResolved(true); setAnswers({ ...a, result: "home" }); }} className="tf-tap flex-1 h-[44px] rounded-[11px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[12.5px]">Save Arsenal to win</div>
                  <div onClick={() => { setResolved(true); setAnswers({ ...a, result: "draw" }); }} className="tf-tap flex-1 h-[44px] rounded-[11px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px]">Keep Draw</div>
                </div>
              </section>
            )}

            <section className="mt-[20px]">
              <div className="flex items-baseline justify-between p-[0_var(--gutter)_12px]">
                <span className="tf-kicker text-[var(--text-muted)]">{settled ? "HOW IT SCORED" : "MARKETS"}</span>
                <span className="tf-num font-heading font-bold text-[10px] text-[var(--text-muted)]">{settled ? "+3 OF 18" : "18 POINTS AT STAKE"}</span>
              </div>

              {markets.map((m: any, idx: number) => (
                <div key={idx} className={m.blockStyle}>
                  <div className="flex items-center gap-[10px]">
                    <span className="font-heading font-[650] text-[14px] leading-[1.2] tracking-[-0.2px]">{m.name}</span>
                    <span className={m.ptsStyle}>{m.pts}</span>
                    <span className="flex-1"></span>
                    <span className={m.rightStyle}>{m.right}</span>
                  </div>

                  {m.showTiles && (
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
                      {!locked && !settled ? (
                        <Link href={`/predict/fixture/ARS/player`} className={(m as any).searchStyle}>{(m as any).search}</Link>
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
                <span className={locked ? "font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-muted)]" : "font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--danger-text)]"}>{settled ? "" : locked ? "CLOSED" : "CLOSE AT 13:00 · 15m"}</span>
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
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">3 other leagues include this match · {carryLabels.length} answers ready to carry</div>
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

                    <div onClick={() => { if (chosen) setCopy('done'); }} className={`mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${chosen ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
                      {chosen ? `Copy into ${chosen} ${chosen === 1 ? 'league' : 'leagues'}` : "Pick a league"}
                    </div>
                    <div onClick={() => setCopy(null)} className="tf-tap mt-[8px] h-[44px] grid place-items-center font-heading font-bold text-[12px] text-[var(--text-secondary)]">Not now</div>
                  </div>
                )}

                {copy === 'done' && (
                  <div>
                    <div className="font-heading font-bold text-[20px] leading-[1.15] tracking-[-0.5px]">Copied into 2 of 3 leagues</div>
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
  );
}
