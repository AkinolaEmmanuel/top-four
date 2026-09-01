'use client';

import Link from 'next/link';

export function LeagueMobile({
  theme, CLUB, params, st, isLoading, isTerminal, isReady, urgent, caught,
  heroTone, heroData, pct, rivals, RESULT, nailed, rBreakdown, unanswered,
  IconMap, tabs, heroBg, resultBg, leagueName, memberCount, lifecycleLabel, heroCtaHref
}: any) {

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
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
            <section className="relative overflow-hidden text-[var(--nav-text)] p-[18px_var(--gutter)_22px]" style={{ background: heroBg }}>
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
                    <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: CLUB.ARS }}>ARS</span>
                    <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">Arsenal</span>
                  </div>
                  <span className="font-heading font-semibold text-[10px] text-[var(--nav-text-faint)] flex-none">SAT 15:00</span>
                  <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                    <span className="font-heading font-[650] text-[15px] leading-[1.15] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis text-right">Chelsea</span>
                    <span className="tf-crest w-[40px] h-[43px] text-[11px]" style={{ background: CLUB.CHE }}>CHE</span>
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
                <span className="tf-kicker text-[var(--text-muted)]">{caught ? "YOU ARE 24TH OF 128" : "YOU ARE CHASING TOBI"}</span>
                <Link href={`/leagues/${params.id}/table`} className="tf-tap font-heading font-bold text-[10px] text-[var(--text-link)]">FULL TABLE →</Link>
              </div>
              {rivals.map((r: any, i: number) => (
                <div key={i} className={r.rowStyle}>
                  <span className={`tf-num ${r.posStyle}`}>{r.pos}</span>
                  <span className={r.avatarStyle} style={{ background: r.tintBg }}>{r.initials}</span>
                  <span className={r.nameStyle}>{r.name}</span>
                  <span className={`tf-num ${r.pointsStyle}`}>{r.points}</span>
                </div>
              ))}
              <div className="flex items-end gap-[12px] p-[16px_var(--gutter)_0]">
                <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px] text-[var(--text-primary)]">6</div>
                <div className="pb-[3px]">
                  <div className="font-heading font-semibold text-[12.5px]">{caught ? "points behind 23rd" : "points behind Tobi"}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{caught ? "and 5 clear of 25th" : "One exact score would do it."}</div>
                </div>
              </div>
            </section>

            {/* PAYOFF */}
            <section className="p-[22px_var(--gutter)_0]">
              <div className="rounded-[12px] p-[18px] text-[var(--tf-white)]" style={{ background: resultBg }}>
                <div className="flex items-center justify-between gap-[10px]">
                  <span className="tf-kicker text-[rgba(255,255,255,0.62)]">{RESULT.kicker}</span>
                  <span className={`tf-chip bg-[var(--tf-white)] ${nailed ? 'text-[var(--tf-green-800)]' : 'text-[var(--tf-navy-800)]'}`}>{RESULT.badge}</span>
                </div>

                <div className="flex items-center gap-[13px] mt-[14px]">
                  <span className="tf-crest w-[34px] h-[37px] text-[11px]" style={{ background: CLUB.LIV }}>LIV</span>
                  <span className="tf-num font-heading font-bold text-[34px] leading-[1] tracking-[-1.2px]">2 — 1</span>
                  <span className="tf-crest w-[34px] h-[37px] text-[11px]" style={{ background: CLUB.TOT }}>TOT</span>
                  <div className="flex-1 text-right">
                    <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.8px] text-[var(--tf-white)]">{RESULT.pts}</div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.55)] mt-[2px]">this fixture</div>
                  </div>
                </div>

                <div className="text-[11.5px] leading-[1.55] text-[rgba(255,255,255,0.72)] mt-[13px]">{RESULT.summary}</div>

                <div className="flex flex-wrap gap-[6px] mt-[13px]">
                  {rBreakdown.map((b: any, i: number) => (
                    <span key={i} className={b.style}>{b.label}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* QUESTIONS */}
            <Link href={`/leagues/${params.id}/questions`} className="tf-tap flex items-center gap-[12px] mt-[22px] p-[15px_var(--gutter)] border-y border-[var(--surface-border)]">
              <span className="w-[28px] h-[28px] rounded-[8px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-muted)] flex-none">?</span>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-[13px]">2 questions open</div>
                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">Earliest closes Friday · 18 points between them</div>
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
  );
}
