'use client';

import Link from 'next/link';
import { MobileNav } from '../MobileNav';

export function PredictMobile({ state, theme, ...props }: any) {
  const st = state;
  const isLoading = st === "loading", isClear = st === "empty", isError = st === "error", isNoLeagues = st === "noLeagues";
  const isReady = !isLoading && !isClear && !isError && !isNoLeagues;

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] flex-none">
        <div className="font-heading font-[650] text-[24px] leading-[1] tracking-[-0.8px]">Predict</div>
        <div className="flex items-end gap-[12px] mt-[14px]">
          <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px]" style={{ color: props.totalColor }}>{props.total}</div>
          <div className="pb-[4px]">
            <div className="font-heading font-semibold text-[12.5px]">{props.totalLabel}</div>
            <div className="text-[11px] text-[var(--nav-text-faint)] mt-[3px]">{props.totalSub}</div>
          </div>
        </div>
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {isLoading && (
          <div className="p-[14px_var(--gutter)]">
            {[{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }].map((s, i) => (
              <div key={i} className="flex items-center gap-[12px] py-[14px] border-b border-[var(--surface-border)]">
                <div className="w-[26px] h-[56px] bg-[var(--surface-subtle)] rounded-[6px]"></div>
                <div className="flex-1">
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="h-[9px] rounded-full bg-[var(--surface-subtle)] w-[40%] mt-[8px]"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isClear && (
          <div className="p-[74px_30px] flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-full bg-[var(--success-surface)] grid place-items-center text-[22px] text-[var(--success-text)]">✓</div>
            <div className="font-heading font-bold text-[22px] leading-[1.2] tracking-[-0.5px] mt-[20px]"> No Predictions to make</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[270px]">You currently have competitions or games to predict.</div>
          </div>
        )}

        {isNoLeagues && (
          <div className="p-[74px_30px] flex flex-col items-center text-center">
            <div style={{ color: props.termIconColor }}>{props.termIcon}</div>
            <div className="font-heading font-bold text-[22px] leading-[1.2] tracking-[-0.5px] mt-[20px]">{props.termTitle}</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[270px]">{props.termBody}</div>
            <div onClick={props.retry} style={props.termActionStyle}>{props.termAction}</div>
          </div>
        )}

        {isError && (
          <div className="p-[74px_30px] flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-full bg-[var(--warn-surface)] grid place-items-center text-[22px] text-[var(--warn-text)]">!</div>
            <div className="font-heading font-bold text-[22px] leading-[1.2] tracking-[-0.5px] mt-[20px]">This list didn't load</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[280px]">Check your connection and try again. Deadlines run on our clock, not yours — nothing locked while you couldn't see it.</div>
            <div onClick={props.retry} className="mt-[22px] px-[22px] h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12px] cursor-pointer">TRY AGAIN</div>
          </div>
        )}

        {isReady && (
          <div>
            {props.groups.map((g: any, i: number) => (
              <section key={i} className="mt-[18px]">
                <div className="flex items-baseline gap-[9px] p-[0_var(--gutter)_9px]">
                  <span className="tf-kicker" style={{ color: g.labelColor }}>{g.label}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{g.note}</span>
                </div>

                {g.rows.map((r: any, j: number) => (
                  <Link href={r.href || `/predict/fixture/${r.homeCode || 'unknown'}`} key={j} className={`tf-tap ${r.rowStyle}`}>
                    <div className={r.markWrapStyle}>
                      <span className={`tf-crest ${r.homeStyle}`} style={{ background: r.homeBg }}>{r.homeCode}</span>
                      <span className={`tf-crest ${r.awayStyle}`} style={{ background: r.awayBg }}>{r.awayCode}</span>
                      <span className={r.questionStyle}>?</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{r.title}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[4px] whitespace-nowrap overflow-hidden text-ellipsis">{r.meta}</div>
                    </div>
                    <div className="text-right flex-none">
                      <div className={`tf-num ${r.timeStyle}`}>{r.time}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">{r.missing}</div>
                    </div>
                  </Link>
                ))}
              </section>
            ))}

            <div className="p-[18px_var(--gutter)_26px] text-[11px] leading-[1.55] text-[var(--text-muted)]">Lineups leave this list two hours before kick-off rather than at kick-off, because that is when they lock. Anything still here at its deadline scores nothing.</div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
