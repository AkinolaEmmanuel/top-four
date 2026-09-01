'use client';

import Link from 'next/link';

export function LeagueAdminMobile({
  theme, params, tab, setTab, setSheet, setWho, setRole,
  headSub, HERO, loading, onMembers, onInvites, onRequests, onLifecycle,
  members, memberFilters, invites, requests, lifecycle, actions,
  fresh, setFresh, empty, invitesOpen, setInvitesOpen,
  sheetSpec, roles, toast,
  leagueName
}: any) {
  const segStyle = (on: boolean) =>
    `box-border flex-1 min-w-[88px] flex items-center justify-center gap-[6px] h-[38px] rounded-t-[9px] cursor-pointer font-heading font-bold text-[11px] ${on ? 'bg-[var(--surface-canvas)] text-[var(--text-primary)] border border-b-0 border-[var(--surface-border-strong)] pb-[1px]' : 'text-[var(--nav-text-faint)]'}`;

  const tabDefs = [
    { id: "members", label: "Members", count: "128" },
    { id: "invites", label: "Invites", count: "2" },
    { id: "requests", label: "Requests", count: "2" },
    { id: "lifecycle", label: "Lifecycle", count: "" }
  ].map(t => {
    const on = tab === t.id;
    return {
      label: t.label, count: t.count, style: segStyle(on),
      countStyle: `font-[tabular-nums] font-semibold ${t.count ? (t.id === "requests" && !on ? "text-[var(--danger-text)]" : "opacity-[0.55]") : "hidden"}`,
      pick: () => { setTab(t.id); setSheet(null); }
    };
  });

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_0]">
        <div className="flex items-center gap-[11px]">
          <Link href={`/leagues/${params.id}/more`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
          </div>
          <span className="tf-chip bg-[rgba(252,211,77,0.18)] text-[var(--nav-warning)] flex-none">OWNER</span>
        </div>

        <div className="flex items-end gap-[11px] mt-[16px]">
          <div className="tf-num font-heading font-bold text-[40px] leading-[0.88] tracking-[-1.8px]" style={{ color: HERO[3] }}>{HERO[0]}</div>
          <div className="pb-[5px] min-w-0">
            <div className="text-[11.5px] leading-[1.35]">{HERO[1]}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[3px]">{HERO[2]}</div>
          </div>
        </div>

        <div className="tf-scroll flex gap-[2px] mt-[16px] overflow-x-auto shadow-[inset_0_-1px_0_0_var(--surface-border-strong)]">
          {tabDefs.map((t, i) => (
            <div key={i} onClick={t.pick} className={t.style}>{t.label}<span className={t.countStyle}>{t.count}</span></div>
          ))}
        </div>
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">

        {loading && (
          <div>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] animate-[tfpulse_1.4s_ease-in-out_infinite]">
                <div className="w-[34px] h-[34px] rounded-full bg-[var(--surface-subtle)] flex-none"></div>
                <div className="flex-1">
                  <div className="h-[11px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: `${62 - i * 5}%` }}></div>
                  <div className="h-[8px] w-[32%] rounded-full bg-[var(--surface-subtle)] mt-[7px]"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {onMembers && (
          <div className="animate-[tfin_0.16s_ease]">
            <div className="tf-scroll flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto border-b border-[var(--surface-border)]">
              {memberFilters.map((f: any, i: number) => (
                <div key={i} onClick={f.pick} className={f.style}>{f.label}</div>
              ))}
            </div>
            {members.map((m: any, i: number) => (
              <div key={i} onClick={m.open} className={m.rowStyle}>
                <span className={m.avatarStyle}>{m.initials}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[7px] min-w-0">
                    <span className={m.nameStyle}>{m.name}</span>
                    <span className={m.youStyle}>YOU</span>
                  </div>
                  <div className="flex items-center gap-[6px] mt-[3px]">
                    <span className={m.dotStyle} style={{ backgroundColor: m.dotColor }}></span>
                    <span className="text-[10.5px] text-[var(--text-muted)]">{m.meta}</span>
                  </div>
                </div>
                <div className="text-right flex-none">
                  <div className="tf-num font-heading font-bold text-[13px]">{m.points}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">{m.rank}</div>
                </div>
              </div>
            ))}
            <div className="tf-tap p-[15px] text-center font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] border-b border-[var(--surface-border)]">LOAD 25 MORE</div>
            <div className="p-[18px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">A member who leaves keeps their history and their predictions stay hidden. Rejoining restores the same points — leaving is not a way to reset a score.</div>
          </div>
        )}

        {onInvites && (
          <div className="animate-[tfin_0.16s_ease]">
            {fresh && (
              <section className="bg-[var(--tf-navy-800)] text-[var(--tf-white)] p-[18px_var(--gutter)_20px]">
                <div className="flex items-center justify-between">
                  <span className="tf-kicker opacity-70">SHOWN ONCE — COPY IT NOW</span>
                  <span onClick={() => setFresh(false)} className="tf-tap font-heading font-bold text-[10px] tracking-[0.06em] opacity-70">DONE</span>
                </div>
                <div className="font-heading font-bold text-[30px] leading-[1] tracking-[2px] mt-[13px]">PPX-7T4M</div>
                <div className="flex items-center gap-[10px] mt-[14px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.1)]">
                  <span className="flex-1 text-[11.5px] opacity-85 whitespace-nowrap overflow-hidden text-ellipsis">topfour.app/j/PPX-7T4M</span>
                  <span className="tf-tap font-heading font-bold text-[10.5px] flex-none">COPY</span>
                </div>
                <div className="text-[11.5px] leading-[1.55] opacity-75 mt-[12px]">TopFour will not show this again. Every list after this carries the label and its status — never the code — so revoking is the only remedy if it gets out.</div>
              </section>
            )}
            <section className="p-[18px_var(--gutter)_0]">
              <div onClick={() => setFresh(true)} className="tf-tap h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)]">Create an invitation</div>
            </section>
            {empty && (
              <div className="p-[60px_30px] flex flex-col items-center text-center">
                <div className="font-heading font-bold text-[20px] leading-[1.2] tracking-[-0.5px]">No invitations yet</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[265px]">Make one per group you are inviting. A family code and a work code can then be revoked separately.</div>
              </div>
            )}
            {!empty && (
              <div>
                <div className="tf-kicker text-[var(--text-muted)] p-[22px_var(--gutter)_10px]">ISSUED</div>
                {invites.map((iv: any, i: number) => (
                  <div key={i} className={iv.rowStyle}>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{iv.label}</div>
                      <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{iv.meta}</div>
                    </div>
                    <div className="text-right flex-none">
                      <span className={`tf-chip ${iv.chipStyle}`}>{iv.chip}</span>
                      <div className={iv.actionStyle}>{iv.action}</div>
                    </div>
                  </div>
                ))}
                <div onClick={() => setInvitesOpen(!invitesOpen)} className="flex items-center gap-[12px] p-[16px_var(--gutter)] mt-[22px] border-y border-[var(--surface-border)] cursor-pointer">
                  <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex cursor-pointer ${invitesOpen ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                    <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-[var(--elev-1)]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">Accept new members</div>
                    <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">{invitesOpen ? "Codes work and requests come through." : "Every code stops working. Existing members are unaffected."}</div>
                  </div>
                </div>
                <div className="h-[26px]"></div>
              </div>
            )}
          </div>
        )}

        {onRequests && (
          <div className="animate-[tfin_0.16s_ease]">
            {empty && (
              <div className="p-[70px_30px] flex flex-col items-center text-center">
                <div className="font-heading font-bold text-[20px] leading-[1.2] tracking-[-0.5px]">Nothing waiting</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[265px]">Requests land here when somebody opens your link. You get a notification as well.</div>
              </div>
            )}
            {!empty && (
              <div>
                <div className="flex items-baseline justify-between p-[20px_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">2 PENDING · 1 ALREADY IN</span>
                  <span className="tf-tap font-heading font-bold text-[10.5px] text-[var(--text-link)]">APPROVE ALL</span>
                </div>
                {requests.map((r: any, i: number) => (
                  <div key={i} className={r.blockStyle}>
                    <div className="flex items-center gap-[11px]">
                      <span className={r.avatarStyle}>{r.initials}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{r.name}</div>
                        <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{r.meta}</div>
                      </div>
                      <span className={`tf-chip ${r.stateChipStyle}`}>{r.stateChip}</span>
                    </div>
                    {r.pending && (
                      <div className="flex gap-[8px] mt-[12px]">
                        <div onClick={r.approve} className="tf-tap flex-1 h-[44px] rounded-[11px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[12.5px]">Approve</div>
                        <div onClick={r.reject} className="tf-tap flex-1 h-[44px] rounded-[11px] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] grid place-items-center font-heading font-bold text-[12.5px]">Decline</div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-[18px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">A late joiner starts on zero and cannot answer anything already locked. A pending request does not take up one of the 10,000 places.</div>
              </div>
            )}
          </div>
        )}

        {onLifecycle && (
          <div className="animate-[tfin_0.16s_ease]">
            <section className="p-[22px_var(--gutter)_0]">
              <div className="tf-kicker text-[var(--text-muted)]">WHERE IT STANDS</div>
              <div className="mt-[14px]">
                {lifecycle.map((l: any, i: number) => (
                  <div key={i} className="flex gap-[12px] items-stretch">
                    <div className="flex flex-col items-center w-[12px] flex-none">
                      <div className={l.dotStyle}></div>
                      <div className={l.lineStyle}></div>
                    </div>
                    <div className={l.textWrapStyle}>
                      <div className={l.labelStyle}>{l.label}</div>
                      <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{l.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-[24px]">
              <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">WHAT YOU CAN DO TO IT</div>
              {actions.map((a: any, i: number) => (
                <div key={i} onClick={a.open} className={a.rowStyle}>
                  <div className="flex-1 min-w-0">
                    <div className={a.titleStyle}>{a.title}</div>
                    <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">{a.note}</div>
                  </div>
                  <span className={a.arrowStyle}>›</span>
                </div>
              ))}
            </section>
            <div className="h-[26px]"></div>
          </div>
        )}

      </main>

      {sheetSpec && (
        <div onClick={() => setSheet(null)} className="absolute inset-0 z-[5] bg-[var(--scrim)] flex items-end">
          <div onClick={(e: any) => e.stopPropagation()} className="w-full bg-[var(--surface-card)] rounded-[20px_20px_27px_27px] p-[18px_var(--gutter)_22px] animate-[tfup_0.22s_cubic-bezier(0.2,0.8,0.2,1)] shadow-[var(--elev-4)]">
            <div className="w-[38px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[15px]"></div>
            <div className="font-heading font-bold text-[18px] leading-[1.2] tracking-[-0.4px]">{sheetSpec.title}</div>
            <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">{sheetSpec.body}</div>
            {sheetSpec.roles && (
              <div className="flex flex-col gap-[7px] mt-[14px]">
                {roles.map((r: any, i: number) => (
                  <div key={i} onClick={r.pick} className={r.rowStyle}>
                    <div className={r.radioStyle}><div className={r.dotStyle}></div></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13px]">{r.label}</div>
                      <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[2px]">{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sheetSpec.list && (
              <div className="mt-[14px]">
                {sheetSpec.list.map((l: string, i: number) => (
                  <div key={i} className="flex gap-[10px] items-start py-[5px]">
                    <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-danger)] mt-[6px] flex-none"></span>
                    <span className="text-[12px] leading-[1.5] text-[var(--text-secondary)]">{l}</span>
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => { 
              if (sheetSpec.primaryAction) {
                sheetSpec.primaryAction();
              } else {
                setSheet(null);
              }
            }} className={`h-[47px] rounded-[12px] grid place-items-center cursor-pointer font-heading font-bold text-[13.5px] text-[var(--tf-white)] mt-[16px] ${sheetSpec.danger ? 'bg-[var(--color-danger)]' : 'bg-[var(--brand-fill)]'}`}>
              {sheetSpec.primary}
            </div>
            {sheetSpec.secondary && (
              <div onClick={() => {
                if (sheetSpec.secondaryAction) {
                  sheetSpec.secondaryAction();
                } else {
                  setSheet(null);
                }
              }} className="tf-tap h-[46px] rounded-[12px] grid place-items-center font-heading font-bold text-[13px] text-[var(--danger-text)] mt-[8px]">{sheetSpec.secondary}</div>
            )}
            <div onClick={() => setSheet(null)} className="tf-tap h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-secondary)] mt-[8px]">Cancel</div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute left-[14px] right-[14px] bottom-[20px] z-[6] p-[13px_15px] rounded-[12px] bg-[var(--nav-surface)] text-[var(--nav-text)] flex items-center gap-[10px] text-[12px] shadow-[var(--elev-3)] animate-[tfup_0.2s_ease]">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--nav-positive)] flex-none"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
