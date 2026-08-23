'use client';

import Link from 'next/link';

export function LeagueRulesMobile({
  theme, params, isLoading, isTerminal, isReady, isRules, isOwner,
  ds, IconMap, TERM, headTitle, headSub, frozenText, showMaxPoints,
  showDanger, sections, dangerLines, footNote, retry, dataState
}: any) {

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[10px_var(--gutter)_18px] flex-none">
        <div className="flex items-center gap-[11px]">
          <Link href={`/leagues/${params.id}/more`} className="tf-tap w-[44px] h-[44px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)]">
            {IconMap.back(18)}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[18px] leading-[1.1] tracking-[-0.3px]">{headTitle}</div>
            <div className="font-heading font-medium text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
          </div>
        </div>

        {showMaxPoints && (
          <div className="flex items-end gap-[12px] mt-[18px]">
            <div className="tf-num font-heading font-bold text-[44px] leading-[0.9] tracking-[-1.8px]">40</div>
            <div className="pb-[5px] min-w-0">
              <div className="font-heading font-semibold text-[11.5px]">points from one match, at most</div>
              <div className="text-[10.5px] leading-[1.45] text-[var(--nav-text-faint)] mt-[3px]">22 of them are the two lineups</div>
            </div>
          </div>
        )}

        {isReady && (
          <div className="mt-[16px] p-[12px_13px] rounded-[11px] bg-[rgba(255,255,255,0.08)] border border-[var(--nav-border)] flex items-start gap-[10px]">
            <span className="text-[var(--nav-accent)] flex-none mt-[1px]">{IconMap.lock(16)}</span>
            <span className="font-heading font-medium text-[11.5px] leading-[1.5] text-[var(--nav-text-quiet)]">{frozenText}</span>
          </div>
        )}
      </header>

      <main className="tf-scroll flex-1 overflow-auto pb-[26px]">
        {isLoading && (
          <div className="p-[22px_var(--gutter)] flex flex-col gap-[26px]">
            {[{ w: "72%" }, { w: "58%" }, { w: "66%" }, { w: "49%" }, { w: "70%" }].map((s, i) => (
              <div key={i} className="flex flex-col gap-[9px]">
                <div className="h-[9px] w-[32%] rounded-[4px] bg-[var(--surface-subtle)]"></div>
                <div className="h-[12px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                <div className="h-[9px] w-[56%] rounded-[4px] bg-[var(--surface-subtle)]"></div>
              </div>
            ))}
          </div>
        )}

        {isTerminal && (
          <div className="p-[56px_30px] flex flex-col items-center text-center">
            <div style={{ color: TERM[1] as string }}>{IconMap[TERM[0]](34)}</div>
            <div className="font-heading font-bold text-[21px] leading-[1.15] tracking-[-0.4px] mt-[22px]">{TERM[2]}</div>
            <div className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[11px] max-w-[284px]">{TERM[3]}</div>
            <div onClick={retry} className="tf-tap mt-[24px] min-h-[47px] px-[22px] border border-[var(--surface-border-strong)] rounded-[13px] bg-[var(--surface-card)] text-[var(--text-primary)] font-heading font-bold text-[12.5px] flex items-center cursor-pointer">{TERM[4]}</div>
          </div>
        )}

        {isReady && (
          <div>
            {sections.map((sec: any, i: number) => (
              <div key={i}>
                <div className="p-[20px_var(--gutter)_8px] font-heading font-bold text-[10px] leading-[1] tracking-[0.12em] uppercase text-[var(--text-muted)]">{sec.label}</div>
                {sec.hasIntro && (
                  <div className="p-[0_var(--gutter)_10px] text-[11.5px] leading-[1.55] text-[var(--text-muted)]">{sec.intro}</div>
                )}
                <div className="border-y border-[var(--surface-border)]">
                  {sec.lines.map((l: any, j: number) => (
                    <div key={j} className={l.cls}>
                      {l.locked && <span className="w-[15px] h-[15px] flex-none text-[var(--text-muted)]">{IconMap.lock(15)}</span>}
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13px] leading-[1.25]" style={{ color: l.titleColor }}>{l.title}</div>
                        {l.hasNote && <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[4px]">{l.note}</div>}
                      </div>
                      <span className={`font-heading font-semibold text-[12.5px] leading-[1.3] text-[var(--text-secondary)] text-right flex-none max-w-[150px] ${l.valStyle}`}>{l.value}</span>
                      {l.chevron && <span className="text-[var(--text-muted)] font-heading font-semibold text-[15px] flex-none">›</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {showMaxPoints && (
              <div className="p-[20px_var(--gutter)_0] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
                The forty above is 2 result + 5 score + 1 both teams + 1 total goals + 5 scorer + 4 card + 22 lineup. One point per correct starter across both elevens, which is why the lineups carry more than half of every match.
              </div>
            )}

            {showDanger && (
              <div>
                <div className="p-[20px_var(--gutter)_8px] font-heading font-bold text-[10px] leading-[1] tracking-[0.12em] uppercase text-[var(--danger-text)]">Ending the league</div>
                <div className="border-y border-[var(--surface-border)]">
                  {dangerLines.map((d: any, i: number) => (
                    <div key={i} className="tf-tap flex items-center gap-[12px] p-[16px_var(--gutter)] border-b border-[var(--surface-border)] last:border-b-0 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13px] leading-[1.25] text-[var(--danger-text)]">{d.title}</div>
                        <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[4px]">{d.note}</div>
                      </div>
                      <span className="text-[var(--text-muted)] font-heading font-semibold text-[15px] flex-none">›</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-[18px_var(--gutter)_8px] text-[11px] leading-[1.6] text-[var(--text-muted)] text-center">{footNote}</div>
          </div>
        )}
      </main>
    </div>
  );
}
