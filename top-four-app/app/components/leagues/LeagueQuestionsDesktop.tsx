'use client';

import Link from 'next/link';

export function LeagueQuestionsDesktop({
  theme, rootNav, avatarInitials, avatarName, showContext, contextTabs,
  onList, onEmpty, onCreate, onResolve,
  heroStyle, heroTone, heroKicker, heroNum, heroSub, heroNote, newBtnStyle, setView,
  allIn, stake, committed, owing, openItems, pastGroups,
  qText, setQText, qType, setQType, types, TYPE, optionsList, setQOptions,
  qPoints, setQPoints, pointOptions, qCriteria, setQCriteria,
  canPublish, publishStyle, publishLabel, publishNoteStyle, publishNote, publishAction,
  previewText, previewPoints,
  outcomes, spellingsList, setSpellings, match, addSpelling,
  settleStyle, settleLabel, settleAction, resolveNotesList, toast, toastStyle,
  presets, applyPreset
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      {showContext && (
        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
            <span className="text-[11px] text-[var(--text-muted)]">128 members</span>
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const route = t.label === 'Overview' ? `/leagues/1` : `/leagues/1/${t.label.toLowerCase()}`;
              return (
                <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="tf-scroll flex-1 overflow-y-auto">
        
        {onList && (
          <div className="animate-[tfin_0.16s_ease]">
            <div style={heroStyle}>
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[26px]">
                <div className="flex-none">
                  <div className="tf-kicker" style={{ color: heroTone }}>{heroKicker}</div>
                  <div className="flex items-end gap-[10px] mt-[9px]">
                    <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]" style={{ color: heroTone }}>{heroNum}</span>
                    <span className="text-[12px] text-[var(--nav-text-faint)] pb-[6px]">{heroSub}</span>
                  </div>
                </div>
                <div className="flex-1 text-[12.5px] leading-[1.6] text-[var(--nav-text-faint)] max-w-[52ch]">{heroNote}</div>
                <div onClick={() => setView('create')} style={newBtnStyle}>New question</div>
              </div>
            </div>

            <div className="max-w-[1080px] mx-auto p-[24px_24px_30px] flex gap-[20px] items-start">
              <div className="flex-1 min-w-0">
                {/* Standings Predictor Interactive Banner */}
                <div className="mb-[20px] p-[16px_20px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--color-brand)]/40 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-heading font-bold text-[14px] flex items-center gap-[8px]">
                      <span>📊</span>
                      <span>Predict Final Standings & Tournament Paths</span>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-[3px]">
                      Predict the Premier League winner, Top 4, relegation, complete 1–20 table, or Champions League knockout road.
                    </p>
                  </div>
                  <Link
                    href="/predict/standings"
                    className="h-[36px] px-[16px] rounded-[10px] bg-[var(--color-brand)] text-white font-heading font-semibold text-[12.5px] flex items-center gap-[6px] hover:bg-[var(--color-brand)]/90 transition-all flex-none"
                  >
                    Open Standings Predictor →
                  </Link>
                </div>

                <div className="flex items-baseline justify-between gap-[10px]">
                  <div className="tf-kicker text-[var(--text-secondary)]">{allIn ? "OPEN — ALL ANSWERED" : "OPEN NOW"}</div>
                  <div className="tf-kicker text-[var(--text-muted)]">{committed} POINTS</div>
                </div>
                
                {openItems.map((q: any, i: number) => (
                  <div key={i} style={q.blockStyle}>
                    <div className="flex items-start gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <span style={q.chipStyle}>{q.chip}</span>
                        <div className="font-heading font-bold text-[17px] leading-[1.3] tracking-[-0.3px] mt-[10px]">{q.title}</div>
                      </div>
                      <div className="text-right flex-none">
                        <div className="tf-num" style={q.ptsStyle}>{q.pts}</div>
                        <div style={q.ptsUnitStyle}>{q.ptsUnit}</div>
                      </div>
                    </div>

                    {q.hasChoices && (
                      <div className="flex gap-[9px] mt-[14px]">
                        {q.choices.map((c: any, k: number) => (
                          <div key={k} onClick={c.pick} style={c.style}>{c.label}</div>
                        ))}
                      </div>
                    )}

                    {q.hasOptions && (
                      <div className="grid grid-cols-2 gap-[9px] mt-[14px]">
                        {q.options.map((o: any, k: number) => (
                          <div key={k} onClick={o.pick} style={o.style}>
                            <span style={o.markStyle}></span>
                            <span className="flex-1 min-w-0 font-heading font-semibold text-[12.5px]">{o.label}</span>
                            <span style={o.subStyle}>{o.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={q.criteriaStyle}>{q.criteria}</div>
                  </div>
                ))}
              </div>

              <div className="w-[352px] flex-none">
                {pastGroups.map((g: any, i: number) => (
                  <div key={i} style={g.wrapStyle}>
                    <div className="flex items-baseline justify-between gap-[10px]">
                      <span className="tf-kicker text-[var(--text-secondary)]">{g.kicker}</span>
                      <span className="tf-kicker text-[var(--text-muted)]">{g.right}</span>
                    </div>
                    <div className="mt-[10px] border-t border-[var(--surface-border)]">
                      {g.items.map((q: any, j: number) => (
                        <div key={j} style={q.blockStyle}>
                          <div className="flex items-start gap-[12px]">
                            <div className="flex-1 min-w-0">
                              <span style={q.chipStyle}>{q.chip}</span>
                              <div className="font-heading font-[650] text-[13.5px] leading-[1.35] tracking-[-0.2px] mt-[9px]">{q.title}</div>
                            </div>
                            <div className="text-right flex-none">
                              <div className="tf-num" style={q.ptsStyle}>{q.pts}</div>
                              <div style={q.ptsUnitStyle}>{q.ptsUnit}</div>
                            </div>
                          </div>
                          
                          <div style={q.answerStyle}>{q.answer}</div>
                          
                          {q.hasBars && (
                            <div className="mt-[11px] flex flex-col gap-[6px]">
                              {q.bars.map((b: any, k: number) => (
                                <div key={k} className="flex items-center gap-[9px]">
                                  <span style={b.labelStyle}>{b.label}</span>
                                  <div className="flex-1 h-[6px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                                    <div style={b.fillStyle}></div>
                                  </div>
                                  <span className="tf-num text-[10.5px] text-[var(--text-muted)] w-[22px] text-right">{b.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div style={q.criteriaStyle}>{q.criteria}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {onEmpty && (
          <div className="max-w-[1080px] mx-auto p-[150px_30px] flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] text-[var(--text-muted)]">?</div>
            <div className="font-heading font-bold text-[26px] leading-[1.15] tracking-[-0.7px] mt-[22px]">No questions in this league</div>
            <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[440px]">Questions are season-long calls — who wins the golden boot, whether a manager lasts to Christmas. They score onto the same table as fixtures, and a person settles them against written criteria.</div>
            <div onClick={() => setView('create')} className="mt-[24px] h-[46px] px-[24px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13px] cursor-pointer">Write the first one</div>
          </div>
        )}

        {onCreate && (
          <div className="max-w-[1080px] mx-auto p-[24px_24px_30px] flex gap-[20px] items-start animate-[tfin_0.16s_ease]">
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-[24px] leading-[1.15] tracking-[-0.6px]">New question</div>
              <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[7px] max-w-[64ch]">Everything here is fixed the moment somebody answers, because they answer partly on the point value. Only the criteria and the outcome date stay editable.</div>

              {/* Standings & Tournament Quick Presets */}
              <div className="mt-[20px] p-[14px_16px] rounded-[12px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="tf-kicker text-[var(--text-muted)]">⚡ 1-Click Standings & Tournament Presets</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Auto-populates wording & criteria</span>
                </div>
                <div className="flex flex-wrap gap-[6px]">
                  {presets && presets.length > 0 ? (
                    presets.map((p: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (applyPreset) {
                            applyPreset(p);
                          } else {
                            setQText(p.questionText);
                            setQCriteria(p.resolutionCriteria);
                            setQPoints(p.points);
                            setQType(p.answerKind === 'single_choice' ? 'choice' : p.answerKind === 'yes_no' ? 'yesno' : 'text');
                            if (p.options) setQOptions(p.options);
                          }
                        }}
                        className="h-[30px] px-[10px] rounded-[7px] bg-[var(--surface-canvas)] hover:bg-[var(--surface-subtle)] border border-[var(--surface-border-strong)] text-[11.5px] font-heading font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                      >
                        {p.questionText.length > 38 ? p.questionText.slice(0, 38) + '...' : p.questionText} ({p.points} pts)
                      </button>
                    ))
                  ) : (
                    <span className="text-[11.5px] text-[var(--text-muted)]">No presets available</span>
                  )}
                </div>
              </div>

              <div className="mt-[22px]">
                <div className="tf-kicker">Type</div>
                <div className="flex gap-[7px] mt-[9px]">
                  {types.map((t: any, i: number) => (
                    <div key={i} onClick={t.pick} style={t.style}>{t.label}</div>
                  ))}
                </div>
                <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[9px]">{TYPE[2]}</div>
              </div>

              <div className="mt-[20px]">
                <div className="tf-kicker">The question</div>
                <div onClick={() => setQText("Will Arsenal win the league?")} className={`mt-[9px] p-[14px_15px] rounded-[11px] border bg-[var(--surface-card)] font-heading font-semibold text-[14px] cursor-text ${qText ? 'border-[var(--surface-border-strong)] text-[var(--text-primary)]' : 'border-[var(--surface-border-strong)] text-[var(--text-muted)]'}`}>
                  {qText || "Write the question..."}
                </div>
              </div>

              {qType === "choice" && (
                <div className="mt-[20px]">
                  <div className="tf-kicker">Options</div>
                  <div className="flex flex-col gap-[7px] mt-[9px]">
                    {optionsList.map((o: any, i: number) => (
                      <div key={i} className="flex items-center gap-[10px] h-[42px] px-[13px] rounded-[10px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)]">
                        <span className="flex-1 font-heading font-semibold text-[12.5px]">{o.label}</span>
                        <span onClick={o.remove} style={o.removeStyle}>×</span>
                      </div>
                    ))}
                    <div onClick={() => setQOptions((s: any) => s.concat(`Option ${s.length + 1}`))} className="h-[42px] rounded-[10px] border border-dashed border-[var(--surface-border-strong)] grid place-items-center cursor-pointer font-heading font-semibold text-[12px] text-[var(--text-link)]">Add another option</div>
                  </div>
                </div>
              )}

              <div className="mt-[20px]">
                <div className="tf-kicker">Worth</div>
                <div className="flex gap-[7px] mt-[9px] max-w-[320px]">
                  {pointOptions.map((p: any, i: number) => (
                    <div key={i} onClick={p.pick} style={p.style}>{p.label}</div>
                  ))}
                </div>
              </div>

              <div className="mt-[20px]">
                <div className="tf-kicker">How it will be settled</div>
                <div onClick={() => setQCriteria("Settled on the final Premier League standings, on the day the season ends.")} className={`mt-[9px] p-[14px_15px] rounded-[11px] border bg-[var(--surface-card)] text-[12.5px] leading-[1.55] cursor-text ${qCriteria ? 'border-[var(--surface-border-strong)] text-[var(--text-primary)]' : 'border-[var(--color-danger)] text-[var(--text-muted)]'}`}>
                  {qCriteria || "Criteria..."}
                </div>
              </div>
            </div>

            <div className="w-[330px] flex-none">
              <div className="tf-card p-[18px_20px]">
                <div className="tf-kicker text-[var(--text-muted)]">Members will see</div>
                <div className="mt-[13px] p-[15px] rounded-[12px] bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]">
                  <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[3px_7px] rounded-[4px] bg-[var(--accent-surface)] text-[var(--accent-text-strong)] border border-[var(--accent-border)]">OPEN · ANSWER BY SAT 18:00</span>
                  <div className="font-heading font-bold text-[14px] leading-[1.35] tracking-[-0.2px] mt-[10px]">{previewText || "Your question will read here"}</div>
                  <div className="flex items-baseline gap-[5px] mt-[9px]">
                    <span className="tf-num font-heading font-bold text-[20px] tracking-[-0.6px]">{previewPoints}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-[18px] pt-[16px] border-t border-[var(--surface-border)]">
                <div className="font-heading font-bold text-[12.5px]">Fixed once answered</div>
                <div className="text-[11.5px] leading-[1.55] text-[var(--text-secondary)] mt-[6px]">Wording, options, deadline and point value. Members answer partly on what it is worth, so changing it afterwards would rewrite the bet they took.</div>
              </div>

              <div style={publishStyle} onClick={publishAction}>{publishLabel}</div>
              <div style={publishNoteStyle}>{publishNote}</div>
            </div>
          </div>
        )}

        {onResolve && (
          <div className="max-w-[1080px] mx-auto p-[24px_24px_30px] flex gap-[20px] items-start animate-[tfin_0.16s_ease]">
            <div className="flex-1 min-w-0">
              <div className="tf-kicker">Settling</div>
              <div className="font-heading font-bold text-[24px] leading-[1.2] tracking-[-0.6px] mt-[9px]">Who wins the golden boot?</div>
              <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[8px] max-w-[64ch]">128 members answered. Awarding an outcome pays out immediately and tells everybody what they scored.</div>

              <div className="mt-[22px]">
                <div className="tf-kicker">The outcome</div>
                <div className="flex flex-col gap-[8px] mt-[10px]">
                  {outcomes.map((o: any, i: number) => (
                    <div key={i} onClick={o.pick} style={o.style}>
                      <span style={o.markStyle}></span>
                      <span className="flex-1 min-w-0 font-heading font-[650] text-[13.5px]">{o.label}</span>
                      <span className="tf-num" style={o.countStyle}>{o.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-[22px]">
                <div className="tf-kicker">Accepted spellings</div>
                <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[6px]">Open-text answers only count if they match one of these. Add every form members actually typed.</div>
                <div className="flex flex-wrap gap-[7px] mt-[11px]">
                  {spellingsList.map((s: any, i: number) => (
                    <span key={i} className="flex items-center gap-[7px] h-[30px] px-[11px] rounded-full bg-[var(--surface-subtle)] font-heading font-semibold text-[11.5px]">
                      {s.label}
                      <span onClick={s.remove} className="cursor-pointer text-[var(--text-muted)]">×</span>
                    </span>
                  ))}
                  <span onClick={addSpelling} className="flex items-center h-[30px] px-[11px] rounded-full border border-dashed border-[var(--surface-border-strong)] font-heading font-semibold text-[11.5px] text-[var(--text-link)] cursor-pointer">+ Add</span>
                </div>
              </div>

              <div style={settleStyle} onClick={settleAction}>{settleLabel}</div>
            </div>

            <div className="w-[330px] flex-none">
              {resolveNotesList.map((n: any, i: number) => (
                <div key={i} style={n.wrapStyle}>
                  <div style={{ font: "700 12.5px 'DM Sans',sans-serif", color: n.titleColor }}>{n.title}</div>
                  <div style={{ fontSize: '11.5px', lineHeight: 1.55, marginTop: '6px', color: n.bodyColor }}>{n.body}</div>
                  <div style={n.effectWrapStyle}>
                    {n.effect && n.effect.map((e: any, j: number) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', padding: '7px 0', borderTop: `1px solid ${n.ruleColor}` }}>
                        <span style={{ fontSize: '11.5px', color: n.bodyColor }}>{e.label}</span>
                        <span className="tf-num" style={{ font: "700 12px 'DM Sans',sans-serif", color: n.titleColor }}>{e.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={n.footStyle}>{n.foot}</div>
                  <div style={n.actionStyle}>{n.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      <div style={toastStyle}>{toast}</div>
    </div>
  );
}
