'use client';

import Link from 'next/link';
import { LeagueTabs } from './LeagueTabs';
import type { LeagueMoreMobileProps } from './league-more-props';

export function LeagueMoreMobile({
  theme, params, owner, admin, runs, done,
  groups, roleLabel, lifecycleLabel, footNote, leagueName
}: LeagueMoreMobileProps) {

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
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

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)] pb-[86px]">
        {groups.map((g: any, i: number) => (
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

      {/* The shared league bar — it used to be copy-pasted here. */}
      <div className="md:hidden"><LeagueTabs leagueId={params.id} active="more" /></div>
    </div>
  );
}
