'use client';

import { useMemo, useRef, useState } from 'react';
import type { PlayerOption } from '@/lib/predict/fixture-predict';

/**
 * The starting XI, picked slot by slot.
 *
 * The pitch is the control: pick how many defenders, midfielders and forwards
 * you want, tap a place to fill it, drag a filled place onto another to swap
 * them. Nothing here scores — the settlement engine only ever counts how many
 * of your eleven actually started (see resolveLineup in topfour-api); the
 * shape and who stands where is entirely presentational. So nothing here
 * gates on it either: a place's row is where it is drawn, never who is
 * "allowed" to fill it, and the four preset shapes below are quick-picks for
 * the same reason a search box has suggestions, not a whitelist.
 */

export type Bucket = 'GK' | 'DEF' | 'MID' | 'FWD';
type OutfieldBucket = 'DEF' | 'MID' | 'FWD';

const OUTFIELD: OutfieldBucket[] = ['DEF', 'MID', 'FWD'];
const OUTFIELD_TOTAL = 10;

/** Quick-picks only — see the module comment. Any other split is one tap away via the steppers. */
const PRESETS = ['4-3-3', '4-4-2', '3-5-2', '5-3-2'] as const;

/** Top of the pitch to the bottom, which is how a teamsheet is drawn. */
const ROWS: Bucket[] = ['FWD', 'MID', 'DEF', 'GK'];

const BUCKET_LABEL: Record<Bucket, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
};

/** Orientation only. Position never scores; the colour says where you are. */
const BUCKET_FILL: Record<Bucket, string> = {
  GK: 'var(--pos-gk)', DEF: 'var(--pos-df)', MID: 'var(--pos-mf)', FWD: 'var(--pos-fw)',
};

export type Counts = Record<OutfieldBucket, number>;

export function countsForPreset(preset: (typeof PRESETS)[number]): Counts {
  const [def, mid, fwd] = preset.split('-').map(Number);
  return { DEF: def, MID: mid, FWD: fwd };
}

export function quotasFor(counts: Counts): Record<Bucket, number> {
  return { GK: 1, ...counts };
}

/**
 * The catalogue's position, mapped to a line — a starting suggestion only.
 *
 * Nothing downstream trusts this as ground truth any more: the catalogue's
 * own text is sometimes wrong or missing, and there is no structured position
 * data to fall back on, so a player whose real role does not match this guess
 * is never blocked from a place in any other row. This only decides where a
 * player is *offered* first when filling a place, and where a saved pick
 * without a recognisable position lands (MID, arbitrarily but harmlessly).
 */
export function bucketOf(position: string | null | undefined): Bucket | null {
  if (!position) return null;
  const p = position.trim().toLowerCase();
  if (p.includes('keeper') || p === 'gk' || p === 'g') return 'GK';
  if (p.includes('defen') || p.includes('back') || p === 'd') return 'DEF';
  if (p.includes('mid') || p === 'm') return 'MID';
  if (p.includes('forward') || p.includes('striker') || p.includes('wing')
    || p.includes('attack') || p === 'f' || p === 'a') return 'FWD';
  return null;
}

/** `DEF2` — a line and a place in it. Stable across a shape change. */
type SlotKey = string;
const slotKey = (bucket: Bucket, index: number): SlotKey => `${bucket}${index}`;
const bucketOfSlot = (key: SlotKey): Bucket => key.replace(/\d+$/, '') as Bucket;

function slotsFor(quotas: Record<Bucket, number>): Record<Bucket, SlotKey[]> {
  return {
    GK: Array.from({ length: quotas.GK }, (_, i) => slotKey('GK', i)),
    DEF: Array.from({ length: quotas.DEF }, (_, i) => slotKey('DEF', i)),
    MID: Array.from({ length: quotas.MID }, (_, i) => slotKey('MID', i)),
    FWD: Array.from({ length: quotas.FWD }, (_, i) => slotKey('FWD', i)),
  };
}

