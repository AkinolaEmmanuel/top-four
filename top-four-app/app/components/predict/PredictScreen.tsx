import Link from 'next/link';
import { MobileNav } from '../MobileNav';
import { toPredictGroups, ALL_LEAGUES, type PredictEntry } from '@/lib/predict/predict-queue';

/**
 * The to-do list — one component for both platforms.
 *
 * A Client Component only for the league filter. The filter now applies to what
 * is drawn on both layouts; before this it was wired into the desktop grouping
 * alone, so the chips on a phone changed nothing.
 */

const CLUB_TINTS: Record<string, string> = {
  ARS: '#c8182f', CHE: '#1746a2', LIV: '#b7152b', TOT: '#17233d',
  MCI: '#559ac7', EVE: '#153c85', MUN: '#d1262f', NEW: '#20242a',
};
const tintFor = (code: string) => CLUB_TINTS[code] || '#4b5563';


function Marks({ entry }: { entry: PredictEntry }) {
  if (entry.kind === 'custom_question') {
    return (
      <span className="w-[26px] h-[59px] md:w-[34px] md:h-[36px] rounded-[7px] md:rounded-[9px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[14px] md:text-[15px] text-[var(--text-muted)] flex-none">
        ?
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-[3px] flex-none w-[26px] md:w-[30px]">
      <span className="tf-crest w-full h-[28px] md:h-[30px] text-[8px]" style={{ background: tintFor(entry.homeCode ?? '') }}>{entry.homeCode}</span>
      <span className="tf-crest w-full h-[28px] md:h-[30px] text-[8px]" style={{ background: tintFor(entry.awayCode ?? '') }}>{entry.awayCode}</span>
    </div>
  );
}

function TaskRow({ entry, isLast }: { entry: PredictEntry; isLast: boolean }) {
  return (
    <Link
      href={entry.href}
      className={`flex items-center gap-[13px] p-[13px_var(--gutter)] md:px-[14px] md:rounded-[10px] border-t border-[var(--surface-border)] md:border-t-0 md:border-b md:border-[var(--surface-border)] ${isLast ? 'border-b md:border-b-0' : ''} ${entry.urgent ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)] md:shadow-none' : ''} md:hover:bg-[var(--surface-subtle)] md:transition-colors`}
    >
      <Marks entry={entry} />
      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[13px] md:text-[14px] truncate">{entry.title}</div>
        <div className="text-[10.5px] md:text-[11.5px] text-[var(--text-muted)] mt-[3px] truncate">{entry.leagueName}</div>
      </div>
      <div className="text-right flex-none">
        <div className={`font-heading font-bold text-[13px] tf-num ${entry.urgent ? 'text-[var(--danger-text)]' : 'text-[var(--text-primary)]'}`}>
          {entry.deadlineAt ? new Date(entry.deadlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
        </div>
        <div className="text-[10px] text-[var(--text-link)] mt-[3px] font-bold tf-num">{entry.openLabel}</div>
      </div>
    </Link>
  );
}

export function PredictScreen({
  entries, leagues, league, totalEntries, openMarkets, summary, hasLeagues, showMoreHref,
}: {
  /** The selected league's entries, already windowed. */
  entries: PredictEntry[];
  /** Every league with open work, for the filter row. */
  leagues: { id: string; name: string }[];
  /** The selected filter — the sentinel when unfiltered. */
  league: string;
  /** Everything open in the current filter, which is what the counts say. */
  totalEntries: number;
  openMarkets: number;
  summary: string;
  hasLeagues: boolean;
  /** Null once the window covers the whole filter. */
  showMoreHref: string | null;
}) {
  const groups = toPredictGroups(entries);

  if (!hasLeagues || totalEntries === 0) {
    const noLeagues = !hasLeagues;
    return (
      <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
        <div className="flex-1 grid place-items-center p-[var(--gutter)]">
          <div className="flex flex-col items-center text-center max-w-[400px]">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] text-[var(--text-muted)]">
              {noLeagues ? '◇' : '✓'}
            </div>
            <h1 className="font-heading font-bold text-[21px] md:text-[24px] leading-[1.2] tracking-[-0.5px] mt-[20px]">
              {noLeagues ? 'No predictions to make' : 'Nothing needs you'}
            </h1>
            <p className="text-[13px] md:text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">
              {noLeagues
                ? 'Join a league first to start predicting.'
                : "Every market in every league is answered. We'll badge this tab the moment something opens."}
            </p>
            <Link
              href={noLeagues ? '/leagues/join' : '/leagues'}
              className="mt-[22px] h-[48px] px-[24px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]"
            >
              {noLeagues ? 'Join a league' : 'View your leagues'}
            </Link>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[26px]">
          <span className="tf-kicker text-[var(--nav-accent)]">OPEN ACROSS EVERY LEAGUE</span>
          <div className="flex items-end gap-[10px] mt-[9px]">
            <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]">{openMarkets}</span>
            <span className="text-[12px] text-[var(--nav-text-faint)] pb-[6px]">markets still unanswered</span>
          </div>
          <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[8px]">{summary}</div>
        </div>
      </header>

      <main className="tf-scroll flex-1 overflow-auto">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[22px]">

          {leagues.length > 1 && (
            <div className="tf-scroll flex gap-[6px] p-[12px_var(--gutter)] md:px-0 md:mb-[18px] overflow-x-auto border-b border-[var(--surface-border)] md:border-b-0">
              {[{ id: ALL_LEAGUES, name: 'All' }, ...leagues].map(option => {
                const on = league === option.id;
                return (
                  <Link
                    key={option.id}
                    href={option.id === ALL_LEAGUES ? '/predict' : `/predict?league=${option.id}`}
                    aria-current={on ? 'page' : undefined}
                    scroll={false}
                    className="tf-tap flex items-center h-[32px] px-[13px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px]"
                    style={on
                      ? { background: 'var(--color-brand)', color: 'var(--color-on-brand)' }
                      : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                  >
                    {option.name}
                  </Link>
                );
              })}
            </div>
          )}

          {groups.length === 0 ? (
            <p className="p-[30px_var(--gutter)] md:px-0 text-[12.5px] text-[var(--text-secondary)]">
              Nothing open in that league.
            </p>
          ) : (
            groups.map(group => (
              <section key={group.key} className="mt-[18px] first:mt-0 md:mt-[26px] md:first:mt-0">
                <div className="flex items-baseline gap-[8px] p-[0_var(--gutter)_9px] md:px-0 md:pb-[10px] md:border-b md:border-[var(--surface-border-strong)]">
                  <span className="tf-kicker text-[var(--text-muted)] md:text-[13px] md:tracking-[-0.1px] md:normal-case md:font-bold md:text-[var(--text-primary)]">{group.label}</span>
                  <span className="text-[10px] md:text-[11.5px] text-[var(--text-muted)]">{group.note}</span>
                  <span className="ml-auto tf-num font-heading font-bold text-[9.5px] md:text-[11.5px] text-[var(--text-muted)]">{group.entries.length}</span>
                </div>
                {group.entries.map((entry, i, all) => (
                  <TaskRow key={`${entry.kind}-${entry.id}`} entry={entry} isLast={i === all.length - 1} />
                ))}
              </section>
            ))
          )}

          {showMoreHref && (
            <div className="px-[var(--gutter)] md:px-0 pt-[18px]">
              <Link
                href={showMoreHref}
                scroll={false}
                className="tf-tap flex items-center justify-center h-[44px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px] text-[var(--text-secondary)]"
              >
                Show more
                <span className="ml-[7px] tf-num opacity-60">{entries.length} of {totalEntries}</span>
              </Link>
            </div>
          )}

          <div className="h-[26px]" />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
