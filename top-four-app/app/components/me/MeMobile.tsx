'use client';

import Link from 'next/link';

export function MeMobile({
  theme, isLoading, prefs, setPrefs, chart, leagues, groups, IconMap, tabs, ...props
}: any) {
  const isReady = !isLoading;

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] flex-none">
        <div className="flex items-center gap-[13px]">
          <div className="w-[46px] h-[46px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[15px] flex-none">
            {props.user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[18px] leading-[1.1] tracking-[-0.3px]">{props.user?.displayName || 'User'}</div>
            <div className="text-[11px] text-[var(--nav-text-faint)] mt-[4px] whitespace-nowrap overflow-hidden text-ellipsis">{props.user?.email || 'user@example.com'}</div>
          </div>
        </div>

        <div className="flex items-end gap-[12px] mt-[20px]">
          <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px]">2,272</div>
          <div className="pb-[4px]">
            <div className="font-heading font-semibold text-[12.5px]">points in total</div>
            <div className="text-[11px] text-[var(--nav-text-faint)] mt-[3px]">across eight leagues · 61% of markets correct</div>
          </div>
        </div>
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {isLoading && (
          <div className="p-[16px_var(--gutter)]">
            <div className="h-[130px] rounded-[14px] bg-[var(--surface-subtle)]"></div>
            {[{w: "58%"}, {w: "70%"}, {w: "46%"}, {w: "64%"}].map((s, i) => (
              <div key={i} className="flex items-center gap-[12px] py-[15px] border-b border-[var(--surface-border)]">
                <div className="w-[32px] h-[32px] rounded-[9px] bg-[var(--surface-subtle)]"></div>
                <div className="flex-1"><div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div></div>
              </div>
            ))}
          </div>
        )}

        {isReady && (
          <div>
            <section className="p-[18px_var(--gutter)_0]">
              <div className="flex items-baseline justify-between">
                <span className="tf-kicker text-[var(--text-muted)]">POINTS BY ROUND</span>
                <span className="text-[11px] text-[var(--text-muted)]">Last 10</span>
              </div>
              <div className="flex items-end gap-[5px] h-[96px] mt-[14px]">
                {chart.map((c: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-[6px] min-w-0">
                    <div className={c.barStyle} style={{ height: `${c.height}px` }}></div>
                    <span className="text-[9px] text-[var(--text-muted)]">{c.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[10px]">Round 7 is amber because a correction reversed a goalscorer award after it settled. Corrections are applied in place, so this always matches the tables.</div>
            </section>

            <section className="mt-[20px]">
              <div className="p-[0_var(--gutter)_9px]"><span className="tf-kicker text-[var(--text-muted)]">WHERE THEY CAME FROM</span></div>
              {leagues.map((l: any, i: number) => (
                <div key={i} className={`tf-tap flex items-center gap-[12px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] ${l.isLast ? 'border-b' : ''}`}>
                  <span className="tf-crest w-[28px] h-[31px]" style={{ background: l.bg }}>{l.crest}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{l.name}</div>
                    <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{l.meta}</div>
                  </div>
                  <span className="tf-num font-heading font-bold text-[14px] flex-none">{l.points}</span>
                </div>
              ))}
            </section>

            {groups.map((g: any, i: number) => (
              <section key={i} className="mt-[20px]">
                <div className="p-[0_var(--gutter)_9px]"><span className="tf-kicker" style={{ color: g.labelColor }}>{g.label}</span></div>
                {g.rows.map((r: any, j: number) => {
                  const content = (
                    <div className={`p-[14px_var(--gutter)] flex items-center justify-between ${r.isLast ? '' : 'border-b border-[var(--surface-border)]'} ${r.action || r.href ? 'cursor-pointer tf-tap' : ''}`}>
                    <div className="flex-1 pr-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="font-heading font-semibold text-[13px]" style={{ color: r.titleColor }}>{r.title}</span>
                        {r.badge && (
                          <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] flex-none bg-[var(--warn-surface)] text-[var(--warn-text)]">{r.badge}</span>
                        )}
                      </div>
                      <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{r.note}</div>
                    </div>
                    {r.hasSwitch ? (
                      <div
                        onClick={() => {
                          if (!r.locked && r.toggleId) {
                            setPrefs((s: any) => ({ ...s, [r.toggleId]: !s[r.toggleId] }));
                          }
                        }}
                        className={`w-[38px] h-[23px] rounded-full flex-none p-[2px] flex ${!r.locked ? 'cursor-pointer' : 'opacity-55 cursor-default'} transition-colors ${r.on ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}
                      >
                        <div className="w-[19px] h-[19px] rounded-full bg-[var(--surface-card)]"></div>
                      </div>
                    ) : (
                      <span className="font-['DM_Sans',sans-serif] text-[17px] text-[var(--text-muted)] flex-none">›</span>
                    )}
                  </div>
                  );
                  return r.href ? (
                    <Link key={j} href={r.href} className="block">{content}</Link>
                  ) : (
                    <div key={j} onClick={r.action} className={r.action ? 'cursor-pointer' : ''}>{content}</div>
                  );
                })}
              </section>
            ))}

            <div className="p-[18px_var(--gutter)_26px] text-[11px] leading-[1.55] text-[var(--text-muted)]">Points here are the sum of every league you play in. A league that is cancelled removes its points from this total, because nothing in it counted.</div>
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
              {t.badge && (
                <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[8px]">{t.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
