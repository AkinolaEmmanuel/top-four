'use client';

import Link from 'next/link';

export function HomeDesktop({ state, theme, ...props }: any) {
  const isLoading = state === 'loading';
  const isNewUser = state === 'newuser';
  const isReady = !isLoading && !isNewUser;
  const urgent = state === 'urgent';
  const caught = state === 'caughtup';

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Level Two Context Bar (Root scope) */}
      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-baseline gap-[10px] pb-[13px]">
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Today</span>
          <span className="text-[11px] text-[var(--text-muted)]">{props.headSub}</span>
        </div>
        <div className="ml-auto pb-[13px]">
          <span className="tf-num text-[11px] text-[var(--text-muted)]">{props.headRight}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto tf-scroll relative">
        {isLoading && (
          <div>
            <div className="bg-[var(--nav-surface)] py-[30px] border-b border-[rgba(255,255,255,0.1)]">
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[40px]">
                <div className="flex-none flex flex-col gap-[13px]">
                  <div className="w-[104px] h-[11px] rounded-full bg-[rgba(255,255,255,0.13)]"></div>
                  <div className="w-[250px] h-[60px] rounded-[12px] bg-[rgba(255,255,255,0.13)]"></div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[12px]">
                  <div className="w-[44%] h-[12px] rounded-full bg-[rgba(255,255,255,0.1)]"></div>
                  <div className="w-[78%] h-[20px] rounded-full bg-[rgba(255,255,255,0.12)]"></div>
                  <div className="w-full h-[6px] rounded-full bg-[rgba(255,255,255,0.09)]"></div>
                </div>
              </div>
            </div>
            <div className="max-w-[1080px] mx-auto p-[26px_24px_30px] flex gap-[26px]">
              <div className="flex-1">
                <div className="tf-skeleton w-[150px] h-[14px] rounded-full"></div>
                <div className="tf-skeleton h-[64px] rounded-[14px] mt-[14px]"></div>
                <div className="tf-skeleton h-[64px] rounded-[14px] mt-[16px]"></div>
                <div className="tf-skeleton h-[64px] rounded-[14px] mt-[10px]"></div>
              </div>
              <div className="w-[330px] flex-none">
                <div className="tf-skeleton h-[190px] rounded-[14px]"></div>
                <div className="tf-skeleton h-[150px] rounded-[14px] mt-[16px]"></div>
              </div>
            </div>
          </div>
        )}

        {isNewUser && (
          <div className="max-w-[1080px] mx-auto p-[150px_30px] flex flex-col items-center text-center">
            <Link href="/me" className="flex items-center gap-[8px] p-[4px_11px_4px_4px] rounded-full bg-[var(--nav-fill)] flex-none cursor-pointer">
              <div className="w-[26px] h-[26px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[10px]">
                {props.user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="font-heading font-semibold text-[11.5px]">{props.user?.displayName || 'User'}</span>
              <span className="text-[9px] text-[var(--nav-text-faint)]">▾</span>
            </Link>
            <div className="font-heading font-bold text-[30px] leading-[1.12] tracking-[-0.9px] mt-[24px]">Join or create a league to begin</div>
            <div className="text-[14px] leading-[1.6] text-[var(--text-secondary)] mt-[12px] max-w-[440px]">
              You need to join or create a league to start predicting. You can be in up to twenty at once — finished leagues give their place back.
            </div>
            <div className="flex gap-[10px] mt-[26px]">
              <Link href="/leagues/setup" className="h-[48px] px-[26px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">Create a league</Link>
              <Link href="/leagues/join" className="h-[48px] px-[26px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">Join with a code</Link>
            </div>
          </div>
        )}

        {isReady && (
          <div className="animate-[tfin_0.16s_ease]">
            {/* HERO PANEL */}
            <div style={props.heroStyle}>
              <div className="relative max-w-[1080px] mx-auto px-[24px]">
                <div className="absolute left-0 right-0 top-[54%] h-[1px] bg-[rgba(255,255,255,0.07)]"></div>
                <div className="absolute left-[50%] top-[54%] w-[190px] h-[190px] mt-[-95px] ml-[-95px] border border-[rgba(255,255,255,0.07)] rounded-full"></div>
                <div className="relative flex items-center gap-[44px]">
                  
                  <div className="flex-none">
                    <div className="flex items-center gap-[8px]">
                      <span style={props.heroDotStyle}></span>
                      <span className="tf-kicker" style={{ color: props.heroToneColor }}>{props.heroKicker}</span>
                    </div>
                    <div className="tf-num font-heading font-bold text-[76px] leading-[0.84] tracking-[-3.4px] mt-[12px]" style={{ color: props.heroClockColor }}>{props.heroClock}</div>
                    <div className="text-[13px] text-[var(--nav-text-faint)] mt-[11px] leading-[1.45]">{props.heroClockSub}</div>
                  </div>

                  <div className="flex-none w-[500px]">
                    <div className="flex items-center gap-[12px]">
                      <span className="font-heading font-bold text-[9.5px] tracking-[0.11em] px-[8px] py-[4px] rounded-[6px] bg-[var(--nav-fill)] text-[var(--nav-text)]">{props.heroLeague}</span>
                      <span className="font-heading font-semibold text-[10px] text-[var(--nav-text-faint)]">{props.kickoff}</span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-[22px] items-center mt-[16px]">
                      <div className="flex items-center gap-[11px] justify-end min-w-0">
                        <span className="tf-crest" style={{ background: props.homeColor, width: '34px', height: '36px' }}>{props.homeCode}</span>
                        <span className="font-heading font-[650] text-[21px] leading-[1.15] tracking-[-0.5px] whitespace-nowrap overflow-hidden text-ellipsis">{props.homeName}</span>
                      </div>
                      <span className="font-heading font-semibold text-[11px] text-[var(--nav-text-faint)]">v</span>
                      <div className="flex items-center gap-[11px] min-w-0">
                        <span className="font-heading font-[650] text-[21px] leading-[1.15] tracking-[-0.5px] whitespace-nowrap overflow-hidden text-ellipsis text-right">{props.awayName}</span>
                        <span className="tf-crest" style={{ background: props.awayColor, width: '34px', height: '36px' }}>{props.awayCode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-[14px] mt-[20px]">
                      <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                        <div style={props.heroBarStyle}></div>
                      </div>
                      <span className="tf-num font-heading font-bold text-[11.5px] flex-none">{props.heroProgress}</span>
                    </div>
                  </div>

                  <div style={props.heroCtaStyle}>{props.heroCta}</div>

                </div>
              </div>
            </div>

            <div className="max-w-[1080px] mx-auto p-[26px_24px_30px] flex gap-[26px] items-start">
              <div className="flex-1 min-w-0">
                {/* THE QUEUE */}
                <div className="flex items-baseline justify-between">
                  <span className="tf-kicker">{props.queueKicker}</span>
                  <span className="font-heading font-bold text-[10px] tracking-[0.06em] text-[var(--text-link)] cursor-pointer">{props.queueLink}</span>
                </div>

                {props.queueClear ? (
                  <div className="mt-[12px] p-[18px_4px] border-t border-[var(--surface-border)] text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                    Nothing else is waiting on you. Every other market in every league is answered.
                  </div>
                ) : (
                  <div className="mt-[12px]">
                    <div className="grid grid-cols-[44px_minmax(0,1fr)_150px_96px_92px] gap-[14px] items-center p-[10px_4px] border-b border-[var(--surface-border-strong)]">
                      <span></span>
                      <span className="tf-kicker">Match</span>
                      <span className="tf-kicker">League</span>
                      <span className="tf-kicker text-right">Still open</span>
                      <span className="tf-kicker text-right">Locks</span>
                    </div>
                    {props.queue.map((q: any, i: number) => (
                      <div key={i} style={q.rowStyle} className="grid grid-cols-[44px_minmax(0,1fr)_150px_96px_92px] gap-[14px] items-center p-[13px_18px] cursor-pointer border-b border-[var(--surface-border)] last:border-0 hover:bg-[var(--surface-subtle)] transition-colors">
                        <div className="flex flex-col gap-[2px]">
                          <span className="tf-crest" style={{ background: q.homeColor, width: '26px', height: '28px', fontSize: '8.5px' }}>{q.homeCode}</span>
                          <span className="tf-crest" style={{ background: q.awayColor, width: '26px', height: '28px', fontSize: '8.5px' }}>{q.awayCode}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-heading font-semibold text-[13.5px] tracking-[-0.2px] truncate">{q.match}</div>
                          <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{q.competition}</div>
                        </div>
                        <div className="text-[11.5px] text-[var(--text-secondary)] truncate">{q.meta}</div>
                        <div className="tf-num text-right font-heading font-bold text-[12px] text-[var(--text-link)]">{q.missing}</div>
                        <div className="tf-num text-right font-heading font-bold text-[13px]">{q.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-[330px] flex-none">
                {/* THE PAYOFF */}
                <div style={props.weekendStyle}>
                  <div className="flex items-center justify-between gap-[10px]">
                    <span className="tf-kicker text-[rgba(255,255,255,0.62)]">YOUR WEEKEND</span>
                    <span className="font-heading font-bold text-[9.5px] tracking-[0.09em] px-[8px] py-[4px] rounded-[6px] bg-[var(--tf-white)] text-[var(--tf-green-800)]">{props.weekendBadge}</span>
                  </div>
                  <div className="flex items-end gap-[11px] mt-[13px]">
                    <div className="tf-num font-heading font-bold text-[42px] leading-[0.9] tracking-[-1.8px] text-[var(--tf-white)]">{props.weekendPoints}</div>
                    <div className="text-[11.5px] text-[rgba(255,255,255,0.66)] pb-[5px] leading-[1.4]">across every league<br />you play in</div>
                  </div>
                  <div className="flex flex-col gap-[10px] mt-[16px]">
                    {props.weekendRows.map((w: any, i: number) => (
                      <div key={i} className="flex items-center gap-[10px]">
                        <span style={w.markStyle}>{w.mark}</span>
                        <span className="flex-1 min-w-0 text-[12px] text-[rgba(255,255,255,0.85)] truncate">{w.label}</span>
                        <span className="tf-num font-heading font-bold text-[12.5px] text-[var(--tf-white)] flex-none">{w.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-[24px]">
                  <span className="tf-kicker">Where you stand</span>
                  <span className="font-heading font-bold text-[10px] tracking-[0.06em] text-[var(--text-link)] cursor-pointer">SEE ALL {props.leagueCount} →</span>
                </div>
                <div className="mt-[12px] border-t border-[var(--surface-border-strong)]">
                  {props.leagues.map((l: any, i: number) => (
                    <Link href={`/leagues/${i + 1}`} key={i} className="flex items-center gap-[11px] p-[12px_4px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors">
                      <span className="tf-crest" style={{ background: l.crestBg, width: '26px', height: '28px', fontSize: '8px' }}>{l.crest}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[12.5px] truncate">{l.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                      </div>
                      <div className="text-right flex-none">
                        <div className="tf-num font-heading font-bold text-[13.5px]">{l.position}</div>
                        <div className="tf-num text-[9.5px] text-[var(--text-muted)] mt-[2px]">{l.points}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
