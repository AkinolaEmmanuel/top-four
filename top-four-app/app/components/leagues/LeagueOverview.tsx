'use client';

import Link from 'next/link';

// Mobile and Desktop used to be two separate components, each reading its
// own half of a props object built in page.tsx. That split is exactly what
// let League Overview's rivalry data, hero fixture identity, and questions
// summary each go real on one side and stay hardcoded on the other more than
// once during this codebase's history -- two files meant two chances to
// forget one of them whenever a new real value was wired in. Merged into one
// component with one shared props object so there is only one place to add
// a field, and both layouts read the same values by construction. The two
// layouts still diverge in actual structure and interaction model (mobile's
// compact top-3 rivalry list vs desktop's full delta-column table, bottom
// tab bar vs top context tabs) -- that's real design divergence, not
// duplication, so it stays as two JSX blocks gated by the same md:hidden /
// hidden md:flex pattern as before, just inside one file instead of two.
export function LeagueOverview({
  theme, params, isLoading, isTerminal, isReady, urgent, caught,
  heroTone, heroData, pct, RESULT, nailed, unanswered,
  rivalKicker, gapNumber, gapLabel, gapNote,
  leagueName, memberCount, lifecycleLabel, heroCtaHref,
  homeCode, homeName, homeColor, awayCode, awayName, awayColor, kickoff,
  qTitle, qSub,
  CLUB,
  // Mobile-specific shapes
  rivalsMobile, rBreakdownMobile, resultBgMobile, IconMap, tabs,
  // Desktop-specific shapes
  rivalsDesktop, rBreakdownDesktop, resultStyleDesktop, rootNav, contextTabs, skeletonRows,
  heroStyle, heroDotStyle, heroKicker, heroKickerColor, heroClockColor, heroClock, heroClockSub,
  heroBarStyle, heroProgress, heroCtaStyle, heroCta, heroFoot,
  gapColor, resultKicker, resultKickerColor, resultBadgeStyle, resultBadge,
  rHomeCode, rHomeColor, rAwayCode, rAwayColor, rScore, rPointsStyle, rPoints, rPointsSub, rSummary,
}: any) {
  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_14px] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href="/leagues" className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
              <div className="flex items-center gap-[7px] mt-[4px]">
                {lifecycleLabel && <span className="inline-flex items-center h-[18px] px-[8px] rounded-[6px] font-heading font-bold text-[9.5px] leading-[1] tracking-[0.05em] bg-[var(--nav-accent)] text-[var(--nav-on-accent)]">{lifecycleLabel.toUpperCase()}</span>}
                {memberCount && <span className="font-heading font-semibold text-[9.5px] tracking-[0.07em] text-[var(--nav-text-faint)]">{memberCount} MEMBERS</span>}
              </div>
            </div>
            <div className="tf-tap w-[40px] h-[40px] grid place-items-center text-[var(--nav-text-quiet)] flex-none text-[17px]">⋯</div>
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)] relative">
          {isLoading && (
            <div className="p-[18px_var(--gutter)]">
              <div className="h-[210px] rounded-[20px] bg-[var(--surface-subtle)]"></div>
              <div className="h-[120px] rounded-[16px] bg-[var(--surface-subtle)] mt-[14px]"></div>
              <div className="h-[120px] rounded-[16px] bg-[var(--surface-subtle)] mt-[14px]"></div>
            </div>
          )}

          {isTerminal && (
            <div className="p-[80px_30px] flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[21px] text-[var(--text-muted)]">◷</div>
              <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px] mt-[20px]">No fixtures yet</div>
              <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">This league is published but its first round has not been listed. Nothing can be predicted until it is.</div>
              <Link href={`/leagues/${params.id}/rules`} className="mt-[22px] px-[20px] h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] grid place-items-center font-heading font-bold text-[12px] cursor-pointer">VIEW LEAGUE RULES</Link>
            </div>
          )}

          {isReady && (
            <div>
              {/* HERO */}
              <section className="relative overflow-hidden text-[var(--nav-text)] p-[18px_var(--gutter)_22px]" style={{ background: 'var(--nav-surface)' }}>
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(255,255,255,0.07)]"></div>
                <div className="absolute left-1/2 top-1/2 w-[150px] h-[150px] -ml-[75px] -mt-[75px] border border-[rgba(255,255,255,0.07)] rounded-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-[8px]">
                    <span className={`w-[7px] h-[7px] rounded-full flex-none ${urgent ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`} style={{ background: heroTone }}></span>
                    <span className="tf-kicker" style={{ color: heroTone }}>{heroData[0]}</span>
                  </div>

                  <div className="flex items-end gap-[10px] mt-[9px]">
                    <div className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]" style={{ color: urgent ? 'var(--color-danger)' : 'var(--nav-text)' }}>{heroData[1]}</div>
                    <div className="text-[11px] text-[var(--nav-text-faint)] pb-[7px]">{heroData[2]}</div>
                  </div>

                  <div className="flex items-center gap-[14px] mt-[20px]">
                    <div className="flex-1 flex items-center gap-[9px] min-w-0">
                      <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: homeColor }}>{homeCode}</span>
                      <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{homeName}</span>
                    </div>
                    <span className="font-heading font-semibold text-[10px] text-[var(--nav-text-faint)] flex-none">{kickoff}</span>
                    <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                      <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis text-right">{awayName}</span>
                      <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: awayColor }}>{awayCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-[10px] mt-[20px]">
                    <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, background: caught ? 'var(--nav-positive)' : 'var(--nav-accent)' }}></div>
                    </div>
                    <span className="tf-num font-heading font-bold text-[11px] flex-none">{heroData[3]}</span>
                  </div>

                  <Link href={heroCtaHref || `/predict`} className={`mt-[16px] h-[48px] rounded-[13px] grid place-items-center cursor-pointer font-heading font-bold text-[14px] tracking-[-0.1px] ${caught ? 'border border-[var(--nav-border)] text-[var(--nav-text)]' : 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)]'}`}>
                    {heroData[4]}
                  </Link>
                  <div className="text-[10.5px] leading-[1.5] text-[var(--nav-text-faint)] mt-[10px]">{heroData[5]}</div>
                </div>
              </section>

              {/* RIVALRY */}
              <section className="mt-[22px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">{rivalKicker}</span>
                  <Link href={`/leagues/${params.id}/table`} className="tf-tap font-heading font-bold text-[10px] text-[var(--text-link)]">FULL TABLE →</Link>
                </div>
                {rivalsMobile.map((r: any, i: number) => (
                  <div key={i} className={r.rowStyle}>
                    <span className={`tf-num ${r.posStyle}`}>{r.pos}</span>
                    <span className={r.avatarStyle} style={{ background: r.tintBg }}>{r.initials}</span>
                    <span className={r.nameStyle}>{r.name}</span>
                    <span className={`tf-num ${r.pointsStyle}`}>{r.points}</span>
                  </div>
                ))}
                {gapLabel && (
                  <div className="flex items-end gap-[12px] p-[16px_var(--gutter)_0]">
                    <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px] text-[var(--text-primary)]">{gapNumber}</div>
                    <div className="pb-[3px]">
                      <div className="font-heading font-semibold text-[12.5px]">{gapLabel}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{gapNote}</div>
                    </div>
                  </div>
                )}
              </section>

              {/* PAYOFF */}
              <section className="p-[22px_var(--gutter)_0]">
                <div className="rounded-[12px] p-[18px] text-[var(--tf-white)]" style={{ background: resultBgMobile }}>
                  <div className="flex items-center justify-between gap-[10px]">
                    <span className="tf-kicker text-[rgba(255,255,255,0.62)]">{RESULT.kicker}</span>
                    <span className={`tf-chip bg-[var(--tf-white)] ${nailed ? 'text-[var(--tf-green-800)]' : 'text-[var(--tf-navy-800)]'}`}>{RESULT.badge}</span>
                  </div>

                  <div className="flex items-center gap-[13px] mt-[14px]">
                    <span className="tf-crest w-[34px] h-[37px] text-[11px]" style={{ background: CLUB[RESULT.homeCode] || '#666' }}>{RESULT.homeCode || '—'}</span>
                    <span className="tf-num font-heading font-bold text-[34px] leading-[1] tracking-[-1.2px]">{RESULT.score}</span>
                    <span className="tf-crest w-[34px] h-[37px] text-[11px]" style={{ background: CLUB[RESULT.awayCode] || '#666' }}>{RESULT.awayCode || '—'}</span>
                    <div className="flex-1 text-right">
                      <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.8px] text-[var(--tf-white)]">{RESULT.pts}</div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.55)] mt-[2px]">this fixture</div>
                    </div>
                  </div>

                  <div className="text-[11.5px] leading-[1.55] text-[rgba(255,255,255,0.72)] mt-[13px]">{RESULT.summary}</div>

                  <div className="flex flex-wrap gap-[6px] mt-[13px]">
                    {rBreakdownMobile.map((b: any, i: number) => (
                      <span key={i} className={b.style}>{b.label}</span>
                    ))}
                  </div>
                </div>
              </section>

              {/* QUESTIONS */}
              <Link href={`/leagues/${params.id}/questions`} className="tf-tap flex items-center gap-[12px] mt-[22px] p-[15px_var(--gutter)] border-y border-[var(--surface-border)]">
                <span className="w-[28px] h-[28px] rounded-[8px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-muted)] flex-none">?</span>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-[13px]">{qTitle}</div>
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{qSub}</div>
                </div>
                <span className="font-heading font-bold text-[10px] text-[var(--text-link)] flex-none">VIEW ALL</span>
              </Link>

              <div className="h-[24px]"></div>
            </div>
          )}
        </main>

        <nav className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] grid grid-cols-4 p-[7px_7px_8px] min-h-[66px]">
          {tabs.map((t: any, i: number) => {
            const RenderIcon = IconMap[t.ic];
            const route = t.label === 'OVERVIEW' ? `/leagues/${params.id}` : `/leagues/${params.id}/${t.label.toLowerCase()}`;
            return (
              <Link href={route} key={i} className="relative flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-[1]" style={{ color: t.on ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                <div className="w-[19px] h-[19px] grid place-items-center"><RenderIcon /></div>
                <span className="mt-[6px] tracking-[0.01em]">{t.label}</span>
                {t.b && (
                  <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[8px]">
                    {t.b}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ============ DESKTOP ============ */}
      <div className={`hidden md:flex flex-col flex-1 h-full overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px] min-w-0">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px] whitespace-nowrap">{leagueName || 'League'}</span>
            {memberCount && <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{memberCount} members</span>}
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const route = t.label === 'Overview' ? `/leagues/${params.id}` : `/leagues/${params.id}/${t.label.toLowerCase()}`;
              return (
                <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>
              );
            })}
          </div>
        </div>

        <div className="tf-scroll flex-1 overflow-y-auto">
          {isLoading && (
            <div>
              <div className="h-[246px] bg-[var(--nav-surface)] border-b border-[rgba(255,255,255,0.1)]">
                <div className="max-w-[1080px] mx-auto p-[44px_24px] flex flex-col gap-[18px]">
                  <div className="w-[96px] h-[12px] rounded-full bg-[rgba(255,255,255,0.13)]"></div>
                  <div className="w-[260px] h-[56px] rounded-[12px] bg-[rgba(255,255,255,0.13)]"></div>
                  <div className="w-[190px] h-[12px] rounded-full bg-[rgba(255,255,255,0.09)]"></div>
                </div>
              </div>
              <div className="max-w-[1080px] mx-auto p-[26px_24px] grid grid-cols-[minmax(0,1fr)_372px] gap-[30px] items-start">
                <div>
                  <div className="w-[150px] h-[62px] rounded-[12px] bg-[var(--surface-subtle)]"></div>
                  <div className="w-[230px] h-[13px] rounded-full mt-[16px] bg-[var(--surface-subtle)]"></div>
                  <div className="mt-[26px] border-t border-[var(--surface-border)]">
                    {skeletonRows.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-[13px] p-[12px_10px] border-b border-[var(--surface-border)]">
                        <div className="w-[18px] h-[11px] rounded-full bg-[var(--surface-subtle)]"></div>
                        <div className="w-[32px] h-[32px] rounded-full bg-[var(--surface-subtle)]"></div>
                        <div className="flex-1 h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ maxWidth: s.w }}></div>
                        <div className="w-[52px] h-[11px] rounded-full bg-[var(--surface-subtle)]"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-[236px] rounded-[16px] bg-[var(--surface-subtle)]"></div>
                  <div className="h-[74px] rounded-[14px] mt-[16px] bg-[var(--surface-subtle)]"></div>
                </div>
              </div>
            </div>
          )}

          {isTerminal && (
            <div className="p-[200px_30px] flex flex-col items-center text-center">
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] text-[var(--text-muted)]">◷</div>
              <div className="font-heading font-bold text-[28px] leading-[1.15] tracking-[-0.8px] mt-[22px]">No fixtures yet</div>
              <div className="text-[14px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[430px]">This league is published but its first round has not been listed. Nothing can be predicted until it is.</div>
            </div>
          )}

          {isReady && (
            <div className="animate-[tfin_0.16s_ease]">
              <div style={heroStyle}>
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(255,255,255,0.06)]"></div>
                <div className="absolute left-1/2 top-1/2 w-[340px] h-[340px] -ml-[170px] -mt-[170px] border border-[rgba(255,255,255,0.06)] rounded-full"></div>

                <div className="relative max-w-[1080px] mx-auto px-[24px]">
                  <div className="flex items-center gap-[9px]">
                    <span style={heroDotStyle}></span>
                    <span className="font-heading font-bold text-[10px] tracking-[0.09em] uppercase" style={{ color: heroKickerColor }}>{heroKicker}</span>
                    <span className="flex-1"></span>
                    <span className="font-heading font-semibold text-[10.5px] tracking-[0.08em] text-[var(--nav-text-faint)]">{kickoff}</span>
                  </div>

                  <div className="grid grid-cols-[290px_minmax(0,1fr)] gap-[44px] items-center mt-[20px]">
                    <div>
                      <div className="font-heading font-bold text-[62px] leading-[0.86] tracking-[-3px] font-tabular-nums" style={{ color: heroClockColor }}>{heroClock}</div>
                      <div className="text-[12.5px] leading-[1.45] text-[var(--nav-text-faint)] mt-[11px] max-w-[26ch]">{heroClockSub}</div>
                    </div>

                    <div className="min-w-0">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-[22px] items-center max-w-[600px]">
                        <div className="flex items-center justify-end gap-[14px] min-w-0">
                          <span className="font-heading font-bold text-[26px] leading-[1.05] tracking-[-0.8px] whitespace-nowrap overflow-hidden text-ellipsis text-right">{homeName}</span>
                          <span className="tf-crest w-[52px] h-[56px] text-[13px]" style={{ background: homeColor }}>{homeCode}</span>
                        </div>
                        <span className="font-heading font-semibold text-[11px] text-[var(--nav-text-faint)]">v</span>
                        <div className="flex items-center gap-[14px] min-w-0">
                          <span className="tf-crest w-[52px] h-[56px] text-[13px]" style={{ background: awayColor }}>{awayCode}</span>
                          <span className="font-heading font-bold text-[26px] leading-[1.05] tracking-[-0.8px] whitespace-nowrap overflow-hidden text-ellipsis">{awayName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-[18px] mt-[26px] max-w-[600px]">
                        <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                          <div style={heroBarStyle}></div>
                        </div>
                        <span className="font-heading font-bold text-[12.5px] font-tabular-nums flex-none">{heroProgress}</span>
                        <Link href={heroCtaHref || `/predict`} style={heroCtaStyle}>{heroCta}</Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-[24px] pt-[15px] border-t border-[rgba(255,255,255,0.12)] text-[12px] leading-[1.5] text-[var(--nav-text-faint)]">{heroFoot}</div>
                </div>
              </div>

              <div className="max-w-[1080px] mx-auto p-[26px_24px_30px] grid grid-cols-[minmax(0,1fr)_372px] gap-[30px] items-start">

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-[18px]">
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-[10px] tracking-[0.09em] uppercase text-[var(--text-muted)]">{rivalKicker}</div>
                      <div className="flex items-baseline gap-[14px] mt-[12px]">
                        <span className="font-heading font-bold text-[62px] leading-[0.84] tracking-[-2.8px] font-tabular-nums" style={{ color: gapColor }}>{gapNumber}</span>
                        <span className="font-heading font-semibold text-[15px] text-[var(--text-secondary)]">{gapLabel}</span>
                      </div>
                      <div className="text-[13px] leading-[1.55] text-[var(--text-secondary)] mt-[11px]">{gapNote}</div>
                    </div>
                    <Link href={`/leagues/${params.id}/table`} className="flex-none font-heading font-bold text-[10px] tracking-[0.06em] text-[var(--text-link)] cursor-pointer pb-[5px]">SEE THE FULL TABLE →</Link>
                  </div>

                  <div className="mt-[24px] border-t border-[var(--surface-border-strong)]">
                    {rivalsDesktop.map((r: any, i: number) => (
                      <div key={i} style={r.rowStyle}>
                        <span style={r.posStyle}>{r.pos}</span>
                        <span style={r.avatarStyle}>{r.initials}</span>
                        <span style={r.nameStyle}>{r.name}</span>
                        <span style={r.deltaStyle}>{r.delta}</span>
                        <span style={r.pointsStyle}>{r.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <div style={resultStyleDesktop}>
                    <div className="flex items-center justify-between gap-[12px]">
                      <span className="font-heading font-bold text-[10px] tracking-[0.09em] uppercase" style={{ color: resultKickerColor }}>{resultKicker}</span>
                      <span style={resultBadgeStyle}>{resultBadge}</span>
                    </div>

                    <div className="flex items-center gap-[13px] mt-[20px]">
                      <span className="tf-crest w-[38px] h-[41px] text-[10px]" style={{ background: rHomeColor }}>{rHomeCode}</span>
                      <span className="font-heading font-bold text-[32px] tracking-[-1.2px] text-[var(--tf-white)] font-tabular-nums">{rScore}</span>
                      <span className="tf-crest w-[38px] h-[41px] text-[10px]" style={{ background: rAwayColor }}>{rAwayCode}</span>
                      <span className="flex-1"></span>
                      <span className="text-right">
                        <span style={rPointsStyle}>{rPoints}</span>
                        <span className="block text-[10.5px] text-[rgba(255,255,255,0.6)] mt-[2px]">{rPointsSub}</span>
                      </span>
                    </div>

                    <div className="text-[12.5px] leading-[1.55] text-[rgba(255,255,255,0.84)] mt-[16px]">{rSummary}</div>

                    <div className="flex flex-wrap gap-[7px] mt-[18px] pt-[16px] border-t border-[rgba(255,255,255,0.15)]">
                      {rBreakdownDesktop.map((b: any, i: number) => (
                        <span key={i} style={b.style}>{b.label}</span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/leagues/${params.id}/questions`} className="tf-card mt-[16px] p-[16px_18px] flex items-center gap-[14px] cursor-pointer hover:bg-[var(--surface-card-hover)]">
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[14px] tracking-[-0.25px]">{qTitle}</div>
                      <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[5px]">{qSub}</div>
                    </div>
                    <span className="text-[17px] text-[var(--text-muted)] flex-none">›</span>
                  </Link>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
