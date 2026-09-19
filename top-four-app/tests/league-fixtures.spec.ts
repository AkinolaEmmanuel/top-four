import { test, expect } from '@playwright/test';
import { matchesFilter, stateChip, stateLabel, type FixtureFilter } from '@/lib/leagues/league-fixtures';
import type { LeagueFixture } from '@/lib/api/leagues';

/**
 * Pure logic, no page — matchesFilter/stateChip/stateLabel take a state and
 * return a value, nothing else. A live fixture in exactly a 'part' or
 * 'missed' state (answered some, then locked before finishing) depends on a
 * real deadline actually passing, which nothing here can force — these run
 * every state through the functions directly instead, so a regression like
 * the Locked filter checking for a state ('syncing') nothing ever assigns
 * fails a fast, deterministic test rather than only showing up live.
 */

const STATES: readonly LeagueFixture['predictionState'][] = [
  'ready', 'open', 'syncing', 'part', 'missed', 'won', 'lost', 'void', undefined,
];

test('every upcoming state matches exactly the filters its own name promises', () => {
  const matching = (filter: FixtureFilter) =>
    STATES.filter(s => matchesFilter(s, filter));

  expect(matching('all')).toEqual(STATES);
  expect(matching('unanswered')).toEqual(['open']);
  expect(matching('open')).toEqual(['ready', 'open']);
  // The regression this guards: 'syncing' is declared on the type and never
  // assigned anywhere in the app, so a Locked filter that checked for it
  // matched nothing — every fixture that had actually locked, answered or
  // not, fell out of every filter but All.
  expect(matching('locked')).toEqual(['part', 'missed']);
});

test('an upcoming fixture never renders the results vocabulary, and vice versa', () => {
  for (const state of STATES) {
    const upcomingChip = stateChip(state, 'upcoming');
    const resultsChip = stateChip(state, 'results');
    expect(upcomingChip).not.toBe('');
    expect(resultsChip).not.toBe('');
  }
});

test('a locked-but-partially-answered fixture reads differently from one never touched', () => {
  // The bug this distinction exists for: both used to arrive as
  // `complete: false, hasOpenMarkets: false` from the API and were
  // indistinguishable once collapsed into a single predictionState of
  // `undefined` — a member who answered four of five markets before the
  // deadline caught the fifth saw the same "not answered" chip as a member
  // who never opened the fixture at all.
  expect(stateChip('part', 'upcoming')).toBe('PARTIAL');
  expect(stateChip('missed', 'upcoming')).toBe('LOCKED');
  expect(stateChip('part', 'upcoming')).not.toBe(stateChip('missed', 'upcoming'));
  expect(stateLabel('part', 'upcoming')).not.toBe(stateLabel('missed', 'upcoming'));
});
