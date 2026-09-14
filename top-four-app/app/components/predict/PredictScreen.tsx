import Image from 'next/image';
import Link from 'next/link';
import { tintFor } from '@/lib/crest';
import { timeUntilLabel } from '@/lib/format';
import { MobileNav } from '../MobileNav';
import {
  toPredictGroups, ALL_LEAGUES,
  type PredictEntry, type PredictEntryLeague,
} from '@/lib/predict/predict-queue';

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

/**
 * One league the match is outstanding in, carrying that league's own progress.
 *
 * The progress is on the chip rather than behind it because it is the reason
 * the rows were separate: two leagues on one match are rarely equally answered,
 * and a single figure would be true of neither.
 */
function LeagueChip({ league }: { league: PredictEntryLeague }) {
  return (
    <Link
      href={league.href}
      className="inline-flex items-center gap-[6px] max-w-[190px] font-heading font-semibold text-[10px] px-[9px] py-[6px] rounded-[6px] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--text-link)] transition-colors"
    >
      <span className="truncate">{league.name}</span>
      <span className="tf-num flex-none text-[var(--text-muted)]">{league.progressLabel}</span>
    </Link>
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
  /* Shared across leagues, the row cannot be one link: each chip is a link of
     its own, and a link inside a link is neither valid nor reachable by
     keyboard. The title becomes the primary target and takes whichever locks
     first — the same league the Answer button goes to. */
  const shared = entry.leagues.length > 1;
  const rowClass = `flex items-center gap-[13px] md:gap-[16px] p-[13px_var(--gutter)] md:px-[18px] md:py-[15px] border-t border-[var(--surface-border)] ${isLast ? 'border-b md:border-b' : ''} ${entry.urgent ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''} md:hover:bg-[var(--surface-subtle)] md:transition-colors`;

  const body = (
    <>
      <Marks entry={entry} />

      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[13px] md:text-[14px] truncate">
          {shared ? <Link href={entry.href} className="hover:underline">{entry.title}</Link> : entry.title}
        </div>
        {shared ? (
          <div className="flex flex-wrap gap-[5px] mt-[5px]">
            {entry.leagues.map(l => <LeagueChip key={l.id} league={l} />)}
          </div>
        ) : (
          <div className="text-[10.5px] md:text-[11.5px] text-[var(--text-muted)] mt-[3px] truncate">{entry.leagues[0].name}</div>
        )}
      </div>

      {/* Progress, not backlog. The design leads with how far through you are
          because that is the number that moves; "8 markets still open" says the
          same thing about a fixture you have not started and one you have nearly
          finished. A bar only where there is a total to draw one against. */}
      <span className="hidden md:flex w-[176px] flex-none items-center gap-[10px] text-[11.5px] text-[var(--text-secondary)]">
        {entry.progress ? (
          <>
            <span className="tf-num flex-none">{entry.progressLabel}</span>
            <span className="flex-1 h-[4px] rounded-full bg-[var(--surface-border)] overflow-hidden flex">
              {/* Answered, then what is still open. Whatever is left is a market
                  that locked unanswered — it stays the track's own colour, so the
                  bar stops short rather than pretending it can still be filled. */}
              <span
                className="block h-full bg-[var(--color-brand)]"
                style={{ width: `${(entry.progress.answered / entry.progress.required) * 100}%` }}
              />
              <span
                className="block h-full bg-[var(--surface-border-strong)]"
                style={{ width: `${(entry.progress.actionable / entry.progress.required) * 100}%` }}
              />
            </span>
          </>
        ) : (
          <span>{entry.openLabel} still open</span>
        )}
      </span>

      <div className="text-right flex-none md:w-[96px]">
        <div className={`font-heading font-bold text-[13px] tf-num ${entry.urgent ? 'text-[var(--danger-text)]' : 'text-[var(--text-primary)]'}`}>
          {deadline}
        </div>
        <div className="md:hidden text-[10px] text-[var(--text-link)] mt-[3px] font-bold tf-num">{entry.progressLabel}</div>
      </div>

      <span className="hidden md:grid w-[66px] h-[31px] flex-none rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] place-items-center font-heading font-bold text-[11px]">
        Answer
      </span>
    </>
  );

  return shared
    ? <div className={rowClass}>{body}</div>
    : <Link href={entry.href} className={rowClass}>{body}</Link>;
}

export function PredictScreen({
  entries, leagues, league, totalEntries, weeks, summary,
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
  /** How many weeks ahead the server was asked for, which is what the
   *  headline counts and what the kicker names. */
  weeks: number;
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
            {weeks === 1 ? 'OPEN THIS WEEK' : `OPEN IN THE NEXT ${weeks} WEEKS`}
          </span>
          {/* Matches, not markets. The hero counted every unanswered market —
              474 of them — which is the same work the thirty rows below
              describe, said in a way that reads as hopeless. The market total
              keeps its place in the line beneath, where it informs instead of
              looming. "Waiting on you" is Home's phrase for this same count,
              and covers the questions in it as well as the matches. */}
          <div className="flex items-end gap-[10px] mt-[9px]">
            <span className="tf-num font-heading font-bold text-[46px] leading-[0.9] tracking-[-2px]">{totalEntries}</span>
            <span className="text-[12px] text-[var(--nav-text-faint)] pb-[6px]">waiting on you</span>
          </div>
          <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[8px]">{summary}</div>
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
                      ? { background: 'var(--brand-fill)', color: 'var(--color-on-brand)' }
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
                {entries.length >= totalEntries ? (
                  <>Look a week further ahead</>
                ) : (
                  <>
                    Show more
                    <span className="ml-[7px] tf-num opacity-60">{entries.length} of {totalEntries}</span>
                  </>
                )}
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