/** Two Gabriels in a squad both reduce to "GM", so the disc carries the shirt. */
function discLabel(player: PlayerOption): string {
  return player.shirtNumber !== null ? String(player.shirtNumber) : player.initials;
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name;
}

/**
 * Rebuilds the slot map and shape from a saved XI.
 *
 * A stored lineup is eleven ids and nothing else, so the shape is read back
 * from the players' own bucket — a guess exactly like filling a place is, and
 * one a saved pick with an unrecognised position no longer fails on: it is
 * seated in MID rather than discarding the whole lineup, since the row was
 * never more than a label to begin with.
 */
export function seatSaved(ids: string[], byId: Map<string, PlayerOption>):
{ counts: Counts; picks: Record<SlotKey, string> } {
  const seated: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const picks: Record<SlotKey, string> = {};

  for (const id of ids) {
    const player = byId.get(id);
    const bucket = (player && bucketOf(player.position)) || 'MID';
    if (bucket === 'GK') {
      // A saved lineup only ever carried one goalkeeper; a second one (data
      // from before a squad change, say) has nowhere fixed to sit and is
      // dropped rather than growing the goalkeeper row.
      if (seated.GK >= 1) continue;
    } else if (seated.DEF + seated.MID + seated.FWD >= OUTFIELD_TOTAL) {
      // The same reason this whole change exists — a catalogue position that
      // is wrong or missing — can just as easily land the *keeper* in MID
      // alongside ten outfield picks, for eleven outfield places and zero in
      // goal. The pitch only ever draws ten outfield slots, so an eleventh
      // saved id here is dropped rather than handed back a lineup Save
      // refuses to accept.
      continue;
    }
    picks[slotKey(bucket, seated[bucket])] = id;
    seated[bucket]++;
  }

  return { counts: { DEF: seated.DEF, MID: seated.MID, FWD: seated.FWD }, picks };
}

export type LineupPhase = 'editable' | 'locked' | 'scored';

/** How far a press has to travel before it counts as a drag, not a tap. */
const DRAG_THRESHOLD = 8;

