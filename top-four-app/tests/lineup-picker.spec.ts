import { test, expect } from '@playwright/test';
import { seatSaved, seatCarried, carriedNote, bucketOf } from '@/app/components/predict/LineupPicker';
import type { PlayerOption } from '@/lib/predict/fixture-predict';

/**
 * Pure logic, no page — seatSaved only ever needs a list of ids and a lookup
 * map. The bug this guards: a saved XI whose *goalkeeper* has a catalogue
 * position seatSaved cannot recognise falls into MID like everything else,
 * for eleven outfield picks and zero in goal — the pitch only ever draws ten
 * outfield places, so the eleventh had nowhere to go and Save refused a
 * lineup that saved fine the last time it was opened.
 */

function player(id: string, position: string | null): PlayerOption {
  return {
    id, name: id, meta: '', initials: id.slice(0, 2).toUpperCase(),
    photoUrl: null, position, shirtNumber: null,
  };
}

test('bucketOf leaves an unrecognisable position undecided rather than guessing', () => {
  expect(bucketOf('Goalkeeper')).toBe('GK');
  expect(bucketOf('Centre-Back')).toBe('DEF');
  expect(bucketOf('Attacking Midfield')).toBe('MID');
  expect(bucketOf('Striker')).toBe('FWD');
  expect(bucketOf('Utility')).toBeNull();
  expect(bucketOf(null)).toBeNull();
});

test('a saved XI whose keeper has an unrecognisable position still seats as eleven, not twelve', () => {
  // Eleven ids: one real keeper the catalogue mislabels, ten real outfield
  // players who all resolve normally — the exact shape of the bug report.
  const ids = ['gk', 'd1', 'd2', 'd3', 'd4', 'm1', 'm2', 'm3', 'f1', 'f2', 'f3'];
  const byId = new Map<string, PlayerOption>([
    ['gk', player('gk', 'Utility')], // unrecognisable — the mislabelled keeper
    ['d1', player('d1', 'Defender')], ['d2', player('d2', 'Defender')],
    ['d3', player('d3', 'Defender')], ['d4', player('d4', 'Defender')],
    ['m1', player('m1', 'Midfielder')], ['m2', player('m2', 'Midfielder')], ['m3', player('m3', 'Midfielder')],
    ['f1', player('f1', 'Forward')], ['f2', player('f2', 'Forward')], ['f3', player('f3', 'Forward')],
  ]);

  const { counts, picks } = seatSaved(ids, byId);

  // Ten outfield places, full stop — the mislabelled keeper (seated in MID,
  // the fallback bucket) pushes the true count to eleven and the eleventh
  // must be dropped, not silently grown past what the pitch can draw.
  expect(counts.DEF + counts.MID + counts.FWD).toBeLessThanOrEqual(10);
  expect(Object.keys(picks).length).toBeLessThanOrEqual(11);
  // The mislabelled keeper is still on the pitch somewhere — dropped only
  // means "not double-counted past eleven", not "discarded outright".
  expect(Object.values(picks)).toContain('gk');
});

test('a saved XI with a real, recognised keeper seats all eleven normally', () => {
  const ids = ['gk', 'd1', 'd2', 'd3', 'd4', 'm1', 'm2', 'm3', 'f1', 'f2', 'f3'];
  const byId = new Map<string, PlayerOption>([
    ['gk', player('gk', 'Goalkeeper')],
    ['d1', player('d1', 'Defender')], ['d2', player('d2', 'Defender')],
    ['d3', player('d3', 'Defender')], ['d4', player('d4', 'Defender')],
    ['m1', player('m1', 'Midfielder')], ['m2', player('m2', 'Midfielder')], ['m3', player('m3', 'Midfielder')],
    ['f1', player('f1', 'Forward')], ['f2', player('f2', 'Forward')], ['f3', player('f3', 'Forward')],
  ]);

  const { counts, picks } = seatSaved(ids, byId);

  expect(counts).toEqual({ DEF: 4, MID: 3, FWD: 3 });
  expect(Object.keys(picks)).toHaveLength(11);
});

