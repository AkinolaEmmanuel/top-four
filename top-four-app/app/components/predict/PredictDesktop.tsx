'use client';

import Link from 'next/link';

export function PredictDesktop({ state, theme, ...props }: any) {
  const st = state;
  const isLoading = st === "loading", isTerminal = st === "empty" || st === "error" || st === "noLeagues";
  const ready = !isLoading && !isTerminal;

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Level Two Context Bar */}
      <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-center gap-[10px] pb-[11px]">
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{props.headTitle}</span>
          <span className="text-[11px] text-[var(--text-muted)]">{props.headSub}</span>
        </div>
      </div>

      <div className="tf-scroll flex-1 overflow-y-auto">
        {isLoading && (
          <div>
            <div className="bg-[var(--nav-surface)] py-[26px] pb-[28px]">
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[36px]">
                <div className="flex-none flex flex-col gap-[11px]">
                  <div className="w-[132px] h-[10px] rounded-full bg-[rgba(255,255,255,0.13)]"></div>
                  <div className="w-[104px] h-[42px] rounded-[10px] bg-[rgba(255,255,255,0.13)]"></div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[9px]">
                  <div className="w-[58%] h-[13px] rounded-full bg-[rgba(255,255,255,0.11)]"></div>
                  <div className="w-[38%] h-[10px] rounded-full bg-[rgba(255,255,255,0.08)]"></div>
                </div>
                <div className="w-[150px] h-[44px] rounded-[12px] bg-[rgba(255,255,255,0.13)] flex-none"></div>
              </div>
            </div>
            
            <div className="max-w-[1080px] mx-auto p-[26px_24px_0]">
              <div className="tf-skeleton w-[132px] h-[17px] mb-[14px]"></div>
              {props.skeletons.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-[16px] p-[15px_18px] border-t border-[var(--surface-border)]">
                  <div className="tf-skeleton w-[52px] h-[44px] flex-none"></div>
                  <div className="flex-1 min-w-0">
                    <div className="tf-skeleton h-[11px]" style={{ width: s.w }}></div>
                    <div className="tf-skeleton h-[9px] w-[34%] mt-[8px]"></div>
                  </div>
                  <div className="w-[176px] flex-none">
                    <div className="tf-skeleton h-[5px] rounded-full"></div>
                  </div>
                  <div className="tf-skeleton w-[96px] h-[11px] flex-none"></div>
                  <div className="tf-skeleton w-[66px] h-[31px] rounded-[10px] flex-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isTerminal && (
          <div className="max-w-[1080px] mx-auto p-[110px_30px] flex flex-col items-center text-center">
            <div style={{ color: props.termIconColor }}>{props.termIcon}</div>
            <div className="font-heading font-bold text-[26px] leading-[1.15] tracking-[-0.5px] mt-[20px]">{props.termTitle}</div>
            <div className="text-[14px] leading-[1.55] text-[var(--text-secondary)] mt-[11px] max-w-[440px]">{props.termBody}</div>
            <div onClick={props.retry} style={props.termActionStyle}>{props.termAction}</div>
          </div>
        )}

        {ready && (
          <div>
            {/* HERO */}
            <div style={props.heroStyle}>
              <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[36px]">
                <div className="flex-none">
                  <div className="flex items-center gap-[8px]">
                    <span style={props.heroDotStyle}></span>
                    <span className="tf-kicker" style={{ color: props.heroTone }}>{props.heroKicker}</span>
                  </div>
                  <div className="flex items-end gap-[10px] mt-[9px]">
                    <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]" style={{ color: props.heroTone }}>{props.heroNum}</span>
                    <span className="text-[12px] text-[var(--nav-text-faint)] pb-[6px]">{props.heroSub}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[15px] tracking-[-0.2px]">{props.urgentText}</div>
                  <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[4px]">{props.urgentSub}</div>
                </div>
                <Link href={props.heroCtaHref || "/predict"} style={props.heroCtaStyle}>Start with this one</Link>
              </div>
            </div>

            <div className="max-w-[1080px] mx-auto p-[20px_24px_0] flex items-center gap-[9px]">
              {props.leagueFilters.map((f: any, i: number) => (
                <div key={i} onClick={f.pick} style={f.style}>{f.label}</div>
              ))}
              <div className="flex-1"></div>
              <span className="text-[11.5px] text-[var(--text-muted)]">{props.todoSub}</span>
            </div>

            {props.desktopGroups.map((g: any, i: number) => (
              <div key={i} className="max-w-[1080px] mx-auto p-[24px_24px_0]">
                <div className="flex items-baseline gap-[10px] pb-[9px]">
                  <span style={g.labelStyle}>{g.label}</span>
                  <span className="text-[11.5px] text-[var(--text-muted)]">{g.note}</span>
                </div>
                {g.items.map((it: any, j: number) => (
                  <Link href={it.href || `/predict/fixture/${it.homeCode || 'unknown'}`} key={j} style={it.rowStyle} className="hover:bg-[var(--surface-subtle)] transition-colors block flex items-center gap-[16px]">
                    <div style={it.markWrapStyle}>
                      <span className="tf-crest" style={it.homeStyle}>{it.homeCode}</span>
                      <span className="tf-crest" style={it.awayStyle}>{it.awayCode}</span>
                      <span style={it.questionMarkStyle}>?</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[14px] whitespace-nowrap overflow-hidden text-ellipsis">{it.fixture}</div>
                      <div className="text-[11.5px] text-[var(--text-muted)] mt-[3px]">{it.league}</div>
                    </div>
                    <div className="w-[176px] flex-none">
                      {it.showBar && (
                        <div className="flex items-center gap-[8px]">
                          <div className="flex-1 h-[5px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                            <div style={it.barStyle}></div>
                          </div>
                          <span className="tf-num font-heading font-semibold text-[11px] text-[var(--text-secondary)]">{it.progress}</span>
                        </div>
                      )}
                      <div style={it.missingStyle}>{it.missing}</div>
                    </div>
                    <span style={it.deadlineStyle}>{it.deadline}</span>
                    <span style={it.ctaStyle}>{it.cta}</span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="max-w-[1080px] mx-auto p-[20px_24px_30px] text-[11.5px] text-[var(--text-muted)] leading-[1.55]">
              Lineups disappear from this list two hours before kick-off, not at kick-off — they lock first, so they stop being something you can act on sooner.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
