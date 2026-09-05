'use client';

import Link from 'next/link';

export function LeagueQuestionsMobile({
  theme, view, params, setView, setSheet, admin, allIn, committed, stake, owing,
  groups, IconMap, tabs, onList, onEmpty, onCreate, onResolve,
  qText, setQText, types, TYPE, qType, optionsList, setQOptions,
  qPoints, pointOptions, qCriteria, setQCriteria, canPublish, publishAction,
  qDeadline, setQDeadline, qOutcomeAt, setQOutcomeAt, previewDeadlineLabel, publishLabel: publishActionLabel, publishNote: publishActionNote,
  resolveTitle, resolveSubtitle, outcomes, resolveIsText, resolveText, setResolveText,
  canSettleNow, settleLabel,
  match, resolveNotesList, SHEET, toast, settleAction, voidAction,
  presets, applyPreset, leagueName
}: any) {
  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_16px] flex-none">
        <div className="flex items-center gap-[11px]">
          <Link href={`/leagues/${params.id}/more`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px]">{onCreate ? "Ask a question" : onResolve ? "Settle a question" : "Questions"}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{leagueName ? (admin ? `${leagueName} · you are an admin` : `${leagueName} · written and settled by admins`) : ''}</div>
          </div>
          {(onList || onEmpty) && (
            <div onClick={() => setView("create")} className="h-[32px] px-[12px] rounded-[8px] bg-[var(--nav-accent)] text-[var(--nav-on-accent)] grid place-items-center cursor-pointer font-heading font-bold text-[10px] tracking-[0.06em] flex-none">ASK</div>
          )}
        </div>

        {onList && (
          <div className="flex items-end gap-[11px] mt-[16px]">
            <div className="tf-num font-heading font-bold text-[38px] leading-[0.9] tracking-[-1.6px]" style={{ color: allIn ? "var(--nav-positive)" : "var(--nav-warning)" }}>{allIn ? String(committed) : String(stake)}</div>
            <div className="pb-[5px] min-w-0">
              <div className="text-[11.5px] leading-[1.35]">{allIn ? "points already committed" : "points still unclaimed"}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[3px]">
                {allIn ? "Every open question is answered. You can change them until Saturday." : `${owing}${owing === 1 ? ' question unanswered' : ' questions unanswered'} · earliest closes Sat 18:00`}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {onList && (
          <div className="p-[14px_var(--gutter)_0]">
            <Link
              href="/predict/standings"
              className="flex items-center justify-between p-[12px_14px] rounded-[12px] bg-[var(--surface-card)] border border-[var(--color-brand)]/40 shadow-sm"
            >
              <div className="flex items-center gap-[8px]">
                <span className="text-[16px]">📊</span>
                <span className="font-heading font-bold text-[12.5px]">Predict Final Standings & Tables</span>
              </div>
              <span className="text-[12px] text-[var(--color-brand)] font-bold">Open →</span>
            </Link>
          </div>
        )}

        {onList && (
          <div className="animate-[tfin_0.16s_ease]">
            {groups.map((g: any, i: number) => (
              <section key={i} className="mt-[20px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">{g.kicker}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{g.right}</span>
                </div>

                {g.items.map((q: any, j: number) => (
                  <div key={j} className={q.blockStyle}>
                    <div className="flex items-start gap-[12px]">
                      <div className="flex-1 min-w-0">
                        <span className={`tf-chip ${q.chipStyle}`}>{q.chip}</span>
                        <div className="font-heading font-[650] text-[16px] leading-[1.3] tracking-[-0.3px] mt-[9px]">{q.title}</div>
                      </div>
                      <div className="text-right flex-none pt-[1px]">
                        <div className={`tf-num ${q.ptsStyle}`}>{q.pts}</div>
                        <div className={q.ptsUnitStyle}>{q.ptsUnit}</div>
                      </div>
                    </div>

                    {q.hasChoices && (
                      <div className="flex gap-[7px] mt-[12px]">
                        {q.choices.map((c: any, k: number) => (
                          <div key={k} onClick={c.pick} className={c.style}>{c.label}</div>
                        ))}
                      </div>
                    )}

                    {q.hasOptions && (
                      <div className="flex flex-col gap-[6px] mt-[12px]">
                        {q.options.map((o: any, k: number) => (
                          <div key={k} onClick={o.pick} className={o.style}>
                            <span className={o.markStyle}></span>
                            <span className="flex-1 min-w-0 font-heading font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{o.label}</span>
                            <span className={o.subStyle}>{o.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.hasBars && (
                      <div className="flex flex-col gap-[7px] mt-[12px]">
                        {q.bars.map((b: any, k: number) => (
                          <div key={k} className="flex items-center gap-[10px]">
                            <span className={b.labelStyle}>{b.label}</span>
                            <div className="flex-1 h-[4px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                              <div className={b.fillStyle}></div>
                            </div>
                            <span className="tf-num text-[10px] text-[var(--text-muted)] w-[24px] text-right flex-none">{b.count}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.hasText && (
                      <div className="flex gap-[7px] mt-[12px]">
                        <input
                          type="text"
                          value={q.textValue}
                          onChange={(e) => q.setTextValue(e.target.value)}
                          placeholder={q.textPlaceholder}
                          className="tf-field flex-1"
                        />
                        <div onClick={q.submitTextValue} className="tf-tap h-[44px] px-[16px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[12px]">Save</div>
                      </div>
                    )}

                    <div className={q.answerStyle}>{q.answer}</div>
                    <div className={q.criteriaStyle}>{q.criteria}</div>

                    {q.canSettle && (
                      <div onClick={q.settleAction} className="tf-tap mt-[12px] text-[11.5px] font-heading font-bold text-[var(--color-brand)]">{q.settleLabel}</div>
                    )}
                  </div>
                ))}
              </section>
            ))}

            <div className="p-[20px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">A question carries points onto the same table as the fixtures. An admin settles each one against the criteria written underneath it, and a settlement that is later corrected stays on record.</div>
          </div>
        )}

        {onEmpty && (
          <div className="p-[80px_30px] flex flex-col items-center text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[20px] text-[var(--text-muted)]">?</div>
            <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px] mt-[20px]">Nobody has asked anything</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">Questions are written by this league's admins and settled by them too. They carry points onto the same table as the fixtures.</div>
            <div className="tf-tap mt-[22px] h-[46px] px-[20px] rounded-[12px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] grid place-items-center font-heading font-bold text-[12px]">READ THE LEAGUE RULES</div>
          </div>
        )}

        {onCreate && (
          <div className="p-[20px_var(--gutter)_26px] animate-[tfin_0.16s_ease]">
            <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)]">Wording, options, deadline and point value lock the moment somebody answers — they answered partly on the value. Only the criteria and the outcome date stay editable after that.</div>

            <div className="tf-kicker text-[var(--text-muted)] mt-[22px]">THE QUESTION</div>
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Write the question. Keep it to one fact with one answer."
              className="w-full min-h-[72px] rounded-[12px] p-[13px] mt-[10px] bg-[var(--surface-card)] border border-[var(--surface-border-strong)] text-[13px] leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
            />

            <div className="tf-kicker text-[var(--text-muted)] mt-[20px]">ANSWER TYPE</div>
            <div className="flex gap-[6px] mt-[10px]">
              {types.map((t: any, i: number) => (
                <div key={i} onClick={t.pick} className={t.style}>{t.label}</div>
              ))}
            </div>
            <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[8px]">{TYPE[2]}</div>

            {qType === "choice" && (
              <div>
                <div className="tf-kicker text-[var(--text-muted)] mt-[20px]">OPTIONS</div>
                <div className="flex flex-col gap-[7px] mt-[10px]">
                  {optionsList.map((o: any, i: number) => (
                    <div key={i} className="tf-field">
                      <input
                        type="text"
                        value={o.label}
                        onChange={(e) => o.update(e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-transparent outline-none"
                      />
                      <span onClick={o.remove} className={o.removeStyle}>×</span>
                    </div>
                  ))}
                  <div onClick={() => setQOptions((s: any) => s.concat(''))} className="tf-tap min-h-[44px] rounded-[12px] border border-dashed border-[var(--surface-border-strong)] grid place-items-center text-[12px] text-[var(--text-muted)]">+ add an option</div>
                </div>
              </div>
            )}

            <div className="flex items-baseline justify-between mt-[20px]">
              <span className="tf-kicker text-[var(--text-muted)]">WORTH</span>
              <span className="tf-num font-heading font-bold text-[16px]">{qPoints} pts</span>
            </div>
            <div className="flex gap-[6px] mt-[10px]">
              {pointOptions.map((p: any, i: number) => (
                <div key={i} onClick={p.pick} className={p.style}>{p.label}</div>
              ))}
            </div>
            <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[8px]">
              {qPoints >= 25 ? "A match result is worth 5. At 25, this one question outweighs five matches." : "For scale, a match result is worth 5 and an exact score 1."}
            </div>

            <div className="flex gap-[10px] mt-[20px]">
              <div className="flex-1 min-w-0">
                <div className="tf-kicker text-[var(--text-muted)]">ANSWER BY</div>
                <input
                  type="datetime-local"
                  value={qDeadline}
                  onChange={(e) => setQDeadline(e.target.value)}
                  className="tf-field mt-[10px] w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="tf-kicker text-[var(--text-muted)]">OUTCOME KNOWN</div>
                <input
                  type="datetime-local"
                  value={qOutcomeAt}
                  onChange={(e) => setQOutcomeAt(e.target.value)}
                  className="tf-field mt-[10px] w-full"
                />
              </div>
            </div>

            <div className="flex items-baseline gap-[8px] mt-[20px]">
              <span className="tf-kicker text-[var(--text-muted)]">HOW IT GETS SETTLED</span>
              <span className="font-heading font-bold text-[9.5px] text-[var(--danger-text)]">REQUIRED</span>
            </div>
            <textarea
              value={qCriteria}
              onChange={(e) => setQCriteria(e.target.value)}
              placeholder="Name the source that decides this."
              className={`w-full min-h-[64px] rounded-[12px] p-[13px] mt-[10px] bg-[var(--surface-card)] text-[12.5px] leading-[1.5] border resize-none placeholder:text-[var(--text-muted)] ${qCriteria ? 'border-[var(--surface-border-strong)] text-[var(--text-primary)]' : 'border-[var(--color-danger)] text-[var(--text-primary)]'}`}
            />
            <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[8px]">Members read this before answering. Name the source that decides it, so nobody argues later.</div>

            <div className="tf-kicker text-[var(--text-muted)] mt-[22px]">HOW IT WILL READ</div>
            <div className="border border-[var(--surface-border)] rounded-[14px] p-[15px] mt-[10px] bg-[var(--surface-card)]">
              <span className="tf-chip bg-[var(--accent-surface)] text-[var(--accent-text-strong)]">{`OPEN · ANSWER BY ${previewDeadlineLabel}`}</span>
              <div className="flex items-start gap-[12px] mt-[10px]">
                <span className="flex-1 font-heading font-[650] text-[15px] leading-[1.3] tracking-[-0.3px]">{qText || "Your question will read here"}</span>
                <span className="tf-num font-heading font-bold text-[22px] tracking-[-0.7px] flex-none">{qPoints}</span>
              </div>
              <div className={`text-[10.5px] leading-[1.5] mt-[9px] ${qCriteria ? 'text-[var(--text-muted)]' : 'text-[var(--danger-text)]'}`}>{qCriteria || "Criteria is required before this can go live."}</div>
            </div>

            <div onClick={() => { if (canPublish && publishAction) publishAction(); }} className={`mt-[22px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${canPublish ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              {publishActionLabel}
            </div>
            <div className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[10px] text-center">
              {publishActionNote}
            </div>
          </div>
        )}

        {onResolve && (
          <div className="animate-[tfin_0.16s_ease]">
            <section className="p-[20px_var(--gutter)_0]">
              <div className="flex items-center justify-between">
                <span className="tf-chip bg-[var(--warn-surface)] text-[var(--warn-text)]">NEEDS SETTLING</span>
              </div>
              <div className="font-heading font-bold text-[20px] leading-[1.25] tracking-[-0.5px] mt-[12px]">{resolveTitle}</div>
              <div className="text-[12px] leading-[1.55] text-[var(--text-secondary)] mt-[8px]">{resolveSubtitle}</div>
            </section>

            <section className="mt-[22px]">
              <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">{resolveIsText ? "CORRECT ANSWER" : "PICK THE OUTCOME"}</div>
              {resolveIsText ? (
                <div className="px-[var(--gutter)]">
                  <input
                    type="text"
                    value={resolveText}
                    onChange={(e) => setResolveText(e.target.value)}
                    placeholder="Type the correct answer…"
                    className="tf-field w-full"
                  />
                  <div className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[8px]">Matched ignoring case and outer spaces against what members submitted.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-[6px] px-[var(--gutter)]">
                  {(outcomes || []).map((o: any, i: number) => (
                    <div key={i} onClick={o.pick} className={o.style}>
                      <span className={o.markStyle}></span>
                      <span className="flex-1 min-w-0 font-heading font-semibold text-[13px]">{o.label}</span>
                      <span className={o.countStyle}>{o.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="p-[20px_var(--gutter)_0]">
              <div onClick={() => { if (canSettleNow) setSheet("settle"); }} className={`tf-tap h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${canSettleNow ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>{settleLabel}</div>
              <div onClick={() => setSheet("void")} className="tf-tap h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px] mt-[8px]">Void it instead</div>
            </section>

            <section className="mt-[24px]">
              {resolveNotesList.map((n: any, i: number) => (
                <div key={i} className={n.rowStyle}>
                  <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{n.title}</div>
                  <div className="text-[12px] leading-[1.55] text-[var(--text-secondary)] mt-[6px]">{n.body}</div>
                  {n.hasEffect && (
                    <div className="mt-[10px] p-[11px_13px] rounded-[10px] bg-[var(--surface-subtle)]">
                      {n.effect.map((e: any, j: number) => (
                        <div key={j} className="flex justify-between gap-[10px] py-[3px]">
                          <span className="text-[11.5px] text-[var(--text-secondary)]">{e.label}</span>
                          <span className="tf-num font-heading font-semibold text-[11.5px]">{e.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {n.hasAction && (
                    <div className={n.actionStyle}>{n.action}</div>
                  )}
                  {n.hasFoot && (
                    <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[9px]">{n.foot}</div>
                  )}
                </div>
              ))}
            </section>
            <div className="h-[26px]"></div>
          </div>
        )}

      </main>

      <nav className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] grid grid-cols-4 p-[7px_7px_8px] min-h-[66px]">
        {tabs.map((t: any, i: number) => {
          const RenderIcon = IconMap[t.ic];
          const route = t.label === 'OVERVIEW' ? `/leagues/${params.id}` : `/leagues/${params.id}/${t.label.toLowerCase()}`;
          return (
            <Link href={route} key={i} className="flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-[1]" style={{ color: t.on ? 'var(--color-brand)' : 'var(--text-muted)' }}>
              <div className="w-[19px] h-[19px] grid place-items-center"><RenderIcon /></div>
              <span className="mt-[6px] tracking-[0.01em]">{t.label}</span>
            </Link>
          );
        })}
      </nav>

      {SHEET && (
        <div className="absolute inset-0 z-[5] bg-[var(--scrim)] flex items-end p-[14px]">
          <div className="w-full bg-[var(--surface-card)] rounded-[16px] p-[16px] animate-[tfsheet_0.18s_ease]">
            <div className="font-heading font-bold text-[16px] leading-[1.25] tracking-[-0.3px]">{SHEET[0]}</div>
            <div className="text-[12.5px] leading-[1.55] text-[var(--text-secondary)] mt-[8px]">{SHEET[1]}</div>
            <div className="mt-[12px] p-[12px_13px] rounded-[11px] bg-[var(--surface-subtle)]">
              {(SHEET[2] as [string, string][]).map((e, i) => (
                <div key={i} className="flex justify-between gap-[10px] py-[3px]">
                  <span className="text-[11.5px] text-[var(--text-secondary)]">{e[0]}</span>
                  <span className="tf-num font-heading font-semibold text-[11.5px]">{e[1]}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-[8px] mt-[14px]">
              <div onClick={() => setSheet(null)} className="tf-tap flex-1 h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px]">Cancel</div>
              <div onClick={() => {
                const voided = SHEET[4];
                setSheet(null);
                if (voided) {
                  if (voidAction) voidAction();
                } else if (settleAction) {
                  settleAction();
                }
              }} className={`flex-1 h-[46px] rounded-[12px] grid place-items-center cursor-pointer font-heading font-bold text-[12.5px] text-[var(--tf-white)] ${SHEET[4] ? 'bg-[var(--color-danger)]' : 'bg-[var(--brand-fill)]'}`}>
                {SHEET[3]}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute left-[14px] right-[14px] bottom-[78px] z-[4] p-[12px_15px] rounded-[12px] bg-[var(--nav-surface)] text-[var(--nav-text)] flex items-center gap-[10px] shadow-[var(--elev-3)] animate-[tfin_0.16s_ease]">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--nav-positive)] flex-none"></span>
          <span className="text-[12px] leading-[1.4]">{toast}</span>
        </div>
      )}

    </div>
  );
}
