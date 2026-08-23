'use client';

import Link from 'next/link';

export function LeagueFixturesDesktop({
  theme, rootNav, avatarInitials, avatarName, showContext, contextTabs,
  headSub, segments, showFilters, filters, isLoading, skeletons, chipSkeletons, skeletonRowStyle, headRowStyle,
  isEmpty, emptyTitle, emptyBody, showList, groups, loadMore, footNote, footNoteStyle, colMid, colNote, colRight
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      {showContext && (
        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
            <span className="text-[11px] text-[var(--text-muted)]">128 members</span>
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const route = t.label === 'Overview' ? `/leagues/1` : `/leagues/1/${t.label.toLowerCase()}`;
              return (
                <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="tf-scroll flex-1 overflow-y-auto">
        <div className="max-w-[1080px] mx-auto px-[24px] pb-[30px]">
          
          <div className="flex items-end gap-[16px] mt-[24px]">
            <div className="flex-1">
              <div className="font-heading font-bold text-[24px] leading-[1.15] tracking-[-0.6px]">Fixtures</div>
              <div className="text-[12.5px] text-[var(--text-secondary)] mt-[5px]">{headSub}</div>
            </div>
          </div>

          <div className="flex items-center gap-[4px] p-[3px] rounded-[12px] bg-[var(--surface-subtle)] mt-[20px] w-max">
            {segments.map((s: any, i: number) => (
              <div key={i} onClick={s.pick} style={s.style}>{s.label}<span style={s.countStyle}>{s.count}</span></div>
            ))}
          </div>

          {showFilters && (
            <div className="flex items-center gap-[7px] mt-[14px]">
              {filters.map((f: any, i: number) => (
                <div key={i} onClick={f.pick} style={f.style}>{f.label}<span style={f.countStyle}>{f.count}</span></div>
              ))}
            </div>
          )}

          {isLoading && (
            <div>
              <div className="flex items-center gap-[7px] mt-[14px]">
                {chipSkeletons.map((c: any, i: number) => (
                  <div key={i} className="h-[30px] rounded-full bg-[var(--surface-subtle)]" style={{ width: c.w }}></div>
                ))}
              </div>
              <div className="mt-[18px]">
                <div style={headRowStyle}>
                  <span className="tf-kicker">State</span>
                  <span className="tf-kicker">Fixture</span>
                  <span className="tf-kicker text-center">{colMid}</span>
                  <span className="tf-kicker">{colNote}</span>
                  <span className="tf-kicker text-right">{colRight}</span>
                  <span></span>
                </div>
                {skeletons.map((s: any, i: number) => (
                  <div key={i} style={skeletonRowStyle}>
                    <div className="w-[62px] h-[20px] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="flex items-center gap-[9px] min-w-0">
                      <div className="w-[26px] h-[28px] flex-none rounded-[6px] bg-[var(--surface-subtle)]"></div>
                      <div className="h-[12px] flex-1 max-w-[100%] rounded-[6px] bg-[var(--surface-subtle)]" style={{ maxWidth: s.w }}></div>
                      <div className="w-[26px] h-[28px] flex-none rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    </div>
                    <div className="h-[11px] w-[40px] justify-self-center rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="h-[11px] w-[70%] rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="h-[11px] w-[52px] justify-self-end rounded-[6px] bg-[var(--surface-subtle)]"></div>
                    <div className="h-[11px] w-[46px] justify-self-end rounded-[6px] bg-[var(--surface-subtle)]"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEmpty && (
            <div className="py-[150px] px-[30px] flex flex-col items-center text-center">
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] text-[var(--text-muted)]">◇</div>
              <div className="font-heading font-bold text-[26px] leading-[1.15] tracking-[-0.7px] mt-[22px]">{emptyTitle}</div>
              <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[420px]">{emptyBody}</div>
            </div>
          )}

          {showList && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="mt-[18px]">
                <div style={headRowStyle}>
                  <span className="tf-kicker">State</span>
                  <span className="tf-kicker">Fixture</span>
                  <span className="tf-kicker text-center">{colMid}</span>
                  <span className="tf-kicker">{colNote}</span>
                  <span className="tf-kicker text-right">{colRight}</span>
                  <span></span>
                </div>

                {groups.map((g: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-[8px] p-[20px_4px_8px] border-b border-[var(--surface-border)]">
                      <span className="tf-kicker text-[var(--text-secondary)]">{g.label}</span>
                      <span className="text-[10.5px] text-[var(--text-muted)]">{g.note}</span>
                    </div>
                    {g.rows.map((r: any, j: number) => (
                      <div key={j} style={r.rowStyle} onClick={r.onClick}>
                        <span style={r.stateStyle}>{r.state}</span>
                        <div className="flex items-center gap-[9px] min-w-0">
                          <span className="tf-crest" style={{ background: r.homeColor }}>{r.homeCode}</span>
                          <span style={r.teamStyle}>{r.home}</span>
                          <span className="text-[10px] text-[var(--text-muted)] flex-none">v</span>
                          <span style={r.teamStyle}>{r.away}</span>
                          <span className="tf-crest" style={{ background: r.awayColor }}>{r.awayCode}</span>
                        </div>
                        <span className="tf-num" style={r.midStyle}>{r.mid}</span>
                        <span className="text-[11.5px] leading-[1.45] text-[var(--text-secondary)] min-w-0">{r.note}</span>
                        <span className="tf-num" style={r.rightStyle}>{r.right}</span>
                        <span style={r.actionStyle}>{r.action}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid place-items-center mt-[20px]">
                <span className="font-heading font-bold text-[10.5px] tracking-[0.07em] text-[var(--text-link)] cursor-pointer">{loadMore}</span>
              </div>

              <div style={footNoteStyle}>{footNote}</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
