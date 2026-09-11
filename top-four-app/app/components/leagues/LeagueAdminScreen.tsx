'use client';

import Link from 'next/link';

// Merged from LeagueAdminMobile/LeagueAdminDesktop. Desktop's own top nav
// (rootNav/avatarInitials/avatarName) was dead -- DesktopLevelOne in the
// root layout is the real one, this never rendered.
//
// Merging surfaced two real hardcoded-text bugs in the Requests tab: Mobile
// showed a literal "2 PENDING · 1 ALREADY IN" regardless of how many
// requests actually existed, next to an "APPROVE ALL" button with no
// handler at all -- clicking it did nothing. Desktop's equivalent showed a
// literal "Oldest asked yesterday" regardless of when anything was actually
// asked. Both now use real values computed in page.tsx (requestsSummary,
// oldestRequestLabel), and "Approve all" now actually approves every
// pending request (with a confirmation, since it's a bulk action).
export function LeagueAdminScreen({
  theme, params, tab, setTab, setSheet, setWho, setRole,
  headSub, HERO, loading, onMembers, onInvites, onRequests, onLifecycle,
  members, memberFilters, invites, requests, lifecycle, actions,
  hasMoreMembers, fresh, setFresh, empty, invitesOpen, setInvitesOpen,
  sheetSpec, roles, toast, leagueName, leagueAbbr,
  memberCount, inviteCount, pendingCount, heroRole,
  inviteCode, createInviteAction, copyInviteAction, exportMembersAction,
  requestsSummary, oldestRequestLabel, approveAllAction, hasPendingRequests,
  contextTabs, heroStyle, heroBig, heroTone, heroLabel, heroSub,
}: any) {
  const segStyleMobile = (on: boolean) =>
    `box-border flex-1 min-w-[88px] flex items-center justify-center gap-[6px] h-[38px] rounded-t-[9px] cursor-pointer font-heading font-bold text-[11px] ${on ? 'bg-[var(--surface-canvas)] text-[var(--text-primary)] border border-b-0 border-[var(--surface-border-strong)] pb-[1px]' : 'text-[var(--nav-text-faint)]'}`;

  const tabDefsMobile = [
    { id: "members", label: "Members", count: String(memberCount ?? '') },
    { id: "invites", label: "Invites", count: String(inviteCount ?? '') },
    { id: "requests", label: "Requests", count: String(pendingCount ?? '') },
    { id: "lifecycle", label: "Lifecycle", count: "" }
  ].map(t => {
    const on = tab === t.id;
    return {
      label: t.label, count: t.count, style: segStyleMobile(on),
      countStyle: `font-[tabular-nums] font-semibold ${t.count ? (t.id === "requests" && !on ? "text-[var(--danger-text)]" : "opacity-[0.55]") : "hidden"}`,
      pick: () => { setTab(t.id); setSheet(null); }
    };
  });

  const segStyleDesktop = (on: boolean) =>
    `flex items-center gap-[7px] h-[38px] px-[16px] rounded-[8px] cursor-pointer font-heading font-bold text-[12px] ${on ? 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border-strong)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`;

  const tabDefsDesktop = [
    { id: "members", label: "Members", count: String(memberCount ?? '') },
    { id: "invites", label: "Invites", count: String(inviteCount ?? '') },
    { id: "requests", label: "Requests", count: String(pendingCount ?? '') },
    { id: "lifecycle", label: "Lifecycle", count: "" }
  ].map(t => {
    const on = tab === t.id;
    return {
      label: t.label, count: t.count, style: segStyleDesktop(on),
      countStyle: `font-heading text-[11px] ml-[3px] ${t.count ? (t.id === "requests" && !on ? "text-[var(--danger-text)]" : "text-[var(--text-muted)]") : "hidden"}`,
      pick: () => { setTab(t.id); setSheet(null); }
    };
  });

  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_0]">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${params.id}/more`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
            </div>
          </div>

          <div className="flex items-end gap-[11px] mt-[16px]">
            <div className="tf-num font-heading font-bold text-[40px] leading-[0.88] tracking-[-1.8px]" style={{ color: HERO[3] }}>{HERO[0]}</div>
            <div className="pb-[5px] min-w-0">
              <div className="text-[11.5px] leading-[1.35]">{HERO[1]}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[3px]">{HERO[2]}</div>
            </div>
          </div>

          <div className="tf-scroll flex gap-[2px] mt-[16px] overflow-x-auto shadow-[inset_0_-1px_0_0_var(--surface-border-strong)]">
            {tabDefsMobile.map((t, i) => (
              <div key={i} onClick={t.pick} className={t.style}>{t.label}<span className={t.countStyle}>{t.count}</span></div>
            ))}
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">

          {loading && (
            <div>
              {[0, 1, 2, 3, 4, 5].map(i => (
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
              {hasMoreMembers && (
                <div className="tf-tap p-[15px] text-center font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] border-b border-[var(--surface-border)]">LOAD 25 MORE</div>
              )}
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
                  <div className="font-heading font-bold text-[30px] leading-[1] tracking-[2px] mt-[13px]">{inviteCode || '—'}</div>
                  <div className="flex items-center gap-[10px] mt-[14px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.1)]">
                    <span className="flex-1 text-[11.5px] opacity-85 whitespace-nowrap overflow-hidden text-ellipsis">{inviteCode ? `topfour.app/j/${inviteCode}` : 'Link unavailable'}</span>
                    <span onClick={copyInviteAction} className="tf-tap font-heading font-bold text-[10.5px] flex-none">COPY</span>
                  </div>
                  <div className="text-[11.5px] leading-[1.55] opacity-75 mt-[12px]">TopFour will not show this again. Every list after this carries the label and its status — never the code — so revoking is the only remedy if it gets out.</div>
                </section>
              )}
              <section className="p-[18px_var(--gutter)_0]">
                <div onClick={createInviteAction} className="tf-tap h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)]">Create an invitation</div>
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
                        <div className={iv.actionStyle} onClick={iv.revoke}>{iv.action}</div>
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
                    <span className="tf-kicker text-[var(--text-muted)]">{requestsSummary}</span>
                    {hasPendingRequests && (
                      <span onClick={approveAllAction} className="tf-tap font-heading font-bold text-[10.5px] text-[var(--text-link)]">APPROVE ALL</span>
                    )}
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
              {sheetSpec.tertiary && (
                <div onClick={() => {
                  if (sheetSpec.tertiaryAction) {
                    sheetSpec.tertiaryAction();
                  } else {
                    setSheet(null);
                  }
                }} className="tf-tap h-[46px] rounded-[12px] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-secondary)] mt-[8px]">{sheetSpec.tertiary}</div>
              )}
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

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">
              {leagueAbbr || (leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG')}
            </span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
            <span className="text-[11px] text-[var(--text-muted)]">{heroRole === 'OWNER' ? 'You own this league' : 'You help run this league'}</span>
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const leagueId = params?.id || '';
              const route = t.label === 'Overview' ? `/leagues/${leagueId}` : `/leagues/${leagueId}/${t.label.toLowerCase()}`;
              return <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>;
            })}
          </div>
        </div>

        <div className="tf-scroll flex-1 overflow-y-auto">
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
            <div className="flex items-center gap-[6px] pt-[18px]">
              {tabDefsDesktop.map((t, i) => (
                <div key={i} onClick={t.pick} className={t.style}>
                  {t.label}<span className={t.countStyle}>{t.count}</span>
                </div>
              ))}
            </div>

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

            {onMembers && (
              <div className="animate-[tfin_0.16s_ease]">
                <div className="flex items-center gap-[9px] mt-[22px]">
                  {memberFilters.map((f: any, i: number) => (
                    <div key={i} onClick={f.pick} className={f.style}>{f.label}</div>
                  ))}
                  <div className="flex-1"></div>
                  <button onClick={exportMembersAction} className="h-[36px] px-[14px] rounded-[9px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] font-heading font-bold text-[11.5px] cursor-pointer">Export members</button>
                  <button onClick={() => setTab('invites')} className="h-[36px] px-[14px] rounded-[9px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[11.5px] cursor-pointer">Invite people</button>
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

            {onInvites && (
              <div className="animate-[tfin_0.16s_ease]">
                <div className="flex items-end justify-between mt-[22px]">
                  <div>
                    <div className="font-heading font-bold text-[19px] tracking-[-0.3px]">Invitation links</div>
                    <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">Anyone with a live link can request to join. Approval is still yours.</div>
                  </div>
                  <button onClick={createInviteAction} className="h-[42px] px-[16px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px] cursor-pointer">New invite link</button>
                </div>

                {fresh && (
                  <div className="mt-[16px] p-[18px_20px] rounded-[12px] bg-[var(--tf-navy-800)] text-[var(--tf-white)]">
                    <div className="flex items-center justify-between">
                      <span className="tf-kicker opacity-70">SHOWN ONCE — COPY IT NOW</span>
                      <span onClick={() => setFresh(false)} className="cursor-pointer font-heading font-bold text-[10px] tracking-[0.06em] opacity-70">DONE</span>
                    </div>
                    <div className="font-heading font-bold text-[30px] leading-[1] tracking-[2px] mt-[13px]">{inviteCode || '—'}</div>
                    <div className="flex items-center gap-[10px] mt-[14px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.1)]">
                      <span className="flex-1 text-[11.5px] opacity-85">{inviteCode ? `topfour.app/j/${inviteCode}` : 'Link unavailable'}</span>
                      <span onClick={copyInviteAction} className="cursor-pointer font-heading font-bold text-[10.5px] flex-none">COPY</span>
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
                      {iv.active && <span onClick={iv.revoke} className="font-heading font-semibold text-[11px] text-[var(--danger-text)] cursor-pointer">Revoke</span>}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-[1.55] mt-[12px]">Revoking a link stops new requests. It never removes people who already joined through it.</div>
              </div>
            )}

            {onRequests && (
              <div className="animate-[tfin_0.16s_ease]">
                <div className="flex items-end justify-between mt-[22px]">
                  <div>
                    <div className="font-heading font-bold text-[19px] tracking-[-0.3px]">Join requests</div>
                    <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">Any owner or admin can act — whoever gets there first.</div>
                  </div>
                  <div className="flex items-center gap-[14px]">
                    <div className="text-[11.5px] text-[var(--text-muted)]">{oldestRequestLabel}</div>
                    {hasPendingRequests && (
                      <button onClick={approveAllAction} className="h-[36px] px-[14px] rounded-[9px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[11.5px] cursor-pointer">Approve all</button>
                    )}
                  </div>
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

        {sheetSpec && (
          <div onClick={() => setSheet(null)} className="fixed inset-0 z-[10] bg-[var(--control-scrim)] flex items-center justify-center p-[24px]">
            <div onClick={(e: any) => e.stopPropagation()} className="w-full max-w-[440px] bg-[var(--surface-card)] rounded-[16px] p-[22px_24px] flex flex-col animate-[tfin_0.16s_ease] shadow-[var(--elev-4)]">
              <div className="font-heading font-bold text-[18px] leading-[1.2] tracking-[-0.4px]">{sheetSpec.title}</div>
              <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">{sheetSpec.body}</div>
              {sheetSpec.roles && (
                <div className="flex flex-col gap-[7px] mt-[14px]">
                  {roles.map((r: any, i: number) => (
                    <div key={i} onClick={r.pick} className={r.rowStyle}>
                      <div className={r.radioStyle}><div className={r.dotStyle}></div></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13px]">{r.label}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-[2px] leading-[1.4]">{r.note}</div>
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
              <div className="flex gap-[8px] mt-[18px]">
                <div onClick={() => setSheet(null)} className="flex-1 h-[44px] rounded-[11px] border border-[var(--surface-border-strong)] grid place-items-center cursor-pointer font-heading font-bold text-[12.5px]">Cancel</div>
                <div onClick={() => {
                  if (sheetSpec.primaryAction) sheetSpec.primaryAction();
                  else setSheet(null);
                }} className={`flex-1 h-[44px] rounded-[11px] grid place-items-center cursor-pointer font-heading font-bold text-[12.5px] text-white ${sheetSpec.danger ? 'bg-[var(--color-danger)]' : 'bg-[var(--brand-fill)]'}`}>
                  {sheetSpec.primary}
                </div>
              </div>
              {sheetSpec.tertiary && (
                <div onClick={() => {
                  if (sheetSpec.tertiaryAction) sheetSpec.tertiaryAction();
                  else setSheet(null);
                }} className="h-[42px] rounded-[11px] grid place-items-center cursor-pointer font-heading font-bold text-[12px] text-[var(--text-secondary)] mt-[8px]">{sheetSpec.tertiary}</div>
              )}
              {sheetSpec.secondary && (
                <div onClick={() => {
                  if (sheetSpec.secondaryAction) sheetSpec.secondaryAction();
                  else setSheet(null);
                }} className="h-[42px] rounded-[11px] grid place-items-center cursor-pointer font-heading font-bold text-[12px] text-[var(--danger-text)] mt-[8px]">{sheetSpec.secondary}</div>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="absolute left-[24px] bottom-[24px] z-[6] p-[13px_18px] rounded-[12px] bg-[var(--nav-surface)] text-[var(--nav-text)] flex items-center gap-[10px] text-[12px] shadow-[var(--elev-3)] animate-[tfup_0.2s_ease]">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--nav-positive)] flex-none"></span>
            <span>{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
