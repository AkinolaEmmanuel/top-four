import { test, expect } from '@playwright/test';
import { toCarriedLineups } from '@/lib/predict/fixture-predict';
import type { PreviousLineups } from '@/lib/api/predictions-fixture';

/**
 * Pure logic, no page. The carried XI is only offered when it was checked
 * against the same squad list the picker draws; otherwise an id the picker
 * cannot show would be seated and the save refused.
 */

const SNAPSHOT = '33333333-3333-4333-8333-333333333333';

function previous(snapshotId: string): PreviousLineups {
  return {
    home: {
      snapshotId,
      playerIds: ['p1', 'p2'],
      missing: [{ playerId: 'p3', displayName: 'M. O&apos;Riley', position: 'Midfielder' }],
      source: { opponent: { displayName: 'Chelsea', code: 'CHE' }, kickoffAt: '2026-10-04T14:00:00.000000Z' },
    },
    away: null,
  };
}

test('maps a previous XI into a draft with a readable source and decoded names', () => {
  const carried = toCarriedLineups(previous(SNAPSHOT), SNAPSHOT);

  expect(carried.away).toBeNull();
  expect(carried.home).toEqual({
    playerIds: ['p1', 'p2'],
    missing: [{ id: 'p3', name: 'M. O\'Riley', position: 'Midfielder' }],
    sourceLabel: 'v Chelsea, 4 Oct',
  });
});

test('offers nothing when the squad list moved on between the two reads', () => {
  const carried = toCarriedLineups(previous(SNAPSHOT), '44444444-4444-4444-8444-444444444444');
  expect(carried).toEqual({ home: null, away: null });
});

test('offers nothing without a previous read or a squad list', () => {
  expect(toCarriedLineups(null, SNAPSHOT)).toEqual({ home: null, away: null });
  expect(toCarriedLineups(previous(SNAPSHOT), null)).toEqual({ home: null, away: null });
});
