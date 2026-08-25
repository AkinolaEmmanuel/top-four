'use client';

import Link from 'next/link';
import { MobileNav } from '../MobileNav';

export function HomeMobile({ state, theme, ...props }: any) {
  const isLoading = state === 'loading';
  const isNewUser = state === 'newuser';
  const isReady = !isLoading && !isNewUser;
  const urgent = state === 'urgent';
  const caught = state === 'caughtup';
  
  const owed = (isReady && !caught) ? "25" : "";

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[16px] flex-none flex items-center justify-between">
          <div className="font-heading font-bold text-[19px] leading-[1] tracking-[-0.7px]">TOPFOUR<span className="text-[var(--nav-accent)]">/</span></div>
          <div className="flex items-center gap-[9px]">
            {/* Alerts feature temporarily removed pending backend implementation */}
            <Link href="/me" className="w-[36px] h-[36px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[11.5px]">
              {props.user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto tf-scroll relative">
          {isLoading && (
            <div className="p-[30px_var(--gutter)] flex flex-col gap-[26px]">
              <div className="h-[140px] rounded-[15px] bg-[var(--surface-subtle)]"></div>
              <div className="flex gap-[16px]">
                <div className="w-[45px] h-[45px] rounded-full bg-[var(--surface-subtle)] flex-none"></div>
                <div className="flex-1 flex flex-col gap-[10px]">
                  <div className="w-2/3 h-[14px] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                  <div className="w-1/2 h-[12px] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                </div>
              </div>
            </div>
          )}

          {isNewUser && (
            <div className="p-[90px_var(--gutter)] flex flex-col items-center text-center">
              <div className="w-[54px] h-[54px] rounded-[15px] bg-[var(--color-brand)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[18px]">T/</div>
              <div className="font-heading font-bold text-[24px] leading-[1.12] tracking-[-0.7px] mt-[20px]">Join or create a<br />league to begin</div>
              <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">You need to join or create a league to start predicting. You can be in up to twenty at once.</div>
              <div className="flex flex-col w-full gap-[10px] mt-[24px]">
                <Link href="/leagues/setup" className="h-[48px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">Create a league</Link>
                <Link href="/leagues/join" className="h-[48px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">Join with a code</Link>
              </div>
            </div>
          )}

          {isReady && (
            <div className="animate-[tfin_0.16s_ease]">
              <div style={props.heroStyle}>
                <div className="flex items-center gap-[8px]">
                  <span style={props.heroDotStyle}></span>
                  <span className="tf-kicker" style={{ color: props.heroToneColor }}>{props.heroKicker}</span>
                </div>
                <div className="tf-num font-heading font-bold text-[64px] leading-[0.84] tracking-[-2.8px] mt-[10px]" style={{ color: props.heroClockColor }}>{props.heroClock}</div>
                <div className="text-[12px] text-[var(--nav-text-faint)] mt-[9px] leading-[1.45]">{props.heroClockSub}</div>

                <div className="mt-[20px] rounded-[14px] bg-[rgba(255,255,255,0.06)] p-[14px_16px]">
                  <div className="flex items-center gap-[12px]">
                    <span className="font-heading font-bold text-[8.5px] tracking-[0.11em] px-[8px] py-[3px] rounded-[5px] bg-[var(--nav-fill)] text-[var(--nav-text)]">{props.heroLeague}</span>
                    <span className="font-heading font-semibold text-[9.5px] text-[var(--nav-text-faint)]">{props.kickoff}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-[16px] items-center mt-[14px]">
                    <div className="flex items-center gap-[9px] justify-end min-w-0">
                      <span className="tf-crest" style={{ background: props.homeColor }}>{props.homeCode}</span>
                      <span className="font-heading font-[650] text-[18px] leading-[1.15] tracking-[-0.4px] truncate">{props.homeName}</span>
                    </div>
                    <span className="font-heading font-semibold text-[10px] text-[var(--nav-text-faint)]">v</span>
                    <div className="flex items-center gap-[9px] min-w-0">
                      <span className="font-heading font-[650] text-[18px] leading-[1.15] tracking-[-0.4px] truncate text-right">{props.awayName}</span>
                      <span className="tf-crest" style={{ background: props.awayColor }}>{props.awayCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px] mt-[16px]">
                    <div className="flex-1 h-[4.5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                      <div style={props.heroBarStyle}></div>
                    </div>
                    <span className="tf-num font-heading font-bold text-[10.5px] flex-none">{props.heroProgress}</span>
                  </div>
                </div>

                <div style={props.heroCtaStyle}>{props.heroCta}</div>
              </div>

              <div className="p-[20px_var(--gutter)] border-b border-[var(--surface-border)]">
                <div className="flex items-center justify-between gap-[10px]">
                  <span className="tf-kicker text-[rgba(255,255,255,0.62)]" style={{ color: 'var(--text-muted)' }}>YOUR WEEKEND</span>
                  <span className="font-heading font-bold text-[8.5px] tracking-[0.09em] px-[7px] py-[3px] rounded-[5px] bg-[var(--tf-green-800)] text-[var(--tf-white)]">{props.weekendBadge}</span>
                </div>
                <div className="flex items-end gap-[10px] mt-[10px]">
                  <div className="tf-num font-heading font-bold text-[36px] leading-[0.9] tracking-[-1.5px] text-[var(--tf-green-800)]">{props.weekendPoints}</div>
                  <div className="text-[10.5px] text-[var(--text-muted)] pb-[4px] leading-[1.4]">across every league<br />you play in</div>
                </div>
                <div className="flex flex-col gap-[9px] mt-[14px]">
                  {props.weekendRows.map((w: any, i: number) => (
                    <div key={i} className="flex items-center gap-[9px]">
                      <span style={w.markStyle}>{w.mark}</span>
                      <span className="flex-1 min-w-0 text-[11px] text-[var(--text-secondary)] truncate">{w.label}</span>
                      <span className="tf-num font-heading font-bold text-[11.5px] text-[var(--tf-green-800)] flex-none">{w.pts}</span>
                    </div>
                  ))}
                </div>
              </div>

              <section className="p-[24px_var(--gutter)]">
                <div className="flex items-baseline justify-between mb-[12px]">
                  <span className="tf-kicker">{props.queueKicker}</span>
                  <span className="font-heading font-bold text-[9px] tracking-[0.06em] text-[var(--text-link)] cursor-pointer">{props.queueLink}</span>
                </div>
                {props.queueClear ? (
                  <div className="text-[12px] leading-[1.6] text-[var(--text-secondary)]">Nothing else is waiting on you. Every other market in every league is answered.</div>
                ) : (
                  <div className="flex flex-col">
                    {props.queue.map((q: any, i: number) => (
                      <div key={i} style={q.rowStyle}>
                        <div className="flex flex-col gap-[2px]">
                          <span className="tf-crest w-[22px] h-[24px] text-[7.5px]" style={{ background: q.homeColor }}>{q.homeCode}</span>
                          <span className="tf-crest w-[22px] h-[24px] text-[7.5px]" style={{ background: q.awayColor }}>{q.awayCode}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-semibold text-[12.5px] truncate">{q.match}</div>
                          <div className="text-[9.5px] text-[var(--text-muted)] mt-[3px] truncate">{q.competition}</div>
                        </div>
                        <div className="text-right flex-none">
                          <div className="tf-num font-heading font-bold text-[12px] text-[var(--text-primary)]">{q.time}</div>
                          <div className="tf-num text-[10px] text-[var(--text-link)] mt-[3px] font-bold">{q.missing}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="h-[6px] bg-[var(--surface-subtle)] border-y border-[var(--surface-border)]"></div>

              <section className="p-[24px_0_0]">
                <div className="flex items-baseline justify-between px-[var(--gutter)] mb-[10px]">
                  <span className="tf-kicker">Where you stand</span>
                  <span className="font-heading font-bold text-[9px] tracking-[0.06em] text-[var(--text-link)] cursor-pointer">SEE ALL {props.leagueCount} →</span>
                </div>
                {props.leagues.map((l: any, i: number) => (
                  <Link href={`/leagues/${i + 1}`} key={i} style={l.rowStyle} className="px-[var(--gutter)]">
                    <span className="tf-crest w-[22px] h-[24px] text-[7.5px]" style={{ background: l.crestBg }}>{l.crest}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[11.5px] truncate">{l.name}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                    </div>
                    <div className="text-right flex-none">
                      <div className="font-heading font-bold text-[15px] font-tabular-nums">{l.position}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-[3px] font-tabular-nums">{l.points}</div>
                    </div>
                  </Link>
                ))}
              </section>

              <div className="h-[26px]"></div>
            </div>
          )}
        </main>
        
        <MobileNav />
    </div>
  );
}
