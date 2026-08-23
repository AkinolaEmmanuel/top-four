'use client';

import Link from 'next/link';

export function LeagueAdminDesktop({
  theme, rootNav, avatarInitials, avatarName, contextTabs,
  tab, setTab, setSheet,
  heroStyle, heroBig, heroTone, heroLabel, heroSub, heroRole,
  loading, onMembers, onInvites, onRequests, onLifecycle,
  members, memberFilters, invites, requests, lifecycle, actions,
  fresh, setFresh, empty, invitesOpen, setInvitesOpen,
  sheetSpec, roles, toast
}: any) {

  const segStyle = (on: boolean) =>
    `flex items-center gap-[7px] h-[38px] px-[16px] rounded-[8px] cursor-pointer font-heading font-bold text-[12px] ${on ? 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border-strong)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`;

  const tabDefs = [
    { id: "members", label: "Members", count: "128" },
    { id: "invites", label: "Invites", count: "2" },
    { id: "requests", label: "Requests", count: "2" },
    { id: "lifecycle", label: "Lifecycle", count: "" }
  ].map(t => {
    const on = tab === t.id;
    return {
      label: t.label, count: t.count, style: segStyle(on),
      countStyle: `font-heading text-[11px] ml-[3px] ${t.count ? (t.id === "requests" && !on ? "text-[var(--danger-text)]" : "text-[var(--text-muted)]") : "hidden"}`,
      pick: () => { setTab(t.id); setSheet(null); }
    };
  });

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      {/* League context bar */}
      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px]">
          <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
          <span className="text-[11px] text-[var(--text-muted)]">You own this league</span>
        </div>
        <div className="flex items-center gap-[2px] ml-auto">
          {contextTabs.map((t: any, i: number) => {
            const route = t.label === 'Overview' ? `/leagues/1` : `/leagues/1/${t.label.toLowerCase()}`;
            return <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>;
          })}
        </div>
      </div>

      <div className="tf-scroll flex-1 overflow-y-auto">
        {/* Hero */}
        <div style={heroStyle}>
          <div className="max-w-[1080px] mx-auto px-[24px] flex items-end gap-[22px]">
            <span className="tf-num font-heading font-bold text-[52px] leading-[0.86] tracking-[-2.2px]" style={{ color: heroTone }}>{heroBig}</span>
            <div className="flex-1 min-w-0 pb-[5px]">
              <div className="font-heading font-semibold text-[13.5px]" style={{ color: heroTone }}>{heroLabel}</div>
              <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[4px]">{heroSub}</div>
            </div>
            <div className="flex-none pb-[5px] font-heading font-bold text-[10px] tracking-[0.09em] text-[var(--nav-text-faint)]">{heroRole}</div>
          </div>
        </div>

        <div className="max-w-[1080px] mx-auto px-[24px] pb-[30px]">
          {/* Admin tabs */}
          <div className="flex items-center gap-[6px] pt-[18px]">
            {tabDefs.map((t, i) => (
              <div key={i} onClick={t.pick} className={t.style}>
                {t.label}<span className={t.countStyle}>{t.count}</span>
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-[24px] border-t border-[var(--surface-border)]">
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} className="grid gap-[14px] items-center p-[15px_18px] border-b border-[var(--surface-border)]" style={{ gridTemplateColumns: '38px 1fr 120px 90px 150px' }}>
                  <div className="w-[34px] h-[34px] rounded-full bg-[var(--surface-subtle)] animate-pulse"></div>
                  <div className="h-[11px] rounded bg-[var(--surface-subtle)] animate-pulse" style={{ width: `${62 - i * 5}%` }}></div>
                  <div className="h-[11px] rounded bg-[var(--surface-subtle)] animate-pulse"></div>
                  <div className="h-[11px] rounded bg-[var(--surface-subtle)] animate-pulse"></div>
                  <div className="h-[11px] rounded bg-[var(--surface-subtle)] animate-pulse"></div>
                </div>
              ))}
            </div>
          )}

          {/* Members table */}
          {onMembers && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="flex items-center gap-[9px] mt-[22px]">
                {memberFilters.map((f: any, i: number) => (
                  <div key={i} onClick={f.pick} className={f.style}>{f.label}</div>
                ))}
                <div className="flex-1"></div>
                <button className="h-[36px] px-[14px] rounded-[9px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] font-heading font-bold text-[11.5px] cursor-pointer">Export members</button>
                <button className="h-[36px] px-[14px] rounded-[9px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[11.5px] cursor-pointer">Invite people</button>
              </div>

              <div className="mt-[14px]">
                <div className="grid gap-[14px] items-center p-[11px_18px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]" style={{ gridTemplateColumns: '38px minmax(0,1fr) 120px 96px 170px 44px' }}>
                  <span></span>
                  <span className="tf-kicker">Member</span>
                  <span className="tf-kicker">Role</span>
                  <span className="tf-kicker text-right">Points</span>
                  <span className="tf-kicker">Standing</span>
                  <span></span>
                </div>
                {members.map((m: any, i: number) => (
                  <div key={i} onClick={m.open} className="grid gap-[14px] items-center p-[13px_18px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors" style={{ gridTemplateColumns: '38px minmax(0,1fr) 120px 96px 170px 44px' }}>
                    <div className="w-[34px] h-[34px] rounded-full bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[11px] text-[var(--text-secondary)]">{m.initials}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-[8px]">
                        <span className="font-heading font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{m.name}</span>
                        {m.you && <span className="font-heading font-bold text-[8.5px] tracking-[0.08em] px-[5px] py-[2px] rounded bg-[var(--color-brand)] text-[var(--color-on-brand)]">you</span>}
                      </div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{m.meta}</div>
                    </div>
                    <span className="font-heading font-semibold text-[12px]" style={{ color: m.dotColor }}>{m.role}</span>
                    <span className="tf-num font-heading font-bold text-[13px] text-right">{m.points}</span>
                    <span className="text-[11.5px] text-[var(--text-muted)]">{m.rank}</span>
                    <span className="text-[18px] text-[var(--text-muted)] cursor-pointer">⋯</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[12px]">A former member keeps their points and their place in the table. Removing somebody stops them playing on; it never edits the history they already made.</div>
            </div>
          )}

          {/* Invites */}
          {onInvites && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="flex items-end justify-between mt-[22px]">
                <div>
                  <div className="font-heading font-bold text-[19px] tracking-[-0.3px]">Invitation links</div>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">Anyone with a live link can request to join. Approval is still yours.</div>
                </div>
                <button onClick={() => setFresh(true)} className="h-[42px] px-[16px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px] cursor-pointer">New invite link</button>
              </div>

              {fresh && (
                <div className="mt-[16px] p-[18px_20px] rounded-[12px] bg-[var(--tf-navy-800)] text-[var(--tf-white)]">
                  <div className="flex items-center justify-between">
                    <span className="tf-kicker opacity-70">SHOWN ONCE — COPY IT NOW</span>
                    <span onClick={() => setFresh(false)} className="cursor-pointer font-heading font-bold text-[10px] tracking-[0.06em] opacity-70">DONE</span>
                  </div>
                  <div className="font-heading font-bold text-[30px] leading-[1] tracking-[2px] mt-[13px]">PPX-7T4M</div>
                  <div className="flex items-center gap-[10px] mt-[14px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.1)]">
                    <span className="flex-1 text-[11.5px] opacity-85">topfour.app/j/PPX-7T4M</span>
                    <span className="cursor-pointer font-heading font-bold text-[10.5px] flex-none">COPY</span>
                  </div>
                </div>
              )}

              <div className="mt-[18px] border-t border-[var(--surface-border)]">
                {invites.map((iv: any, i: number) => (
                  <div key={i} className={`flex items-center gap-[16px] py-[14px] border-b border-[var(--surface-border)] ${!iv.active ? 'opacity-55' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[14px]">{iv.label}</div>
                      <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px]">{iv.meta}</div>
                    </div>
                    <span className={`tf-chip ${iv.chipStyle}`}>{iv.chip}</span>
                    {iv.active && <span className="font-heading font-semibold text-[11px] text-[var(--danger-text)] cursor-pointer">Revoke</span>}
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[12px]">Revoking a link stops new requests. It never removes people who already joined through it.</div>
            </div>
          )}

          {/* Requests */}
          {onRequests && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="flex items-end justify-between mt-[22px]">
                <div>
                  <div className="font-heading font-bold text-[19px] tracking-[-0.3px]">Join requests</div>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">Any owner or admin can act — whoever gets there first.</div>
                </div>
                <div className="text-[11.5px] text-[var(--text-muted)]">Oldest asked yesterday</div>
              </div>

              {empty ? (
                <div className="mt-[48px] flex flex-col items-center text-center">
                  <div className="font-heading font-bold text-[19px] tracking-[-0.3px]">Nothing waiting</div>
                  <div className="text-[12.5px] text-[var(--text-secondary)] mt-[10px]">Requests land here when somebody opens your link.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-[12px] mt-[14px]">
                  {requests.map((r: any, i: number) => (
                    <div key={i} className={`tf-card p-[16px_18px] flex items-center gap-[14px] ${r.pending ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)] border-l-0' : ''}`}>
                      <div className="w-[36px] h-[36px] rounded-full bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[11px] text-[var(--text-secondary)] flex-none">{r.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[14px]">{r.name}</div>
                        <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px]">{r.meta}</div>
                      </div>
                      {r.stateChip && <span className={`tf-chip ${r.stateChipStyle}`}>{r.stateChip}</span>}
                      {r.pending && (
                        <div className="flex gap-[8px] flex-none">
                          <button onClick={r.approve} className="h-[38px] px-[16px] rounded-[9px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px] cursor-pointer">Approve</button>
                          <button onClick={r.reject} className="h-[38px] px-[16px] rounded-[9px] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] font-heading font-bold text-[12px] cursor-pointer">Decline</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[16px]">A late joiner starts on zero and cannot answer anything already locked. A pending request does not take up one of the 10,000 places.</div>
            </div>
          )}

          {/* Lifecycle */}
          {onLifecycle && (
            <div className="animate-[tfin_0.16s_ease] flex gap-[32px] mt-[24px] items-start">
              <div className="flex-1 min-w-0">
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
              </div>

              <div className="w-[380px] flex-none">
                <div className="tf-kicker text-[var(--text-muted)]">WHAT YOU CAN DO TO IT</div>
                <div className="mt-[10px] border-t border-[var(--surface-border)]">
                  {actions.map((a: any, i: number) => (
                    <div key={i} onClick={a.open} className={a.rowStyle}>
                      <div className="flex-1 min-w-0">
                        <div className={a.titleStyle}>{a.title}</div>
                        <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">{a.note}</div>
                      </div>
                      <span className={a.arrowStyle}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div className="absolute left-[24px] bottom-[24px] z-[6] p-[13px_18px] rounded-[12px] bg-[var(--nav-surface)] text-[var(--nav-text)] flex items-center gap-[10px] text-[12px] shadow-[var(--elev-3)] animate-[tfup_0.2s_ease]">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--nav-positive)] flex-none"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
