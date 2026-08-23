'use client';

import Link from 'next/link';

export function LeaguesMobile({
  theme, state, filter, filters, groups, isLoading, isEmpty, isReady,
  atCapacity, capacityLabel, skeletons, IconMap, tabs
}: any) {
  const hasFilters = isReady;

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] flex-none">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-heading font-[650] text-[24px] leading-[1] tracking-[-0.8px]">Leagues</div>
            <div className="font-['Sora',sans-serif] font-medium text-[11.5px] mt-[6px]" style={{ color: atCapacity ? 'var(--nav-accent)' : 'var(--nav-text-faint)' }}>{capacityLabel}</div>
          </div>
          <Link href="/leagues/create" className="tf-tap w-[42px] h-[42px] rounded-[13px] grid place-items-center font-['DM_Sans',sans-serif] font-normal text-[24px] flex-none" style={atCapacity ? { background: 'var(--nav-fill)', color: 'var(--nav-text-faint)', cursor: 'not-allowed', pointerEvents: 'none' } : { background: 'var(--nav-accent)', color: 'var(--nav-on-accent)' }}>+</Link>
        </div>
      </header>

      {hasFilters && (
        <div className="tf-scroll flex-none flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto bg-[var(--surface-canvas)] border-b border-[var(--surface-border)]">
          {filters.map((f: any, i: number) => (
            <div key={i} onClick={f.pick} className="flex items-center h-[32px] px-[12px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px]" style={f.on ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' } : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}>
              {f.label}
              <span className="ml-[6px] font-tabular-nums" style={{ opacity: f.on ? 0.7 : 0.55 }}>{f.count}</span>
            </div>
          ))}
        </div>
      )}

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {isLoading && (
          <div className="p-[14px_var(--gutter)] animate-[tfin_0.16s_ease]">
            {skeletons.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-[12px] py-[13px] border-b border-[var(--surface-border)]">
                <div className="w-[30px] h-[33px] bg-[var(--surface-subtle)] rounded-[6px]"></div>
                <div className="flex-1">
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="h-[9px] rounded-full bg-[var(--surface-subtle)] w-[44%] mt-[8px]"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="p-[70px_30px] flex flex-col items-center text-center animate-[tfin_0.16s_ease]">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] text-[var(--text-muted)]">◇</div>
            <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px] mt-[20px]">Where to join a league</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[270px]">Join a league to begin. You can be in up to twenty at once.</div>
            <div className="w-full max-w-[280px] mt-[22px]">
              <div className="h-[50px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] cursor-pointer">Create a league</div>
              <div className="h-[50px] rounded-[13px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[13.5px] mt-[10px] cursor-pointer">Join with a code</div>
            </div>
          </div>
        )}

        {isReady && (
          <div className="animate-[tfin_0.16s_ease]">
            {atCapacity && (
              <div className="m-[14px_var(--gutter)_0] p-[13px_15px] rounded-[12px] bg-[var(--warn-surface)] border border-[var(--color-warning)]">
                <div className="font-heading font-semibold text-[12.5px] text-[var(--warn-text)]">All twenty places are used</div>
                <div className="text-[11.5px] leading-[1.5] text-[var(--warn-text)] mt-[4px] opacity-90">Complete or leave a league to free one. Finished leagues do not count — only the twenty still running.</div>
              </div>
            )}
            {groups.map((g: any, i: number) => (
              <section key={i} className="mt-[18px]">
                <div className="flex items-baseline gap-[8px] p-[0_var(--gutter)_9px]">
                  <span className="font-heading font-bold text-[9.5px] leading-[1] tracking-[0.13em] uppercase text-[var(--text-muted)]">{g.label}</span>
                  <span className="font-heading font-bold text-[9.5px] text-[var(--text-muted)] font-tabular-nums">{g.count}</span>
                </div>
                {g.rows.map((r: any, j: number) => (
                  <Link href={`/leagues/1`} key={j} className={`tf-tap flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${r.isLast ? 'border-b' : ''}`} style={{ opacity: r.muted ? 0.62 : 1 }}>
                    <span className="tf-crest w-[30px] h-[33px]" style={{ background: r.crestBg }}>{r.crest}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[7px]">
                        <span className="font-heading font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</span>
                        {r.role && <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_6px] rounded-[4px] bg-[var(--surface-subtle)] text-[var(--text-muted)] flex-none uppercase">{r.role}</span>}
                      </div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{r.meta}</div>
                    </div>
                    <div className="text-right flex-none">
                      <div className={`font-heading font-bold font-tabular-nums ${r.action ? 'text-[11.5px] text-[var(--text-link)]' : 'text-[15px] text-[var(--text-primary)]'}`}>{r.value}</div>
                      {r.sub && <div className={`font-tabular-nums text-[10px] mt-[3px] ${r.action ? 'text-[var(--text-link)]' : 'text-[var(--text-muted)]'}`}>{r.sub}</div>}
                    </div>
                  </Link>
                ))}
              </section>
            ))}
            <div className="p-[18px_var(--gutter)_26px] text-[11px] leading-[1.55] text-[var(--text-muted)]">
              Completed and cancelled leagues stay readable forever and never count towards the twenty. Only leagues still running use a place.
            </div>
          </div>
        )}
      </main>

      <nav className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] grid grid-cols-4 p-[7px_7px_8px] min-h-[66px]">
        {tabs.map((t: any, i: number) => {
          const RenderIcon = IconMap[t.ic];
          return (
            <Link href={t.label === 'HOME' ? '/' : `/${t.label.toLowerCase()}`} key={i} className="relative flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-[1]" style={{ color: t.on ? 'var(--color-brand)' : 'var(--text-muted)' }}>
              <div className="w-[19px] h-[19px] grid place-items-center"><RenderIcon /></div>
              <span className="mt-[6px] tracking-[0.01em]">{t.label}</span>
              {t.badge && <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[8px]">{t.badge}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
