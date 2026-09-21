import { test, expect } from '@playwright/test';
import { toMemberAnswers, type ResultMarket, type RivalMember } from '@/lib/predict/fixture-results';

/**
 * Pure logic, no page — toMemberAnswers takes the league's disclosed answers
 * and a market, and returns what each member said. A real settled fixture
 * with a genuine lineup answer needs a real match to have actually kicked
 * off, which nothing here can force; this constructs the API's own real
 * shape by hand instead, so the bug it guards fails fast and every time
 * rather than only on whichever fixture happens to be live.
 *
 * The bug: RivalPredictionMemberDto carries a lineup in `lineups.home`/
 * `lineups.away`, a separate field from `predictions` — the array
 * `RivalStandardPredictionDto.marketType` is not even typed to allow the
 * value 'lineup'. toMemberAnswers used to look for a lineup inside
 * `predictions` regardless, so it could never find one: every member's
 * lineup read as "not answered" in the league's own results view, whatever
 * they had actually named.
 */

const context = { homeName: 'Brentford', awayName: 'Chelsea', totalGoalsLine: 2.5 };

function homeLineupMarket(landedPlayerIds: string[] = []): ResultMarket {
  return {
    marketType: 'lineup',
    key: 'home_lineup',
    side: 'home',
    label: 'Brentford XI',
    landedLabel: null,
    landedPlayerIds,
    resolved: null,
    pointsAwarded: null,
  };
}

function memberWithLineup(playerIds: string[]): RivalMember {
  return {
    position: 1,
    membershipId: 'member-1',
    displayName: 'Jordan Reyes',
    isViewer: false,
    predictions: [],
    lineups: {
      enabled: true,
      home: {
        value: {},
        players: playerIds.map((id, i) => ({
          playerId: id, displayName: `Player ${i}`, photoUrl: null, position: null, shirtNumber: i,
        })),
        rulesetRevision: 1,
        deadlineAt: '2026-09-19T18:00:00Z',
        kickoff: {},
        snapshot: {},
        submittedAt: '2026-09-19T10:00:00Z',
      },
      away: null,
    },
    predictionCompleteness: { required: 1, answered: 1, unanswered: 0, complete: true },
  };
}

test('a member who named a full lineup no longer reads "not answered"', () => {
  const eleven = Array.from({ length: 11 }, (_, i) => `player-${i}`);
  const [rows] = [toMemberAnswers([memberWithLineup(eleven)], homeLineupMarket(), context)];

  expect(rows[0].answer).not.toBeNull();
  expect(rows[0].answer).toBe('11 named');
});

test('once the market settles, the answer counts how many actually started', () => {
  const eleven = Array.from({ length: 11 }, (_, i) => `player-${i}`);
  // Only the first 8 of the 11 named actually started.
  const started = eleven.slice(0, 8);
  const rows = toMemberAnswers([memberWithLineup(eleven)], homeLineupMarket(started), context);

  expect(rows[0].answer).toBe('8 of 11 started');
  expect(rows[0].landed).toBe(false);
});

test('a full, correct lineup reads as landed', () => {
  const eleven = Array.from({ length: 11 }, (_, i) => `player-${i}`);
  const rows = toMemberAnswers([memberWithLineup(eleven)], homeLineupMarket(eleven), context);

  expect(rows[0].landed).toBe(true);
});

test('a member who genuinely named nothing for this side still reads "not answered"', () => {
  const member = memberWithLineup([]);
  // Away lineup: this member only ever named the home XI (lineups.away is null).
  const awayMarket: ResultMarket = { ...homeLineupMarket(), key: 'away_lineup', side: 'away', label: 'Chelsea XI' };
  const rows = toMemberAnswers([member], awayMarket, context);

  expect(rows[0].answer).toBeNull();
});
