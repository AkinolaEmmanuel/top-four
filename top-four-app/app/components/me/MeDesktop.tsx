'use client';

import Link from 'next/link';

export function MeDesktop({
  theme, isLoading, prefs, setPrefs, chart, leagues, rootNav, accountRows,
  emailPrefs, pendingEmail, noGoogle, user, ...props
}: any) {
  const isReady = !isLoading;

  const hasCorrection = chart.some((c: any) => c.corrected);

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      

      {/* Account context bar */}
      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px]">
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Your account</span>
          <span className="text-[11px] text-[var(--text-muted)]">{props.user?.displayName || 'Your Name'} · verified</span>
        </div>
      </div>

      <div className="tf-scroll flex-1 overflow-y-auto">
        {isLoading && (
          <div>
            <div className="bg-[var(--nav-surface)] py-[26px] pb-[28px]">
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[34px]">
                <div className="w-[62px] h-[62px] rounded-full bg-[rgba(255,255,255,0.1)] animate-pulse"></div>
                <div>
                  <div className="w-[170px] h-[16px] rounded bg-[rgba(255,255,255,0.1)] animate-pulse"></div>
                  <div className="w-[120px] h-[11px] rounded bg-[rgba(255,255,255,0.07)] mt-[9px] animate-pulse"></div>
                </div>
                <div className="ml-[20px] pl-[34px] border-l border-[var(--nav-border)]">
                  <div className="w-[130px] h-[34px] rounded bg-[rgba(255,255,255,0.1)] animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="max-w-[1080px] mx-auto px-[24px] py-[26px] grid gap-[24px] items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
              <div>
                <div className="h-[14px] w-[130px] rounded bg-[var(--surface-subtle)] animate-pulse"></div>
                <div className="h-[150px] rounded-[10px] bg-[var(--surface-subtle)] mt-[20px] animate-pulse"></div>
              </div>
              <div>
                <div className="h-[14px] w-[80px] rounded bg-[var(--surface-subtle)] animate-pulse"></div>
                <div className="h-[52px] rounded-[8px] bg-[var(--surface-subtle)] mt-[18px] animate-pulse"></div>
                <div className="h-[52px] rounded-[8px] bg-[var(--surface-subtle)] mt-[10px] animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {isReady && (
          <div>
            {/* Hero banner */}
            <div className="bg-[var(--nav-surface)] text-[var(--nav-text)] py-[26px] pb-[28px]">
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[34px]">
                <div className="flex items-center gap-[16px] flex-none">
                  <div className="w-[66px] h-[66px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[24px]">
                    {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-heading font-[650] text-[26px] leading-[1] tracking-[-0.8px]">{user?.displayName || 'User'}</div>
                    <div className="font-['Sora',sans-serif] font-medium text-[13px] text-[var(--nav-text-faint)] mt-[9px]">Since August 2026</div>
                  </div>
                </div>
                <div className="flex-none pl-[34px] border-l border-[var(--nav-border)]">
                  <div className="flex items-end gap-[12px]">
                    <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]">2,272</span>
                    <span className="text-[12.5px] leading-[1.45] text-[var(--nav-text-faint)] pb-[5px]">points in total<br />across eight leagues · 61% correct</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column content */}
            <div className="max-w-[1080px] mx-auto px-[24px] py-[26px] pb-[30px] grid gap-[24px] items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
              
              {/* Left: chart + leagues */}
              <div>
                <div className="pb-[12px] border-b border-[var(--surface-border-strong)] flex items-baseline justify-between">
                  <div className="font-heading font-bold text-[14px]">Points by round</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Last 10</div>
                </div>
                <div className="flex items-end gap-[10px] h-[150px] mt-[20px]">
                  {chart.map((c: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-[8px] min-w-0">
                      <span className="text-[10px] text-[var(--text-muted)] font-heading font-semibold">{c.value}</span>
                      <div className={c.barStyle} style={{ height: `${c.barHeight}px`, width: '100%' }}></div>
                      <span className="text-[10px] text-[var(--text-muted)]">{c.label}</span>
                    </div>
                  ))}
                </div>
                {hasCorrection && (
                  <div className="text-[11.5px] leading-[1.55] text-[var(--text-muted)] mt-[14px] max-w-[74ch]">Round 7 is amber because a correction reversed a goalscorer award after it settled. Corrections are applied in place, so this always matches the tables.</div>
                )}

                <div className="mt-[30px] pb-[11px] border-b border-[var(--surface-border-strong)]">
                  <div className="font-heading font-bold text-[14px]">Where they came from</div>
                </div>
                {leagues.map((l: any, i: number) => (
                  <div key={i} className="flex items-center gap-[13px] py-[13px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors px-[2px]">
                    <span className="tf-crest w-[32px] h-[35px] text-[9px]" style={{ background: l.bg }}>{l.crest}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13.5px]">{l.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                    </div>
                    <span className="tf-num font-heading font-bold text-[17px]">{l.points}</span>
                  </div>
                ))}

                {/* Sign-in section */}
                <div className="mt-[30px]">
                  <div className="pb-[11px] border-b border-[var(--surface-border-strong)]">
                    <div className="font-heading font-bold text-[14px]">Sign-in and identity</div>
                    <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px]">How you get in, and what other members see</div>
                  </div>
                  {accountRows.map((r: any, i: number) => {
                    const content = (
                      <div className="flex items-center gap-[13px] py-[14px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors px-[2px]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[8px]">
                            <div className="font-heading font-semibold text-[13.5px]" style={{ color: r.titleColor }}>{r.title}</div>
                            {r.badge && <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] flex-none bg-[var(--warn-surface)] text-[var(--warn-text)]">{r.badge}</span>}
                          </div>
                          <div className="text-[11.5px] text-[var(--text-muted)] leading-[1.45] mt-[3px]">{r.note}</div>
                        </div>
                        <span className="text-[17px] text-[var(--text-muted)] flex-none">›</span>
                      </div>
                    );
                    return r.href ? (
                      <Link key={i} href={r.href} className="block">{content}</Link>
                    ) : (
                      <div key={i} className="block">{content}</div>
                    );
                  })}

                  {/* Sessions */}
                  <div className="mt-[30px] pb-[11px] border-b border-[var(--surface-border-strong)]">
                    <div className="font-heading font-bold text-[14px]">Sessions</div>
                  </div>
                  <div className="py-[15px] border-b border-[var(--surface-border)] flex items-center gap-[16px]">
                    <div className="flex-1 text-[12px] text-[var(--text-secondary)] leading-[1.5] max-w-[52ch]">Signing out here ends this device only. A password change is what ends the others.</div>
                    <button onClick={props.signOut} className="flex-none h-[40px] px-[20px] rounded-[11px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px] cursor-pointer">Sign out</button>
                  </div>
                </div>
              </div>

              {/* Right: email prefs + danger zone */}
              <div>
                <div className="pb-[11px] border-b border-[var(--surface-border-strong)]">
                  <div className="font-heading font-bold text-[14px]">Emails</div>
                  <div className="text-[11.5px] text-[var(--text-muted)] mt-[4px] leading-[1.5]">Two of these are yours to turn off. Security mail always sends.</div>
                </div>
                {emailPrefs.map((p: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (!p.locked && p.toggleId) setPrefs((s: any) => ({ ...s, [p.toggleId]: !s[p.toggleId] }));
                    }}
                    className="flex items-center gap-[13px] py-[14px] border-b border-[var(--surface-border)] cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13px]" style={{ color: p.color }}>{p.label}</div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-[1.45] mt-[3px]">{p.note}</div>
                    </div>
                    <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex ${!p.locked ? 'cursor-pointer' : 'opacity-55 cursor-default'} ${p.on ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                      <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-sm"></div>
                    </div>
                  </div>
                ))}

                {/* Delete account */}
                <div className="mt-[30px] pb-[11px] border-b border-[var(--surface-border-strong)]">
                  <div className="font-heading font-bold text-[14px] text-[var(--danger-text)]">Danger zone</div>
                </div>
                <div className="py-[14px] border-b border-[var(--surface-border)] flex items-center gap-[13px] shadow-[inset_3px_0_0_0_var(--color-danger)] opacity-70">
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[13.5px] text-[var(--danger-text)]">Delete account</div>
                    <div className="text-[11.5px] text-[var(--text-muted)] leading-[1.45] mt-[3px]">Leagues you own need a new owner first. Your predictions stay, without your name.</div>
                  </div>
                  <span className="text-[10px] font-heading font-bold tracking-[0.05em] text-[var(--text-muted)] flex-none">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
