'use client';

import Link from 'next/link';
import Image from 'next/image';

function Crest({ logo, code, color, size = 26 }: { logo?: string | null; code: string; color: string; size?: number }) {
  const h = Math.round(size * 1.08);
  if (logo) {
    return (
      <span className="tf-crest relative overflow-hidden bg-white flex-none" style={{ width: size, height: h }}>
        <Image src={logo} alt={code} fill sizes={`${size}px`} className="object-contain p-[2px]" />
      </span>
    );
  }
  return <span className="tf-crest flex-none" style={{ width: size, height: h, fontSize: size < 24 ? 9 : 9, background: color }}>{code}</span>;
}

// Desktop's own top nav (rootNav/avatarInitials/avatarName) was dead --
// DesktopLevelOne in the root layout is the real one, this never rendered.
// The context tab bar (Overview/Fixtures/Table/More) here is legitimately
// page-scoped chrome, not the global nav, so it stays as its own thing on
// both layouts rather than becoming a shared component.
export function LeagueFixturesScreen({
  theme, params, st, isLoading, isEmpty, showList, results,
  headSub, emptyTitle, emptyBody, loadMore, showLoadMore, loadMoreAction, footNote,
  leagueName, memberCount,
  segmentsMobile, filtersMobile, groupsMobile, IconMap, tabs,
  contextTabs, segmentsDesktop, showFilters, filtersDesktop,
  skeletons, chipSkeletons, skeletonRowStyle, headRowStyle, groupsDesktop,
  footNoteStyle, colMid, colNote, colRight,
}: any) {
  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_0] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${params.id}`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px]">Fixtures</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
            </div>
            <div className="tf-tap w-[40px] h-[40px] grid place-items-center text-[var(--nav-text-quiet)] flex-none text-[15px]">⌕</div>
          </div>

          <div className="flex gap-[2px] mt-[14px] shadow-[inset_0_-1px_0_0_var(--surface-border-strong)]">
            {segmentsMobile.map((s: any, i: number) => (
              <div key={i} onClick={s.pick} className={s.style}>{s.label}<span className={s.countStyle}>{s.count}</span></div>
            ))}
          </div>
        </header>

        {showList && !results && (
          <div className="tf-scroll flex-none flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto bg-[var(--surface-canvas)] border-b border-[var(--surface-border)]">
            {filtersMobile.map((f: any, i: number) => (
              <div key={i} onClick={f.pick} className={f.style}>{f.label}<span className={f.countStyle}>{f.count}</span></div>
            ))}
          </div>
        )}

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">

          {isLoading && (
            <div>
              {[{ w: "64%" }, { w: "52%" }, { w: "71%" }, { w: "58%" }, { w: "66%" }, { w: "48%" }].map((s, i) => (
                <div key={i} className="p-[15px_var(--gutter)] border-b border-[var(--surface-border)]">
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="h-[9px] rounded-full bg-[var(--surface-subtle)] w-[44%] mt-[9px]"></div>
                </div>
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="p-[70px_30px] flex flex-col items-center text-center">
              <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px]">{emptyTitle}</div>
              <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">{emptyBody}</div>
            </div>
          )}

          {showList && (
            <div>
              {groupsMobile.map((g: any, i: number) => (
                <section key={i}>
                  <div className="flex items-baseline justify-between p-[16px_var(--gutter)_9px]">
                    <span className="tf-kicker text-[var(--text-muted)]">{g.label}</span>
                    <span className="text-[10.5px] text-[var(--text-muted)]">{g.note}</span>
                  </div>
                  {g.rows.map((f: any, j: number) => (
                    <div key={j} onClick={f.onClick} className={`tf-tap ${f.rowStyle}`}>
                      <div className="flex items-center gap-[11px]">
                        <div className="flex-1 flex items-center gap-[8px] min-w-0">
                          <Crest logo={f.homeLogo} code={f.homeCode} color={f.homeColor} />
                          <span className={f.teamStyle}>{f.home}</span>
                        </div>
                        <div className="flex-none text-center min-w-[44px]">
                          <div className={`tf-num ${f.midStyle}`}>{f.mid}</div>
                        </div>
                        <div className="flex-1 flex items-center gap-[8px] justify-end min-w-0">
                          <span className={`${f.teamStyle} text-right`}>{f.away}</span>
                          <Crest logo={f.awayLogo} code={f.awayCode} color={f.awayColor} />
                        </div>
                      </div>
                      <div className="flex items-center gap-[9px] mt-[11px]">
                        <span className={f.stateStyle}>{f.state}</span>
                        <span className="text-[10.5px] text-[var(--text-muted)] flex-1 min-w-0">{f.note}</span>
                        <span className={f.actionStyle}>{f.action} →</span>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
              <div className="p-[16px_var(--gutter)_24px]">
                {showLoadMore && (
                  <div onClick={loadMoreAction} className="tf-tap p-[13px] rounded-[11px] border border-[var(--surface-border-strong)] text-center font-heading font-bold text-[10.5px] text-[var(--text-link)]">{loadMore}</div>
                )}
                <div className="text-[11px] leading-[1.55] text-[var(--text-muted)] mt-[14px]">{footNote}</div>
              </div>
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
      <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>

        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">{leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG'}</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">{leagueName || 'League'}</span>
            {memberCount && <span className="text-[11px] text-[var(--text-muted)]">{memberCount} members</span>}
          </div>
          <div className="flex items-center gap-[2px] ml-auto">
            {contextTabs.map((t: any, i: number) => {
              const leagueId = params?.id || '';
              const route = t.label === 'Overview' ? `/leagues/${leagueId}` : `/leagues/${leagueId}/${t.label.toLowerCase()}`;
              return (
                <Link href={route} key={i} style={t.style}>{t.label}<span style={t.badgeStyle}>{t.badge}</span></Link>
              );
            })}
          </div>
        </div>

        <div className="tf-scroll flex-1 overflow-y-auto">
          <div className="max-w-[1080px] mx-auto px-[24px] pb-[30px]">

            <div className="flex items-end gap-[16px] mt-[24px]">
              <div className="flex-1">
                <div className="font-heading font-bold text-[24px] leading-[1.15] tracking-[-0.6px]">Fixtures</div>
                <div className="text-[12.5px] text-[var(--text-secondary)] mt-[5px]">{headSub}</div>
              </div>
            </div>

            <div className="flex items-center gap-[4px] p-[3px] rounded-[12px] bg-[var(--surface-subtle)] mt-[20px] w-max">
              {segmentsDesktop.map((s: any, i: number) => (
                <div key={i} onClick={s.pick} style={s.style}>{s.label}<span style={s.countStyle}>{s.count}</span></div>
              ))}
            </div>

            {showFilters && (
              <div className="flex items-center gap-[7px] mt-[14px]">
                {filtersDesktop.map((f: any, i: number) => (
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

                  {groupsDesktop.map((g: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-[8px] p-[20px_4px_8px] border-b border-[var(--surface-border)]">
                        <span className="tf-kicker text-[var(--text-secondary)]">{g.label}</span>
                        <span className="text-[10.5px] text-[var(--text-muted)]">{g.note}</span>
                      </div>
                      {g.rows.map((r: any, j: number) => (
                        <div key={j} style={r.rowStyle} onClick={r.onClick}>
                          <span style={r.stateStyle}>{r.state}</span>
                          <div className="flex items-center gap-[9px] min-w-0">
                            <Crest logo={r.homeLogo} code={r.homeCode} color={r.homeColor} size={22} />
                            <span style={r.teamStyle}>{r.home}</span>
                            <span className="text-[10px] text-[var(--text-muted)] flex-none">v</span>
                            <span style={r.teamStyle}>{r.away}</span>
                            <Crest logo={r.awayLogo} code={r.awayCode} color={r.awayColor} size={22} />
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

                {showLoadMore && (
                  <div className="grid place-items-center mt-[20px]">
                    <span onClick={loadMoreAction} className="font-heading font-bold text-[10.5px] tracking-[0.07em] text-[var(--text-link)] cursor-pointer">{loadMore}</span>
                  </div>
                )}

                <div style={footNoteStyle}>{footNote}</div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
