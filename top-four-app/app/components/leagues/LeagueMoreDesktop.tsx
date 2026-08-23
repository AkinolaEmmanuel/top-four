'use client';

import Link from 'next/link';

export function LeagueMoreDesktop({
  theme, rootNav, avatarInitials, avatarName, showContext, contextTabs,
  headSub, roleLabel, roleChipStyle, lifecycleLabel, lifecycleStyle,
  mainGroups, endLabel, endRows, footNote
}: any) {

  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative ${theme === 'dark' ? 'dark' : ''}`}>
      

      {showContext && (
        <div className="flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] flex items-end gap-[20px] px-[24px] h-[54px]">
          <div className="flex items-center gap-[10px] pb-[11px]">
            <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--color-brand)] grid place-items-center font-heading font-bold text-[10px] text-[var(--color-on-brand)]">PP</span>
            <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Premier Predictors</span>
            <span style={lifecycleStyle}>{lifecycleLabel}</span>
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
                {endRows.map((r: any, i: number) => (
                  <div key={i} style={r.rowStyle}>
                    <span style={r.iconStyle}>{r.glyph}</span>
                    <div className="flex-1 min-w-0">
                      <div style={{ font: "650 13.5px 'DM Sans',sans-serif", letterSpacing: '-.2px', color: r.titleColor }}>{r.title}</div>
                      <div className="text-[11.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">{r.note}</div>
                    </div>
                    <span style={r.chevronStyle}>›</span>
                  </div>
                ))}
              </div>
              <div className="mt-[20px] pt-[16px] border-t border-[var(--surface-border)]">
                <div className="text-[11.5px] leading-[1.6] text-[var(--text-muted)]">{footNote}</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
