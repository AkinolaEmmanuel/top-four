'use client';

import Link from 'next/link';
import { MobileNav } from '../MobileNav';

// Merged from MeMobile/MeDesktop. Two real bugs found:
//
// 1. Mobile had its own inline copy of the global bottom tab bar instead of
//    the shared MobileNav component every other merged screen uses, and its
//    Home tab linked to `/` instead of `/home` -- same bug already found and
//    fixed on the Leagues list page. Now the same MobileNav everywhere.
// 2. Desktop's account context bar hardcoded "· verified" next to the
//    user's name, regardless of the real emailUnverified state -- while the
//    detailed "Email address" row further down the same page (accountRows)
//    already showed the correct state. The two could contradict each other.
export function MeScreen({
  theme, isLoading, prefs, setPrefs, chartMobile, chartDesktop, leagues,
  totalPoints, leagueCount, groups, accountRows, emailPrefs, emailUnverified,
  user, signOut,
}: any) {
  const isReady = !isLoading;
  const hasCorrectionDesktop = chartDesktop.some((c: any) => c.corrected);

  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] flex-none">
          <div className="flex items-center gap-[13px]">
            <div className="w-[46px] h-[46px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[15px] flex-none">
              {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[18px] leading-[1.1] tracking-[-0.3px]">{user?.displayName || 'User'}</div>
              <div className="text-[11px] text-[var(--nav-text-faint)] mt-[4px] whitespace-nowrap overflow-hidden text-ellipsis">{user?.email || 'user@example.com'}</div>
            </div>
          </div>

          <div className="flex items-end gap-[12px] mt-[20px]">
            <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px]">{totalPoints.toLocaleString()}</div>
            <div className="pb-[4px]">
              <div className="font-heading font-semibold text-[12.5px]">points in total</div>
              <div className="text-[11px] text-[var(--nav-text-faint)] mt-[3px]">across {leagueCount} {leagueCount === 1 ? 'league' : 'leagues'}</div>
            </div>
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
          {isLoading && (
            <div className="p-[16px_var(--gutter)]">
              <div className="h-[130px] rounded-[14px] bg-[var(--surface-subtle)]"></div>
              {[{w: "58%"}, {w: "70%"}, {w: "46%"}, {w: "64%"}].map((s, i) => (
                <div key={i} className="flex items-center gap-[12px] py-[15px] border-b border-[var(--surface-border)]">
                  <div className="w-[32px] h-[32px] rounded-[9px] bg-[var(--surface-subtle)]"></div>
                  <div className="flex-1"><div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div></div>
                </div>
              ))}
            </div>
          )}

          {isReady && (
            <div>
              <section className="p-[18px_var(--gutter)_0]">
                <div className="flex items-baseline justify-between">
                  <span className="tf-kicker text-[var(--text-muted)]">POINTS BY ROUND</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Last 10</span>
                </div>
                <div className="flex items-end gap-[5px] h-[96px] mt-[14px]">
                  {chartMobile.map((c: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-[6px] min-w-0">
                      <div className={c.barStyle} style={{ height: `${c.height}px` }}></div>
                      <span className="text-[9px] text-[var(--text-muted)]">{c.label}</span>
                    </div>
                  ))}
                </div>
                {chartMobile.some((c: any) => c.corrected) && (
                  <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[10px]">A round shown in amber had a correction reverse an award after it settled. Corrections are applied in place, so this always matches the tables.</div>
                )}
              </section>

              <section className="mt-[20px]">
                <div className="p-[0_var(--gutter)_9px]"><span className="tf-kicker text-[var(--text-muted)]">WHERE THEY CAME FROM</span></div>
                {leagues.map((l: any, i: number) => (
                  <div key={i} className={`tf-tap flex items-center gap-[12px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] ${l.isLast ? 'border-b' : ''}`}>
                    <span className="tf-crest w-[28px] h-[31px]" style={{ background: l.bg }}>{l.crest}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{l.name}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                    </div>
                    <span className="tf-num font-heading font-bold text-[14px] flex-none">{l.points}</span>
                  </div>
                ))}
              </section>

              {groups.map((g: any, i: number) => (
                <section key={i} className="mt-[20px]">
                  <div className="p-[0_var(--gutter)_9px]"><span className="tf-kicker" style={{ color: g.labelColor }}>{g.label}</span></div>
                  {g.rows.map((r: any, j: number) => {
                    const content = (
                      <div className={`p-[14px_var(--gutter)] flex items-center justify-between ${r.isLast ? '' : 'border-b border-[var(--surface-border)]'} ${r.action || r.href ? 'cursor-pointer tf-tap' : ''}`}>
                      <div className="flex-1 pr-[12px]">
                        <div className="flex items-center gap-[8px]">
                          <span className="font-heading font-semibold text-[13px]" style={{ color: r.titleColor }}>{r.title}</span>
                          {r.badge && (
                            <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] flex-none bg-[var(--warn-surface)] text-[var(--warn-text)]">{r.badge}</span>
                          )}
                        </div>
                        <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{r.note}</div>
                      </div>
                      {r.hasSwitch ? (
                        <div
                          onClick={() => {
                            if (!r.locked && r.toggleId) {
                              setPrefs((s: any) => ({ ...s, [r.toggleId]: !s[r.toggleId] }));
                            }
                          }}
                          className={`w-[38px] h-[23px] rounded-full flex-none p-[2px] flex ${!r.locked ? 'cursor-pointer' : 'opacity-55 cursor-default'} transition-colors ${r.on ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}
                        >
                          <div className="w-[19px] h-[19px] rounded-full bg-[var(--surface-card)]"></div>
                        </div>
                      ) : (
                        <span className="font-['DM_Sans',sans-serif] text-[17px] text-[var(--text-muted)] flex-none">›</span>
                      )}
                    </div>
                    );
                    return r.href ? (
                      <Link key={j} href={r.href} className="block">{content}</Link>
                    ) : (
                      <div key={j} onClick={r.action} className={r.action ? 'cursor-pointer' : ''}>{content}</div>
                    );
                  })}
                </section>
              ))}

              <div className="p-[18px_var(--gutter)_26px] text-[11px] leading-[1.55] text-[var(--text-muted)]">Points here are the sum of every league you play in. A league that is cancelled removes its points from this total, because nothing in it counted.</div>
            </div>
          )}
        </main>

        <MobileNav />
      </div>

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Your account</span>
            <span className="text-[11px] text-[var(--text-muted)]">{user?.displayName || 'Your Name'} · {emailUnverified ? 'unverified' : 'verified'}</span>
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
              <div className="bg-[var(--nav-surface)] text-[var(--nav-text)] py-[26px] pb-[28px]">
                <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[34px]">
                  <div className="flex items-center gap-[16px] flex-none">
                    <div className="w-[66px] h-[66px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[24px]">
                      {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-heading font-[650] text-[26px] leading-[1] tracking-[-0.8px]">{user?.displayName || 'User'}</div>
                      <div className="font-['Sora',sans-serif] font-medium text-[13px] text-[var(--nav-text-faint)] mt-[9px]">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="flex-none pl-[34px] border-l border-[var(--nav-border)]">
                    <div className="flex items-end gap-[12px]">
                      <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]">{totalPoints.toLocaleString()}</span>
                      <span className="text-[12.5px] leading-[1.45] text-[var(--nav-text-faint)] pb-[5px]">points in total<br />across {leagueCount} {leagueCount === 1 ? 'league' : 'leagues'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-[1080px] mx-auto px-[24px] py-[26px] pb-[30px] grid gap-[24px] items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>

                <div>
                  <div className="pb-[12px] border-b border-[var(--surface-border-strong)] flex items-baseline justify-between">
                    <div className="font-heading font-bold text-[14px]">Points by round</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Last 10</div>
                  </div>
                  <div className="flex items-end gap-[10px] h-[150px] mt-[20px]">
                    {chartDesktop.map((c: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-[8px] min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] font-heading font-semibold">{c.value}</span>
                        <div className={c.barStyle} style={{ height: `${c.barHeight}px`, width: '100%' }}></div>
                        <span className="text-[10px] text-[var(--text-muted)]">{c.label}</span>
                      </div>
                    ))}
                  </div>
                  {hasCorrectionDesktop && (
                    <div className="text-[11.5px] leading-[1.55] text-[var(--text-muted)] mt-[14px] max-w-[74ch]">Round 7 is amber because a correction reversed a goalscorer award after it settled. Corrections are applied in place, so this always matches the tables.</div>
                  )}

                  <div className="mt-[30px] pb-[11px] border-b border-[var(--surface-border-strong)]">
                    <div className="font-heading font-bold text-[14px]">Where they came from</div>
                  </div>
                  {leagues.map((l: any, i: number) => (
                    <Link href={`/leagues/${l.id}`} key={i} className="flex items-center gap-[13px] py-[13px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors px-[2px]">
                      <span className="tf-crest w-[32px] h-[35px] text-[9px]" style={{ background: l.bg }}>{l.crest}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13.5px]">{l.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                      </div>
                      <span className="tf-num font-heading font-bold text-[17px]">{l.points}</span>
                    </Link>
                  ))}

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

                    <div className="mt-[30px] pb-[11px] border-b border-[var(--surface-border-strong)]">
                      <div className="font-heading font-bold text-[14px]">Sessions</div>
                    </div>
                    <div className="py-[15px] border-b border-[var(--surface-border)] flex items-center gap-[16px]">
                      <div className="flex-1 text-[12px] text-[var(--text-secondary)] leading-[1.5] max-w-[52ch]">Signing out here ends this device only. A password change is what ends the others.</div>
                      <button onClick={signOut} className="flex-none h-[40px] px-[20px] rounded-[11px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px] cursor-pointer">Sign out</button>
                    </div>
                  </div>
                </div>

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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
