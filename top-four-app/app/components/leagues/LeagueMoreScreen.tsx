'use client';

import Link from 'next/link';

// Merged from LeagueMoreMobile/LeagueMoreDesktop. Desktop's own top nav
// (rootNav/avatarInitials/avatarName) was dead -- DesktopLevelOne in the
// root layout is the real one, this never rendered.
export function LeagueMoreScreen({
  theme, params, done, leagueName, roleLabel, lifecycleLabel, footNote,
  groupsMobile, IconMap, tabs,
  contextTabs, headSub, roleChipStyle, lifecycleStyle, mainGroups, endLabel, endRows,
  memberCount,
}: any) {
  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className={`md:hidden flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_14px] flex-none">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${params.id}`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{leagueName || 'League'}</div>
              <div className="flex items-center gap-[7px] mt-[4px]">
                <span className={`inline-flex items-center h-[20px] px-[8px] rounded-[5px] font-heading font-bold text-[9px] leading-[1] tracking-[0.05em] ${done ? 'bg-[var(--nav-fill)] text-[var(--nav-text-quiet)]' : 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)]'}`}>
                  {lifecycleLabel}
                </span>
                <span className="font-heading font-semibold text-[9.5px] tracking-[0.07em] text-[var(--nav-text-faint)]">{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
          {groupsMobile.map((g: any, i: number) => (
            <section key={i} className="mt-[18px]">
              <div className="p-[0_var(--gutter)_9px]">
                <span className="tf-kicker" style={{ color: g.labelColor }}>{g.label}</span>
              </div>
              {g.rows.map((r: any, j: number) => {
                const Wrapper = r.href ? Link : 'div';
                return (
                  <Wrapper href={r.href || '#'} key={j} onClick={r.onClick} className={`tf-tap ${r.rowStyle}`}>
                    <span className={r.iconStyle}>{r.glyph}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[8px]">
                        <span className="font-heading font-semibold text-[13.5px]" style={{ color: r.titleColor }}>{r.title}</span>
                        <span className={r.badgeStyle}>{r.badge}</span>
                      </div>
                      <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{r.note}</div>
                    </div>
                    <span className="font-[400] text-[17px] font-heading text-[var(--text-muted)] flex-none">›</span>
                  </Wrapper>
                );
              })}
            </section>
          ))}
          <div className="p-[18px_var(--gutter)_26px] text-[11px] leading-[1.55] text-[var(--text-muted)]">{footNote}</div>
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
            <span style={lifecycleStyle}>{lifecycleLabel}</span>
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

            <div className="flex items-end gap-[16px] mt-[24px] animate-[tfin_0.16s_ease]">
              <div className="flex-1">
                <div className="font-heading font-bold text-[24px] leading-[1.15] tracking-[-0.6px]">More</div>
                <div className="text-[12.5px] text-[var(--text-secondary)] mt-[5px]">{headSub}</div>
              </div>
              <span style={roleChipStyle}>{roleLabel}</span>
            </div>

            <div className="flex gap-[20px] mt-[22px] items-start animate-[tfin_0.16s_ease]">
              <div className="flex-1 min-w-0">
                {mainGroups.map((g: any, i: number) => (
                  <div key={i} style={g.wrapStyle}>
                    <div className="tf-kicker text-[var(--text-secondary)]">{g.label}</div>
                    <div className="mt-[10px] border-t border-[var(--surface-border)]">
                      {g.rows.map((r: any, j: number) => {
                        const Wrapper = r.href ? Link : 'div';
                        return (
                          <Wrapper href={r.href || '#'} key={j} style={r.rowStyle}>
                            <span style={r.iconStyle}>{r.glyph}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-[9px]">
                                <span style={{ font: "650 13.5px 'DM Sans',sans-serif", letterSpacing: '-.2px', color: r.titleColor }}>{r.title}</span>
                                <span style={r.badgeStyle}>{r.badge}</span>
                              </div>
                              <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">{r.note}</div>
                            </div>
                            <span style={r.chevronStyle}>›</span>
                          </Wrapper>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-[352px] flex-none">
                <div className="tf-kicker text-[var(--danger-text)]">{endLabel}</div>
                <div className="mt-[10px] border-t border-[var(--surface-border)]">
                  {endRows.map((r: any, i: number) => {
                    const Wrapper = r.href ? Link : 'div';
                    return (
                      <Wrapper href={r.href || '#'} key={i} onClick={r.onClick} style={r.rowStyle}>
                        <span style={r.iconStyle}>{r.glyph}</span>
                        <div className="flex-1 min-w-0">
                          <div style={{ font: "650 13.5px 'DM Sans',sans-serif", letterSpacing: '-.2px', color: r.titleColor }}>{r.title}</div>
                          <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">{r.note}</div>
                        </div>
                        <span style={r.chevronStyle}>›</span>
                      </Wrapper>
                    );
                  })}
                </div>
                <div className="mt-[20px] pt-[16px] border-t border-[var(--surface-border)]">
                  <div className="text-[11.5px] leading-[1.6] text-[var(--text-muted)]">{footNote}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