/** A 4-3-3 where every player's catalogue position resolves. */
function squad433(): Map<string, PlayerOption> {
  return new Map<string, PlayerOption>([
    ['gk', player('gk', 'Goalkeeper')],
    ['d1', player('d1', 'Defender')], ['d2', player('d2', 'Defender')],
    ['d3', player('d3', 'Defender')], ['d4', player('d4', 'Defender')],
    ['m1', player('m1', 'Midfielder')], ['m2', player('m2', 'Midfielder')], ['m3', player('m3', 'Midfielder')],
    ['f1', player('f1', 'Forward')], ['f2', player('f2', 'Forward')], ['f3', player('f3', 'Forward')],
  ]);
}

test('a carried XI missing two forwards keeps its 4-3-3 with two empty forward places', () => {
  const byId = squad433();
  byId.delete('f2');
  byId.delete('f3');
  const { counts, picks } = seatCarried({
    playerIds: ['gk', 'd1', 'd2', 'd3', 'd4', 'm1', 'm2', 'm3', 'f1'],
    missing: [
      { id: 'f2', name: 'Bukayo Saka', position: 'Attacker' },
      { id: 'f3', name: 'Gabriel Martinelli', position: 'Attacker' },
    ],
    sourceLabel: 'v Chelsea, 4 Oct',
  }, byId);

  // Ten outfield places, so the picker asks for two players, not a shape.
  expect(counts).toEqual({ DEF: 4, MID: 3, FWD: 3 });
  expect(Object.keys(picks)).toHaveLength(9);
  expect(picks.FWD0).toBe('f1');
  expect(picks.FWD1).toBeUndefined();
});

test('a carried XI missing its keeper leaves the goal empty and the outfield whole', () => {
  const byId = squad433();
  byId.delete('gk');
  const { counts, picks } = seatCarried({
    playerIds: ['d1', 'd2', 'd3', 'd4', 'm1', 'm2', 'm3', 'f1', 'f2', 'f3'],
    missing: [{ id: 'gk', name: 'David Raya', position: 'Goalkeeper' }],
    sourceLabel: 'v Chelsea, 4 Oct',
  }, byId);

  expect(counts).toEqual({ DEF: 4, MID: 3, FWD: 3 });
  expect(picks.GK0).toBeUndefined();
  expect(Object.keys(picks)).toHaveLength(10);
});

test('a missing player with no usable position still gets a place back', () => {
  const byId = squad433();
  byId.delete('m3');
  const { counts } = seatCarried({
    playerIds: ['gk', 'd1', 'd2', 'd3', 'd4', 'm1', 'm2', 'f1', 'f2', 'f3'],
    missing: [{ id: 'm3', name: 'Declan Rice', position: '' }],
    sourceLabel: 'v Chelsea, 4 Oct',
  }, byId);

  expect(counts.DEF + counts.MID + counts.FWD).toBe(10);
});

test('the carried note names who has gone, briefly', () => {
  const base = { playerIds: [], sourceLabel: 'v Chelsea, 4 Oct' };
  expect(carriedNote({ ...base, missing: [] }))
    .toBe('From your last XI, v Chelsea, 4 Oct. Check it and save.');
  expect(carriedNote({ ...base, missing: [{ id: 'a', name: 'Bukayo Saka', position: 'Attacker' }] }))
    .toBe('From your last XI, v Chelsea, 4 Oct. B. Saka isn’t in this squad, so that place is empty.');
  expect(carriedNote({
    ...base,
    missing: [
      { id: 'a', name: 'Bukayo Saka', position: 'Attacker' },
      { id: 'b', name: 'Declan Rice', position: 'Midfielder' },
    ],
  })).toBe('From your last XI, v Chelsea, 4 Oct. B. Saka and D. Rice aren’t in this squad, so their places are empty.');
  expect(carriedNote({
    ...base,
    missing: ['A One', 'B Two', 'C Three', 'D Four'].map((name, i) => ({ id: String(i), name, position: 'Defender' })),
  })).toBe('From your last XI, v Chelsea, 4 Oct. A. One, B. Two and 2 others aren’t in this squad, so their places are empty.');
});
