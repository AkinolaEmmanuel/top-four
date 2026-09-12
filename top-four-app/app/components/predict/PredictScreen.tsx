import Image from 'next/image';
import Link from 'next/link';
import { tintFor } from '@/lib/crest';
import { timeUntilLabel } from '@/lib/format';
import { MobileNav } from '../MobileNav';
import { toPredictGroups, ALL_LEAGUES, type PredictEntry } from '@/lib/predict/predict-queue';
import { pluralise } from '@/lib/format';

/**
 * The to-do list — one component for both platforms.
 *
 * A Client Component only for the league filter. The filter now applies to what
 * is drawn on both layouts; before this it was wired into the desktop grouping
 * alone, so the chips on a phone changed nothing.
 */



function Mark({ code, logo }: { code: string | null; logo: string | null }) {
  if (logo) {
    return (
      <span className="relative w-full h-[28px] md:h-[30px]">
        <Image src={logo} alt={code ?? ''} fill sizes="30px" className="object-contain" />
      </span>
    );
  }
  return (
    <span className="tf-crest w-full h-[28px] md:h-[30px] text-[8px]" style={{ background: tintFor(code ?? '') }}>{code}</span>
  );
}

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
      <Mark code={entry.homeCode} logo={entry.homeLogo} />
      <Mark code={entry.awayCode} logo={entry.awayLogo} />
    </div>
  );
}

function TaskRow({ entry, isLast, nowMs }: { entry: PredictEntry; isLast: boolean; nowMs: number }) {
  /* Time remaining, not a clock. A bare "15:30" in a queue reads as kick-off —
     the same defect as the Home hero once had. The helper falls back to a day
     and time past twenty-four hours, which is the design's own behaviour. */
  const deadline = timeUntilLabel(entry.deadlineAt, nowMs);

  /* One row, not two. This used to render a phone layout and a wide layout and
     hide one of them, which put half of this screen's markup — 322KB of it —
     into the document for a width the reader is not on. The columns the width
     earns appear with `md:`; nothing is duplicated to get them. */
  return (
    <Link
      href={entry.href}
      className={`flex items-center gap-[13px] md:gap-[16px] p-[13px_var(--gutter)] md:px-[18px] md:py-[15px] border-t border-[var(--surface-border)] ${isLast ? 'border-b md:border-b' : ''} ${entry.urgent ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''} md:hover:bg-[var(--surface-subtle)] md:transition-colors`}
    >
      <Marks entry={entry} />

      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[13px] md:text-[14px] truncate">{entry.title}</div>
        <div className="text-[10.5px] md:text-[11.5px] text-[var(--text-muted)] mt-[3px] truncate">{entry.leagueName}</div>
      </div>

      <span className="hidden md:block w-[176px] flex-none text-[11.5px] text-[var(--text-secondary)]">
        {entry.openLabel} still open
      </span>

      <div className="text-right flex-none md:w-[96px]">
        <div className={`font-heading font-bold text-[13px] tf-num ${entry.urgent ? 'text-[var(--danger-text)]' : 'text-[var(--text-primary)]'}`}>
          {deadline}
        </div>
        <div className="md:hidden text-[10px] text-[var(--text-link)] mt-[3px] font-bold tf-num">{entry.openLabel}</div>
      </div>

      <span className="hidden md:grid w-[66px] h-[31px] flex-none rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] place-items-center font-heading font-bold text-[11px]">
        Answer
      </span>
    </Link>
  );
}

export function PredictScreen({
  entries, leagues, league, totalEntries, horizon, openMarkets, laterMarkets, summary,
  hasLeagues, showMoreHref,
}: {
  /** The selected league's entries, already windowed. */
  entries: PredictEntry[];
  /** Every league with open work, for the filter row. */
  leagues: { id: string; name: string }[];
  /** The selected filter — the sentinel when unfiltered. */
  league: string;
  /** Everything open in the current filter, which is what the counts say. */
  totalEntries: number;
  /** Which slice `openMarkets` counts: the week's work, or — when the week has
   *  none — everything, so the headline is never a misleading zero. */
  horizon: 'week' | 'all';
  openMarkets: number;
  /** Markets past the horizon. Zero when the headline already counts them. */
  laterMarkets: number;
  summary: string;
  hasLeagues: boolean;
  /** Null once the window covers the whole filter. */
  showMoreHref: string | null;
}) {
  // One clock for the whole queue, so the rows cannot drift apart.
  const nowMs = Date.now();
  const groups = toPredictGroups(entries);

  if (!hasLeagues || totalEntries === 0) {
    const noLeagues = !hasLeagues;
    return (
      <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
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
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[26px]">
          <span className="tf-kicker text-[var(--nav-accent)]">
            {horizon === 'week' ? 'OPEN THIS WEEK' : 'OPEN ACROSS EVERY LEAGUE'}
          </span>
          <div className="flex items-end gap-[10px] mt-[9px]">
            <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]">{openMarkets}</span>
            <span className="text-[12px] text-[var(--nav-text-faint)] pb-[6px]">
              {horizon === 'week' ? 'markets to answer' : 'markets still unanswered'}
            </span>
          </div>
          <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[8px]">
            {summary}
            {laterMarkets > 0 && ` · ${pluralise(laterMarkets, 'market')} open after that`}
          </div>
        </div>
      </header>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto">
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
                  <TaskRow key={`${entry.kind}-${entry.id}`} entry={entry} nowMs={nowMs} isLast={i === all.length - 1} />
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
