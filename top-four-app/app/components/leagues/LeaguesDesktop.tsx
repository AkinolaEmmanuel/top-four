'use client';

import Link from 'next/link';

export function LeaguesDesktop({
  theme, state, filter, filters, groups, isLoading, isEmpty, isReady,
  atCapacity, capacityLabel, skeletons, rootNav, user
}: any) {
  return (
    <div className={`hidden md:flex flex-col flex-1 h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>


      {/* Hero bar */}
      <div className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] border-b border-[rgba(255,255,255,.1)] py-[18px]">
        <div className="max-w-[1080px] mx-auto px-[24px] flex items-center gap-[26px]">
          <div className="flex-1 min-w-0">
            <div className="font-heading font-bold text-[22px] leading-[1] tracking-[-0.5px]">Leagues</div>
            <div className="text-[12px] mt-[5px]" style={{ color: atCapacity ? 'var(--nav-accent)' : 'var(--nav-text-faint)' }}>{capacityLabel}</div>
          </div>
          {atCapacity && (
            <div className="p-[10px_15px] rounded-[11px] bg-[rgba(252,211,77,0.12)] border border-[rgba(252,211,77,0.3)] max-w-[380px]">
              <div className="font-heading font-semibold text-[12px] text-[var(--nav-warning)]">All twenty places are used</div>
              <div className="text-[11px] leading-[1.5] text-[rgba(252,211,77,0.75)] mt-[3px]">Complete or leave a league to make room.</div>
            </div>
          )}
          <div className="flex gap-[8px] flex-none">
            <Link href="/leagues/join" className="h-[40px] px-[18px] rounded-[11px] border border-[var(--nav-border)] flex items-center font-heading font-semibold text-[12.5px] gap-[7px] cursor-pointer hover:bg-[var(--nav-fill)] transition-colors">Join a league</Link>
            <Link href="/leagues/setup" className={`h-[40px] px-[18px] rounded-[11px] flex items-center font-heading font-bold text-[12.5px] gap-[7px] ${atCapacity ? 'bg-[var(--nav-fill)] opacity-40 cursor-not-allowed pointer-events-none' : 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)] cursor-pointer'}`}>+ Create a league</Link>
          </div>
        </div>
      </div>

      <div className="tf-scroll flex-1 overflow-y-auto">
        <div className="max-w-[1080px] mx-auto px-[24px] py-[22px] pb-[30px]">

          {/* Filters */}
          {isReady && (
            <div className="flex items-center gap-[6px] mb-[20px]">
              {filters.map((f: any, i: number) => (
                <div key={i} onClick={f.pick} className="flex items-center h-[33px] px-[13px] rounded-full cursor-pointer whitespace-nowrap font-heading font-semibold text-[12px]" style={f.on ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' } : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}>
                  {f.label}
                  <span className="ml-[7px] font-tabular-nums" style={{ opacity: f.on ? 0.7 : 0.55 }}>{f.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="border-t border-[var(--surface-border)]">
              {skeletons.map((s: any, i: number) => (
                <div key={i} className="grid gap-[14px] items-center p-[15px_0] border-b border-[var(--surface-border)]" style={{ gridTemplateColumns: '34px minmax(0,1fr) 110px 80px' }}>
                  <div className="w-[30px] h-[33px] rounded-[6px] bg-[var(--surface-subtle)] animate-pulse"></div>
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)] animate-pulse" style={{ width: s.w }}></div>
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)] animate-pulse"></div>
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)] animate-pulse"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {isEmpty && (
            <div className="flex flex-col items-center text-center pt-[100px] pb-[60px]">
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] text-[var(--text-muted)]">◇</div>
              <div className="font-heading font-bold text-[24px] leading-[1.2] tracking-[-0.6px] mt-[22px]">Where to join a league</div>
              <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[380px]">Join a league to begin. You can be in up to twenty at once.</div>
              <div className="flex gap-[10px] mt-[24px]">
                <Link href="/leagues/setup" className="h-[46px] px-[22px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13px] cursor-pointer">Create a league</Link>
                <Link href="/leagues/join" className="h-[46px] px-[22px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[13px] cursor-pointer">Join with a code</Link>
              </div>
            </div>
          )}

          {/* League groups — desktop table layout */}
          {isReady && groups.map((g: any, gi: number) => (
            <section key={gi} className={gi > 0 ? 'mt-[32px]' : ''}>
              <div className="flex items-baseline gap-[10px] pb-[10px] border-b border-[var(--surface-border-strong)]">
                <span className="font-heading font-bold text-[13px] tracking-[-0.1px]">{g.label}</span>
                <span className="text-[11.5px] text-[var(--text-muted)]">{g.count} league{parseInt(g.count) !== 1 ? 's' : ''}</span>
              </div>

              {/* Column headers */}
              <div className="grid gap-[14px] items-center p-[10px_16px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]" style={{ gridTemplateColumns: '34px minmax(0,1fr) 140px 90px 80px' }}>
                <span></span>
                <span className="tf-kicker">League</span>
                <span className="tf-kicker">Status</span>
                <span className="tf-kicker text-right">Standing</span>
                <span className="tf-kicker text-right">Points</span>
              </div>

              {g.rows.map((r: any, j: number) => (
                <Link href={`/leagues/${r.id}`} key={j} className="grid gap-[14px] items-center p-[13px_16px] border-b border-[var(--surface-border)] cursor-pointer hover:bg-[var(--surface-subtle)] transition-colors" style={{ gridTemplateColumns: '34px minmax(0,1fr) 140px 90px 80px', opacity: r.muted ? 0.62 : 1 }}>
                  <span className="tf-crest w-[30px] h-[33px] text-[9px]" style={{ background: r.crestBg }}>{r.crest}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <span className="font-heading font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</span>
                      {r.role && <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_6px] rounded-[4px] bg-[var(--surface-subtle)] text-[var(--text-muted)] flex-none uppercase">{r.role}</span>}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{r.meta}</div>
                  </div>
                  <div>
                    {r.action ? (
                      <span className="font-heading font-bold text-[12px] text-[var(--text-link)]">{r.value} {r.sub}</span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">{r.meta}</span>
                    )}
                  </div>
                  <div className="text-right">
                    {!r.action && !r.muted && <span className="tf-num font-heading font-bold text-[15px]">{r.value}</span>}
                    {r.muted && <span className="text-[13px] text-[var(--text-muted)]">{r.value}</span>}
                    {r.action && <span className="text-[12px] text-[var(--text-link)]">{r.value}</span>}
                  </div>
                  <div className="text-right">
                    {r.sub && !r.action && <span className="text-[12px] text-[var(--text-muted)]">{r.sub}</span>}
                  </div>
                </Link>
              ))}
            </section>
          ))}

          {isReady && (
            <div className="mt-[20px] text-[11px] leading-[1.55] text-[var(--text-muted)]">
              Completed and cancelled leagues stay readable forever and never count towards the twenty. Only leagues still running use a place.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
