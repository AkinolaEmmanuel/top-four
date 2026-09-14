import Link from 'next/link';
import { pluralise } from '@/lib/format';
import { serverFetchOrNull } from '@/lib/api/server-fetch';
import {
  toPayoff, PAYOFF_KICKER, PAYOFF_WINDOW_MS, type PayoffFixture, type HomePayoff,
} from '@/lib/home/home-payoff';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';
import type { Api } from '@/lib/api/types';

/**
 * The design's payoff block: what the member won lately, across every league.
 *
 * Its reads are its own and it is rendered inside a Suspense boundary, so Home
 * still paints on the four calls it already made. Two calls per league is a real
 * cost, and this is what keeps it off the critical path.
 *
 * The reads are windowed to the last seven days by kickoff, so the size of the
 * work does not grow with the length of the season.
 */

type AvailabilityPage = { data: FixtureAvailability[]; nextCursor: string | null };
type ResultsBatch = Api<'MemberFixtureResultsBatchResponseDto'>;

const PLAYED_STATES = ['finished', 'awarded', 'walkover'];

/** The batch results endpoint accepts fifty ids per call and rejects more. */
const RESULTS_BATCH_SIZE = 50;

/** Whole seconds: `from`/`to` are validated against a pattern that rejects more. */
function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

async function readLeague(leagueId: string, from: string, to: string): Promise<PayoffFixture[]> {
  const page = await serverFetchOrNull<AvailabilityPage>(
    `/leagues/${leagueId}/fixtures/availability?limit=${RESULTS_BATCH_SIZE}`
    + `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );

  const played = (page?.data ?? []).filter(f => PLAYED_STATES.includes(f.fixtureState));
  if (played.length === 0) return [];

  const results = await serverFetchOrNull<ResultsBatch>(
    `/leagues/${leagueId}/fixtures/results?`
    + played.map(f => `leagueFixtureIds=${encodeURIComponent(f.leagueFixtureId)}`).join('&'),
  );
  const byFixture = new Map<string, FixtureResultsResponse>(
    (results?.data ?? []).map(r => [r.leagueFixtureId, r]),
  );

  return played.map(f => ({
    leagueId,
    leagueFixtureId: f.leagueFixtureId,
    homeName: f.homeTeam?.displayName || 'Home',
    awayName: f.awayTeam?.displayName || 'Away',
    kickoffAt: f.kickoff?.at ?? null,
    results: byFixture.get(f.leagueFixtureId),
  }));
}

export async function HomePayoffSection({ leagueIds }: { leagueIds: string[] }) {
  if (leagueIds.length === 0) return null;

  const now = Date.now();
  const from = boundary(now - PAYOFF_WINDOW_MS);
  const to = boundary(now);

  const perLeague = await Promise.all(leagueIds.map(id => readLeague(id, from, to)));
  const payoff = toPayoff(perLeague.flat());

  // Nothing has settled this week. The block is a reward, so it says nothing
  // rather than reporting a zero at the member.
  if (!payoff) return null;

  return <PayoffBlock payoff={payoff} />;
}

function PayoffBlock({ payoff }: { payoff: HomePayoff }) {
  return (
    <section className="px-[var(--gutter)] pt-[22px] md:px-0 md:pt-0 md:pb-[22px]">
      <div className="rounded-[12px] p-[18px] bg-[var(--payoff-surface)] text-[var(--tf-white)]">
        <div className="flex items-center justify-between gap-[10px]">
          <span className="tf-kicker text-[rgba(255,255,255,.62)]">{PAYOFF_KICKER}</span>
          <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[3px_8px] rounded-[5px] bg-[var(--tf-white)] text-[var(--payoff-surface)] flex-none">
            {pluralise(payoff.leagueCount, 'LEAGUE').toUpperCase()}
          </span>
        </div>

        <div className="flex items-end gap-[11px] mt-[12px]">
          <span className="tf-num font-heading font-bold text-[40px] leading-[0.9] tracking-[-1.6px]">{payoff.pointsLabel}</span>
          <span className="text-[11.5px] text-[rgba(255,255,255,.66)] pb-[5px]">across every league you play in</span>
        </div>

        <div className="flex flex-col gap-[9px] mt-[15px]">
          {payoff.rows.map(row => (
            <Link key={row.href} href={row.href} className="tf-hit flex items-center gap-[10px]">
              <span
                className={`w-[18px] h-[18px] rounded-full flex-none grid place-items-center font-heading font-bold text-[9px] ${
                  row.won
                    ? 'bg-[rgba(255,255,255,.9)] text-[var(--payoff-surface)]'
                    : 'bg-[rgba(255,255,255,.16)] text-[rgba(255,255,255,.7)]'
                }`}
              >
                {row.won ? '✓' : '✕'}
              </span>
              <span className="flex-1 min-w-0 text-[12px] text-[rgba(255,255,255,.85)] truncate">{row.label}</span>
              <span className="tf-num font-heading font-bold text-[12.5px] flex-none">{row.points}</span>
            </Link>
          ))}
        </div>

        {payoff.more > 0 && (
          <div className="text-[10.5px] text-[rgba(255,255,255,.55)] mt-[11px]">
            {pluralise(payoff.more, 'other fixture')} settled too.
          </div>
        )}
      </div>
    </section>
  );
}

/** The block's own shape while its reads are in flight. */
export function HomePayoffSkeleton() {
  return (
    <section className="px-[var(--gutter)] pt-[22px] md:px-0 md:pt-0 md:pb-[22px]">
      <div className="h-[168px] rounded-[12px] bg-[var(--surface-subtle)] animate-pulse" />
    </section>
  );
}
