'use client';

import Link from 'next/link';
import { heroGradient } from '@/lib/crest-colour';
import { useTeamPalettes } from '@/hooks/useTeamPalettes';
import { TeamCrest } from '../TeamCrest';
import { pluralise } from '@/lib/format';
import { closingMarketFor } from '@/lib/leagues/league-overview';
import type { LastResult, LeagueOverviewPhase, RivalGap, StandingRow, NextFixture } from '@/lib/leagues/league-overview';

/**
 * The league overview — one component for both platforms.
 *
 * Replaces a mobile and a desktop twin whose markup had drifted apart: the
 * mobile one carried thirteen hardcoded strings from the prototype (Arsenal,
 * Chelsea, a rival called Tobi, a 2–1 scoreline) while the desktop one drew the
 * same screen correctly from props. There is one markup now, so they cannot
 * disagree again.
 */


const PHASE_COPY: Record<LeagueOverviewPhase, { kicker: string; cta: string }> = {
  live: { kicker: 'NEXT LOCK', cta: 'Finish predictions' },
  urgent: { kicker: 'LOCKING NOW', cta: 'Finish predictions' },
  caughtup: { kicker: 'ALL ANSWERED', cta: 'Review your answers' },
};


export function LeagueOverviewScreen({
  leagueId, leagueName, lifecycleLabel, memberCount, competition,
  phase, timeToLock, answered, required, nextFixture,
  rivals, gap, lastResult, openQuestions, questionDeadline, marketRules,
}: {
  leagueId: string;
  leagueName: string;
  lifecycleLabel: string;
  memberCount: number | null;
  competition: string;
  phase: LeagueOverviewPhase;
  timeToLock: string;
  answered: number;
  required: number;
  nextFixture: NextFixture | null;
  rivals: StandingRow[];
  gap: RivalGap;
  lastResult: LastResult | null;
  openQuestions: number;
  questionDeadline: string | null;
  /** The league's own scoring, for "one exact score would do it". */
  marketRules: Array<{ label: string; points: number }>;
}) {
  const urgent = phase === 'urgent';
  const closingLine = gap.behind ? closingMarketFor(gap.behind.points, marketRules) : null;
  const caught = phase === 'caughtup';
  const tone = urgent ? 'var(--color-danger)' : caught ? 'var(--nav-positive)' : 'var(--nav-accent)';
  const pct = required > 0 ? Math.round((answered / required) * 100) : 0;

  const fixtureName = nextFixture ? `${nextFixture.homeName} v ${nextFixture.awayName}` : competition || 'No fixtures';
  const heroHref = nextFixture ? `/predict/fixture/${nextFixture.leagueFixtureId}?leagueId=${leagueId}` : '/predict';

  const [homePalette, awayPalette] = useTeamPalettes(
    { code: nextFixture?.homeCode ?? '', logoUrl: nextFixture?.homeLogo ?? null },
    { code: nextFixture?.awayCode ?? '', logoUrl: nextFixture?.awayLogo ?? null },
  );
  const heroBg = nextFixture
    ? heroGradient(homePalette, awayPalette)
    : 'var(--nav-surface)';

  return (
    <>




        <section style={{ background: heroBg, transition: 'background 240ms ease' }} className="px-[var(--gutter)] py-[20px] md:py-[26px] text-[var(--nav-text)] border-b border-[rgba(255,255,255,0.1)]">
          <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:flex md:items-center md:gap-[40px]">
            <div className="md:flex-none">
              <div className="flex items-center gap-[8px]">
                <span className={`w-[7px] h-[7px] rounded-full flex-none ${urgent ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`} style={{ background: tone }} />
                <span className="tf-kicker" style={{ color: tone }}>{PHASE_COPY[phase].kicker}</span>
              </div>
              <div className="tf-num font-heading font-bold text-[46px] md:text-[56px] leading-[0.88] tracking-[-2px] mt-[9px]" style={{ color: urgent ? 'var(--color-danger)' : 'var(--nav-text)' }}>
                {timeToLock}
              </div>
              <div className="text-[11.5px] md:text-[12.5px] text-[var(--nav-text-faint)] mt-[8px]">until {fixtureName} closes</div>
            </div>

            <div className="mt-[18px] md:mt-0 md:flex-1 md:min-w-0">
              {nextFixture && (
                <div className="flex items-center gap-[14px]">
                  <div className="flex-1 flex items-center gap-[9px] min-w-0">
                    <TeamCrest code={nextFixture.homeCode} logoUrl={nextFixture.homeLogo} size={38} />
                    <span className="font-heading font-[650] text-[15px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate">{nextFixture.homeName}</span>
                  </div>
                  <span className="font-heading font-semibold text-[10px] text-[var(--nav-text-faint)] flex-none">
                    {nextFixture.kickoffAt ? new Date(nextFixture.kickoffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
                  </span>
                  <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                    <span className="font-heading font-[650] text-[15px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate text-right">{nextFixture.awayName}</span>
                    <TeamCrest code={nextFixture.awayCode} logoUrl={nextFixture.awayLogo} size={38} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-[12px] mt-[16px]">
                <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: caught ? 'var(--nav-positive)' : urgent ? 'var(--color-danger)' : 'var(--nav-accent)' }} />
                </div>
                <span className="tf-num font-heading font-bold text-[11px] flex-none">{required > 0 ? `${answered} of ${required}` : '—'}</span>
              </div>

              <Link href={heroHref} className="mt-[16px] h-[48px] md:w-[200px] rounded-[12px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--nav-accent)] text-[var(--nav-on-accent)]">
                {PHASE_COPY[phase].cta}
              </Link>
            </div>
          </div>
        </section>

        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-[28px] md:py-[26px]">

          <section className="mt-[22px] md:mt-0">
            <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px] md:px-0">
              {/* Naming who you are chasing is the design's headline; the bare
                  position is what it falls back to when nobody is above you. */}
              <span className="tf-kicker text-[var(--text-muted)]">
                {gap.behind ? `You are chasing ${gap.behind.name}` : gap.positionLabel}
              </span>
              <Link href={`/leagues/${leagueId}/table`} className="tf-hit font-heading font-bold text-[10px] text-[var(--text-link)]">FULL TABLE →</Link>
            </div>

            {rivals.map(rival => (
              <div key={rival.membershipId} className={`flex items-center gap-[11px] p-[11px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)] ${rival.isYou ? 'bg-[var(--accent-surface)] md:bg-transparent shadow-[inset_3px_0_0_0_var(--color-brand)] md:shadow-none' : ''}`}>
                <span className="font-heading font-bold text-[11px] w-[20px] tf-num text-[var(--text-muted)]">{rival.position}</span>
                <span
                  className={`w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] ${rival.isYou ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'text-[var(--text-primary)]'}`}
                  style={rival.isYou ? undefined : { background: `var(--ident-${rival.tint})` }}
                >
                  {rival.initials}
                </span>
                <span className={`flex-1 min-w-0 font-heading text-[13.5px] truncate ${rival.isYou ? 'font-bold text-[var(--accent-text-strong)]' : 'font-semibold'}`}>{rival.name}</span>
                <span className={`tf-num font-heading font-bold text-[14px] flex-none ${rival.isYou ? 'text-[var(--accent-text-strong)]' : ''}`}>{rival.points}</span>
              </div>
            ))}

            {gap.behind && (
              <div className="flex items-end gap-[12px] p-[16px_var(--gutter)_0] md:px-0">
                <div className="tf-num font-heading font-bold text-[44px] leading-[0.85] tracking-[-2px]">{gap.behind.points}</div>
                <div className="pb-[3px]">
                  <div className="font-heading font-semibold text-[12.5px]">points behind {gap.behind.name}</div>
                  {closingLine && (
                    <div className="text-[11px] text-[var(--text-secondary)] mt-[3px]">{closingLine}</div>
                  )}
                  {gap.clearOf && (
                    <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">and {gap.clearOf.points} clear of {gap.clearOf.positionLabel}</div>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="md:contents">
            <section className="p-[22px_var(--gutter)_0] md:p-0">
              {lastResult ? (
                <Link
                  href={`/predict/fixture/${lastResult.leagueFixtureId}?leagueId=${leagueId}`}
                  className="block rounded-[12px] p-[18px] text-[var(--tf-white)]"
                  style={{ background: lastResult.outcome === 'won' ? 'var(--tf-green-800)' : 'var(--tf-navy-800)' }}
                >
                  <div className="flex items-center justify-between gap-[10px]">
                    {/* The design celebrates when there is something to
                        celebrate. A neutral "LAST RESULT" over a win reads as a
                        report of something that happened to somebody else. */}
                    <span className="tf-kicker text-[rgba(255,255,255,0.62)]">
                      {lastResult.outcome === 'won' ? 'YOU CALLED IT'
                        : lastResult.outcome === 'part' ? 'YOU GOT SOME OF IT'
                          : 'LAST RESULT'}
                    </span>
                    <span className="tf-chip bg-[var(--tf-white)] text-[var(--tf-navy-800)]">
                      {lastResult.outcome === 'won' ? 'EXACT SCORE' : lastResult.outcome === 'part' ? 'PARTIAL' : lastResult.outcome === 'void' ? 'VOID' : 'NO POINTS'}
                    </span>
                  </div>
                  <div className="flex items-center gap-[13px] mt-[14px]">
                    <TeamCrest code={lastResult.homeCode} logoUrl={lastResult.homeLogo} size={34} />
                    <span className="tf-num font-heading font-bold text-[30px] leading-[1] tracking-[-1.2px]">{lastResult.score ?? '—'}</span>
                    <TeamCrest code={lastResult.awayCode} logoUrl={lastResult.awayLogo} size={34} />
                    <div className="flex-1 text-right">
                      <div className="tf-num font-heading font-bold text-[26px] tracking-[-0.8px]">
                        {lastResult.pointsAwarded === null ? '—' : `+${lastResult.pointsAwarded}`}
                      </div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.55)] mt-[2px]">this fixture</div>
                    </div>
                  </div>
                  <div className="text-[11.5px] leading-[1.55] text-[rgba(255,255,255,0.72)] mt-[13px]">{lastResult.homeName} v {lastResult.awayName}</div>
                  <div className="flex flex-wrap gap-[6px] mt-[13px]">
                    {lastResult.breakdown.map((b, i) => (
                      <span
                        key={i}
                        className={`font-heading font-semibold text-[10.5px] p-[5px_10px] rounded-[6px] ${b.correct ? 'bg-[rgba(255,255,255,0.16)] text-[var(--tf-white)]' : 'bg-transparent text-[rgba(255,255,255,0.45)] border border-dashed border-[rgba(255,255,255,0.28)]'}`}
                      >
                        {b.label} {b.points}
                      </span>
                    ))}
                  </div>
                </Link>
              ) : (
                <div className="p-[16px_0] border-y border-[var(--surface-border)] md:border-t-0">
                  <div className="tf-kicker text-[var(--text-muted)]">NO RESULTS YET</div>
                  <div className="text-[12.5px] leading-[1.55] text-[var(--text-secondary)] mt-[8px]">No settled fixtures yet in this league.</div>
                </div>
              )}
            </section>

            <section className="p-[22px_var(--gutter)] md:p-0 md:mt-[20px]">
              <Link href={`/leagues/${leagueId}/questions`} className="flex items-center gap-[12px] p-[15px] rounded-[12px] border border-[var(--surface-border)]">
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-[13px]">
                    {openQuestions > 0 ? `${openQuestions} question${openQuestions === 1 ? '' : 's'} open` : 'No questions open'}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">
                    {questionDeadline
                      ? `Earliest closes ${new Date(questionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : 'Custom questions score onto the same table'}
                  </div>
                </div>
                <span className="font-heading font-bold text-[10px] text-[var(--text-link)] flex-none">OPEN →</span>
              </Link>
            </section>
          </div>
        </div>

        {/* Clears the fixed bottom bar on a phone. */}
        <div className="h-[86px] md:h-[20px]" />
    </>
  );
}