export function LineupPicker({
  players, onSave, isSaving, initialSelection = [],
  phase = 'editable', started, pointsLabel, failure,
}: {
  players: PlayerOption[];
  onSave: (lineup: string[]) => void;
  isSaving: boolean;
  initialSelection?: string[];
  /** Editable until the lineup deadline; scored once the XI is confirmed. */
  phase?: LineupPhase;
  /** Ids that actually started, for the scored state. Null while unknown. */
  started?: string[] | null;
  /** What the lineup earned, once it has. */
  pointsLabel?: string | null;
  failure?: string | null;
}) {
  const byId = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const seated = useMemo(() => seatSaved(initialSelection, byId), [initialSelection, byId]);

  const [counts, setCounts] = useState<Counts>(
    seated.counts.DEF + seated.counts.MID + seated.counts.FWD > 0
      ? seated.counts
      : countsForPreset('4-3-3'),
  );
  const [picks, setPicks] = useState<Record<SlotKey, string>>(seated.picks);
  const [fillingSlot, setFillingSlot] = useState<SlotKey | null>(null);
  const [drag, setDrag] = useState<{ from: SlotKey; x: number; y: number; overKey: SlotKey | null } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClick = useRef(false);

  const editable = phase === 'editable';
  const quotas = quotasFor(counts);
  const slots = slotsFor(quotas);
  const startedSet = useMemo(() => new Set(started ?? []), [started]);

  const outfieldTotal = counts.DEF + counts.MID + counts.FWD;
  const chosen = Object.values(picks).filter(Boolean);
  const total = quotas.GK + outfieldTotal;
  const isComplete = outfieldTotal === OUTFIELD_TOTAL && chosen.length === total;

  /** Keeps whoever still has a place under the new counts, in the order picked. */
  const applyCounts = (next: Counts) => {
    const nextQuotas = quotasFor(next);
    const kept: Record<SlotKey, string> = {};
    const used: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const bucket of ROWS) {
      for (let i = 0; i < 11; i++) {
        const id = picks[slotKey(bucket, i)];
        if (!id) continue;
        if (used[bucket] < nextQuotas[bucket]) {
          kept[slotKey(bucket, used[bucket])] = id;
          used[bucket]++;
        }
      }
    }
    setCounts(next);
    setPicks(kept);
    setFillingSlot(null);
  };

  const adjust = (bucket: OutfieldBucket, delta: 1 | -1) => {
    const value = counts[bucket] + delta;
    if (value < 0 || outfieldTotal + delta > OUTFIELD_TOTAL) return;
    applyCounts({ ...counts, [bucket]: value });
  };

  /**
   * Completes whatever is already picked rather than replacing it — a member
   * who has hand-picked three players and taps this once should still see
   * those three, not a fresh eleven that happens to overlap them. Adjusts the
   * shape first, only when the one on screen cannot be filled from this
   * squad, then fills each remaining place with the lowest available shirt
   * number in its line — nothing in the catalogue ranks a player over
   * another, and the whole point is a real, reviewable starting point.
   */
  const autoFill = () => {
    const nextCounts = bestFillCounts(counts, players);
    const nextQuotas = quotasFor(nextCounts);
    const sameShape = nextCounts.DEF === counts.DEF && nextCounts.MID === counts.MID && nextCounts.FWD === counts.FWD;
    const basePicks = sameShape ? picks : (() => {
      const kept: Record<SlotKey, string> = {};
      const used: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
      for (const bucket of ROWS) {
        for (let i = 0; i < 11; i++) {
          const id = picks[slotKey(bucket, i)];
          if (!id) continue;
          if (used[bucket] < nextQuotas[bucket]) { kept[slotKey(bucket, used[bucket])] = id; used[bucket]++; }
        }
      }
      return kept;
    })();

    const slotsNext = slotsFor(nextQuotas);
    const nextPicks: Record<SlotKey, string> = { ...basePicks };
    const taken = new Set(Object.values(nextPicks));

    for (const bucket of ROWS) {
      const available = players
        .filter(p => bucketOf(p.position) === bucket && !taken.has(p.id))
        .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
      let next = 0;
      for (const key of slotsNext[bucket]) {
        if (nextPicks[key]) continue;
        const candidate = available[next];
        if (!candidate) break;
        nextPicks[key] = candidate.id;
        taken.add(candidate.id);
        next++;
      }
    }

    setCounts(nextCounts);
    setPicks(nextPicks);
    setFillingSlot(null);
  };

  const sheetBucket = fillingSlot ? bucketOfSlot(fillingSlot) : null;

  /** Whole squad, always — the row a player is offered for is a suggestion, never a filter. */
  const sheetPlayers = useMemo(() => {
    if (!fillingSlot) return [];
    const taken = new Set(Object.entries(picks).filter(([k]) => k !== fillingSlot).map(([, v]) => v));
    return players
      .filter(p => !taken.has(p.id))
      .sort((a, b) => {
        const aMatch = bucketOf(a.position) === sheetBucket ? 0 : 1;
        const bMatch = bucketOf(b.position) === sheetBucket ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
        return (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999);
      });
  }, [players, picks, fillingSlot, sheetBucket]);

  const fill = (playerId: string) => {
    if (!fillingSlot) return;
    setPicks(prev => ({ ...prev, [fillingSlot]: playerId }));
    setFillingSlot(null);
  };

  const clearSlot = (key: SlotKey) => {
    setPicks(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const swap = (a: SlotKey, b: SlotKey) => {
    if (a === b) return;
    setPicks(prev => {
      const next = { ...prev };
      const playerA = prev[a];
      const playerB = prev[b];
      if (playerB) next[a] = playerB; else delete next[a];
      if (playerA) next[b] = playerA; else delete next[b];
      return next;
    });
  };

  const onSlotPointerDown = (key: SlotKey) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!editable || !picks[key]) return;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onSlotPointerMove = (key: SlotKey) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    if (!drag && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const overKey = el?.closest<HTMLElement>('[data-slot]')?.dataset.slot ?? null;
    setDrag({ from: key, x: e.clientX, y: e.clientY, overKey });
  };

  const endDrag = (key: SlotKey) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current) return;
    if (drag && drag.from === key) {
      if (drag.overKey && drag.overKey !== key) swap(key, drag.overKey);
      // Pointer capture means the click this pointerup is about to synthesise
      // always lands back on the origin slot, wherever the pointer actually
      // is — including bare pitch with no drop target. Any real drag (past
      // the threshold) suppresses that click, landed on a slot or not; only
      // a tap that never became a drag should open the sheet.
      suppressNextClick.current = true;
    }
    dragOrigin.current = null;
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onSlotClick = (key: SlotKey) => () => {
    if (suppressNextClick.current) { suppressNextClick.current = false; return; }
    setFillingSlot(fillingSlot === key ? null : key);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {editable && (
        <div className="flex-none mb-[14px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="tf-kicker text-[var(--text-muted)]">Formation</span>
            <button
              type="button"
              onClick={autoFill}
              disabled={isComplete}
              className="font-heading font-bold text-[10.5px] tracking-[0.04em] text-[var(--text-link)] disabled:opacity-40 disabled:cursor-default"
            >
              AUTO-FILL
            </button>
          </div>
          <div className="flex flex-wrap gap-[6px] mb-[10px]">
            {PRESETS.map(f => {
              const preset = countsForPreset(f);
              const on = preset.DEF === counts.DEF && preset.MID === counts.MID && preset.FWD === counts.FWD;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => applyCounts(preset)}
                  className={`h-[32px] px-[12px] rounded-[8px] font-heading font-bold text-[12px] border ${
                    on
                      ? 'bg-[var(--brand-fill)] border-[var(--brand-fill)] text-[var(--color-on-brand)]'
                      : 'border-[var(--surface-border-strong)] text-[var(--text-secondary)]'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* The shape itself — any split of ten outfield places, not just the
              four quick-picks above. Formation never scores, so there is
              nothing here to protect the member from. */}
          <div className="flex items-stretch gap-[6px]">
            {OUTFIELD.map(bucket => (
              <div key={bucket} className="flex-1 flex items-center justify-between rounded-[10px] border border-[var(--surface-border-strong)] px-[8px] py-[5px]">
                <button
                  type="button"
                  aria-label={`Fewer ${BUCKET_LABEL[bucket].toLowerCase()}s`}
                  disabled={counts[bucket] <= 0}
                  onClick={() => adjust(bucket, -1)}
                  className="w-[22px] h-[22px] rounded-full border border-[var(--surface-border-strong)] grid place-items-center text-[13px] leading-none disabled:opacity-30"
                >
                  −
                </button>
                <span className="flex flex-col items-center px-[4px]">
                  <span className="tf-num font-heading font-bold text-[14px]">{counts[bucket]}</span>
                  <span className="font-heading font-bold text-[8px] tracking-[0.06em] text-[var(--text-muted)]">{bucket}</span>
                </span>
                <button
                  type="button"
                  aria-label={`More ${BUCKET_LABEL[bucket].toLowerCase()}s`}
                  disabled={outfieldTotal >= OUTFIELD_TOTAL}
                  onClick={() => adjust(bucket, 1)}
                  className="w-[22px] h-[22px] rounded-full border border-[var(--surface-border-strong)] grid place-items-center text-[13px] leading-none disabled:opacity-30"
                >
                  +
                </button>
              </div>
            ))}
          </div>
          {outfieldTotal !== OUTFIELD_TOTAL && (
            <p className="text-[10.5px] text-[var(--warn-text)] mt-[6px]">
              {outfieldTotal < OUTFIELD_TOTAL
                ? `${OUTFIELD_TOTAL - outfieldTotal} more outfield place${OUTFIELD_TOTAL - outfieldTotal === 1 ? '' : 's'} to add`
                : `${outfieldTotal - OUTFIELD_TOTAL} too many — plus one goalkeeper is eleven`}
            </p>
          )}
        </div>
      )}

      {/* 3:4 is the pitch's floor, not its shape.
          Sized from width alone it came out 507px on a 412px phone inside a
          709px space, leaving 202px of empty scroll below it — a fifth of the
          screen — while the eleven places were squeezed above. `min-h-full`
          lets it take the height that is there; the rows are distributed with
          `justify-between`, so the extra height goes between them. Where there
          is less room than 3:4 the aspect still wins and this scrolls. */}
      <div className="flex-1 min-h-0 overflow-y-auto tf-scroll">
      <div
        className="relative w-full aspect-[3/4] min-h-full rounded-[12px] overflow-hidden border border-[var(--surface-border)]"
        style={{ background: 'linear-gradient(to bottom, var(--pitch-bg-top), var(--pitch-bg-bottom))' }}
      >
        {/* Markings, drawn together so they read as a pitch. */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--pitch-line)]" />
          <div className="absolute left-1/2 top-1/2 w-[96px] h-[96px] -ml-[48px] -mt-[48px] rounded-full border border-[var(--pitch-line)]" />
          <div className="absolute left-1/2 top-0 w-[140px] h-[46px] -ml-[70px] border border-t-0 border-[var(--pitch-line)] rounded-b-[8px]" />
          <div className="absolute left-1/2 bottom-0 w-[140px] h-[46px] -ml-[70px] border border-b-0 border-[var(--pitch-line)] rounded-t-[8px]" />
        </div>

        <div className="relative h-full p-[18px_12px] flex flex-col justify-between">
          {ROWS.map(bucket => (
            <div key={bucket} className="flex justify-evenly items-start">
              {slots[bucket].map(key => {
                const id = picks[key];
                const player = id ? byId.get(id) : undefined;
                const filling = fillingSlot === key;
                const dragging = drag?.from === key;
                const dropTarget = drag !== null && drag.overKey === key && drag.from !== key;
                const didStart = phase === 'scored' && player ? startedSet.has(player.id) : false;
                const benched = phase === 'scored' && !!player && started != null && !didStart;

                return (
                  <button
                    key={key}
                    type="button"
                    data-slot={key}
                    disabled={!editable}
                    onClick={onSlotClick(key)}
                    onPointerDown={onSlotPointerDown(key)}
                    onPointerMove={onSlotPointerMove(key)}
                    onPointerUp={endDrag(key)}
                    onPointerCancel={endDrag(key)}
                    aria-label={player
                      ? `${player.name}, ${BUCKET_LABEL[bucket].toLowerCase()}${editable ? ' — tap to change, or drag onto another place to swap' : ''}`
                      : `Empty ${BUCKET_LABEL[bucket].toLowerCase()} place — add a player`}
                    className={`w-[62px] flex flex-col items-center gap-[4px] ${editable ? 'cursor-pointer' : 'cursor-default'} ${dragging ? 'opacity-40' : ''}`}
                    /* Only a filled, editable place can start a drag (see
                       onSlotPointerDown), so this is the only thing that
                       needs to opt out of touch scrolling — putting it on
                       the pitch container instead blocked the whole pitch
                       from scrolling on a phone short enough to need it. */
                    style={{ touchAction: editable && player ? 'none' : undefined }}
                  >
                    <span className="relative">
                      <span
                        className="w-[48px] h-[48px] rounded-full grid place-items-center font-heading font-bold text-[13px] transition-transform"
                        style={
                          dropTarget
                            ? { border: '2px solid var(--color-brand)', background: 'var(--accent-surface)', color: 'var(--color-brand)', transform: 'scale(1.08)' }
                            : benched
                              ? { border: '2px dashed var(--pitch-slot-border)', color: 'var(--pitch-slot-text)' }
                              : player
                                ? { background: BUCKET_FILL[bucket], color: 'var(--pos-on)' }
                                : filling
                                  ? { border: '2px solid var(--color-brand)', background: 'var(--accent-surface)', color: 'var(--color-brand)', fontSize: 19, fontWeight: 400 }
                                  : { border: '2px dashed var(--pitch-slot-border)', color: 'var(--pitch-slot-text)', fontSize: 19, fontWeight: 400 }
                        }
                      >
                        {dropTarget ? '⇄' : player ? discLabel(player) : '+'}
                      </span>
                      {phase === 'scored' && player && started != null && (
                        <span
                          className="absolute -right-[3px] -bottom-[3px] w-[18px] h-[18px] rounded-full grid place-items-center font-heading font-bold text-[10px]"
                          style={didStart
                            ? { background: 'var(--color-success)', color: 'var(--tf-white)' }
                            : { background: 'var(--pitch-bg-bottom)', color: 'var(--pitch-slot-text)', border: '1px solid var(--pitch-slot-border)' }}
                        >
                          {didStart ? '✓' : '—'}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-[10px] leading-[1.2] text-center max-w-full truncate"
                      style={player
                        ? { fontWeight: 600, color: benched ? 'var(--pitch-slot-text)' : 'var(--pitch-name)' }
                        : { color: 'var(--pitch-name-empty)' }}
                    >
                      {player ? shortName(player.name) : filling ? 'Filling' : 'Add'}
                    </span>
                    <span
                      className="font-heading font-semibold text-[9px] tracking-[0.06em]"
                      style={{ color: benched ? 'var(--pitch-slot-text)' : 'var(--pitch-pos)' }}
                    >
                      {bucket}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {fillingSlot && (
          <>
            <button
              type="button"
              aria-label="Close the squad list"
              onClick={() => setFillingSlot(null)}
              className="absolute inset-0 bg-[var(--pitch-scrim)]"
            />
            {/* Stops short of the top so the place being filled stays on screen. */}
            <div className="absolute left-0 right-0 bottom-0 top-[38%] bg-[var(--surface-card)] border-t border-[var(--surface-border-strong)] rounded-t-[18px] flex flex-col overflow-hidden">
              <div className="flex-none p-[11px_14px_12px] border-b border-[var(--surface-border)] flex items-center gap-[10px]">
                {/* Whole squad, always — see the module comment on sheetPlayers. */}
                <span className="font-heading font-bold text-[13px] flex-1 min-w-0 truncate">Whole squad</span>
                {picks[fillingSlot] && (
                  <button
                    type="button"
                    onClick={() => { clearSlot(fillingSlot); setFillingSlot(null); }}
                    className="font-heading font-bold text-[10px] tracking-[0.05em] text-[var(--danger-text)]"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto tf-scroll">
                {sheetPlayers.length === 0 ? (
                  <p className="p-[24px_16px] text-center text-[12px] text-[var(--text-muted)]">
                    Everyone in this squad is already on the pitch.
                  </p>
                ) : sheetPlayers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => fill(p.id)}
                    className="w-full text-left flex items-center gap-[11px] p-[11px_14px] border-b border-[var(--surface-border)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <span className="w-[28px] h-[28px] rounded-full grid place-items-center font-heading font-bold text-[11px] flex-none bg-[var(--surface-subtle)] text-[var(--text-secondary)] tf-num">
                      {p.shirtNumber ?? '–'}
                    </span>
                    <span className="flex-1 min-w-0 font-heading font-semibold text-[13px] truncate">{p.name}</span>
                    <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{p.position ?? 'Unlisted'}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* The dragged disc, following the pointer. Pointer-events off so it
            never steals the move/up events it needs to keep tracking, or the
            elementFromPoint read those events depend on to find what is
            underneath it. */}
        {drag && (() => {
          const player = byId.get(picks[drag.from] ?? '');
          if (!player) return null;
          return (
            <span
              aria-hidden
              className="fixed z-50 pointer-events-none w-[48px] h-[48px] -ml-[24px] -mt-[24px] rounded-full grid place-items-center font-heading font-bold text-[13px] shadow-lg"
              style={{ left: drag.x, top: drag.y, background: BUCKET_FILL[bucketOfSlot(drag.from)], color: 'var(--pos-on)', opacity: 0.9 }}
            >
              {discLabel(player)}
            </span>
          );
        })()}
      </div>

      </div>

      <div className="flex-none mt-[14px]">
        {phase === 'scored' ? (
          <div className="flex items-center gap-[14px]">
            <span className="tf-num font-heading font-bold text-[36px] leading-[0.9] tracking-[-1.5px] flex-none">
              {pointsLabel ?? '—'}
            </span>
            <div className="min-w-0">
              <div className="font-heading font-[650] text-[13px]">
                {started == null
                  ? 'Waiting on the confirmed XI'
                  : `${chosen.filter(id => startedSet.has(id)).length} of ${chosen.length} started`}
              </div>
              <p className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">
                A player who did not start scores nothing, and nothing is deducted for them.
              </p>
            </div>
          </div>
        ) : phase === 'locked' ? (
          <p className="text-[11.5px] leading-[1.55] text-[var(--text-muted)]">
            Lineups closed two hours before kick-off. This is what was stored.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-[9px]">
              <div className="flex-1 h-[5px] rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-200"
                  style={{ width: `${Math.round((chosen.length / total) * 100)}%` }}
                />
              </div>
              <span className="tf-num font-heading font-bold text-[11px] flex-none">{chosen.length} of {total}</span>
            </div>
            <button
              type="button"
              disabled={!isComplete || isSaving}
              onClick={() => isComplete && onSave(chosen)}
              className="w-full h-[46px] mt-[12px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[13px] disabled:opacity-40"
            >
              {isSaving ? 'Saving…'
                : isComplete ? 'Save this XI'
                  : outfieldTotal !== OUTFIELD_TOTAL ? 'Finish the formation first'
                    : `Still ${total - chosen.length} to fill`}
            </button>
            {failure && (
              <p role="alert" className="text-[11px] text-[var(--danger-text)] mt-[9px]">{failure}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The current shape if the squad can fill it, otherwise the nearest one it
 * can. A squad running short at one position (a real catalogue gap, not a
 * hypothetical) should not have Auto-fill hand back a shape it cannot
 * complete when a nearby split would go all the way — this only changes the
 * *counts*, and only when the ones already on screen cannot be filled from
 * this squad.
 */
export function bestFillCounts(current: Counts, players: PlayerOption[]): Counts {
  const available: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of players) {
    const bucket = bucketOf(p.position);
    if (bucket) available[bucket]++;
  }
  const currentQuotas = quotasFor(current);
  const currentFillable = Math.min(currentQuotas.GK, available.GK) + Math.min(currentQuotas.DEF, available.DEF)
    + Math.min(currentQuotas.MID, available.MID) + Math.min(currentQuotas.FWD, available.FWD);
  if (currentFillable >= Math.min(11, players.length)) return current;

  let best = current;
  let bestScore = currentFillable;
  for (const f of PRESETS) {
    const counts = countsForPreset(f);
    const q = quotasFor(counts);
    const score = Math.min(q.GK, available.GK) + Math.min(q.DEF, available.DEF)
      + Math.min(q.MID, available.MID) + Math.min(q.FWD, available.FWD);
    if (score > bestScore) { bestScore = score; best = counts; }
  }
  return best;
}
