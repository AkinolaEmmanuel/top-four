'use client';

import Link from 'next/link';
import { LeagueTabs } from './LeagueTabs';
import type { LeagueFixturesMobileProps } from './league-fixtures-props';
import Image from 'next/image';

function Crest({ logo, code, color }: { logo?: string | null; code: string; color: string }) {
  if (logo) {
    return (
      <span className="tf-crest w-[26px] h-[29px] relative overflow-hidden bg-white flex-none">
        <Image src={logo} alt={code} fill sizes="26px" className="object-contain p-[2px]" />
      </span>
    );
  }
  return <span className="tf-crest w-[26px] h-[29px] text-[9px]" style={{ background: color }}>{code}</span>;
}

export function LeagueFixturesMobile({
  theme, params, st, isLoading, isEmpty, showList, results,
  headSub, emptyTitle, emptyBody, loadMore, showLoadMore, loadMoreAction, footNote,
  segments, filters, groups
}: LeagueFixturesMobileProps) {

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
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
          {segments.map((s: any, i: number) => (
            <div key={i} onClick={s.pick} className={s.style}>{s.label}<span className={s.countStyle}>{s.count}</span></div>
          ))}
        </div>
      </header>

      {showList && !results && (
        <div className="tf-scroll flex-none flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto bg-[var(--surface-canvas)] border-b border-[var(--surface-border)]">
          {filters.map((f: any, i: number) => (
            <div key={i} onClick={f.pick} className={f.style}>{f.label}<span className={f.countStyle}>{f.count}</span></div>
          ))}
        </div>
      )}

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)] pb-[86px]">

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
            {groups.map((g: any, i: number) => (
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

      {/* The shared league bar — it used to be copy-pasted here. */}
      <div className="md:hidden"><LeagueTabs leagueId={params.id} active="fixtures" /></div>
    </div>
  );
}
