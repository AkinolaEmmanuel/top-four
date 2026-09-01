'use client';

import Link from 'next/link';

export function LeagueDesktop({
  theme, rootNav, contextTabs, isLoading, isTerminal, isReady,
  heroStyle, heroDotStyle, heroKicker, heroKickerColor, heroClockColor, heroClock, heroClockSub,
  homeName, homeCode, homeColor, awayName, awayCode, awayColor,
  kickoff, heroBarStyle, heroProgress, heroCtaStyle, heroCta, heroFoot,
  rivalKicker, rivals, gapNumber, gapColor, gapLabel, gapNote,
  resultStyle, resultKicker, resultKickerColor, resultBadgeStyle, resultBadge,
  rHomeCode, rHomeColor, rAwayCode, rAwayColor, rScore, rPointsStyle, rPoints, rPointsSub, rSummary, rBreakdown,
  qTitle, qSub, skeletonRows, params, leagueName, memberCount
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

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
                      <Link href={`/predict/fixture/ARS`} style={heroCtaStyle}>{heroCta}</Link>
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
                  {rivals.map((r: any, i: number) => (
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
                <div style={resultStyle}>
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
                    {rBreakdown.map((b: any, i: number) => (
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
  );
}
