'use client';

import { useMemo, useState } from 'react';
import type { PlayerOption } from '@/lib/predict/fixture-predict';

/**
 * The starting XI, picked slot by slot.
 *
 * This used to be a list of sixty names with tick boxes and a pitch that only
 * displayed the result. The design is the other way round: the pitch is the
 * control. You choose a shape, you get eleven empty places in it, and tapping
 * one offers the players who can fill it. That ordering is also what stops a
 * goalkeeper filling a midfield slot — the slot decides who it will take, not
 * the picker.
 */

export type Bucket = 'GK' | 'DEF' | 'MID' | 'FWD';

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '5-3-2'] as const;

/** Top of the pitch to the bottom, which is how a teamsheet is drawn. */
const ROWS: Bucket[] = ['FWD', 'MID', 'DEF', 'GK'];

const BUCKET_LABEL: Record<Bucket, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
};

/** Orientation only. Position never scores; the colour says where you are. */
const BUCKET_FILL: Record<Bucket, string> = {
  GK: 'var(--pos-gk)', DEF: 'var(--pos-df)', MID: 'var(--pos-mf)', FWD: 'var(--pos-fw)',
};

function quotasFor(formation: string): Record<Bucket, number> {
  const [def, mid, fwd] = formation.split('-').map(Number);
  return { GK: 1, DEF: def, MID: mid, FWD: fwd };
}

/**
 * The catalogue's position, mapped to a line.
 *
 * Deliberately does not guess. An earlier version fell through to 'MID', so
 * every player looked like a midfielder, a goalkeeper filled a midfield slot,
 * and the keeper quota could never be met — which left Save permanently
 * disabled with nothing on screen saying why.
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

/** `DEF2` — a line and a place in it. Stable across a formation change. */
type SlotKey = string;
const slotKey = (bucket: Bucket, index: number): SlotKey => `${bucket}${index}`;

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
 * Rebuilds the slot map from a saved XI.
 *
 * A stored lineup is eleven ids and nothing else — no formation, no places — so
 * the shape is inferred from the players' own positions. If they do not fall
 * into a preset the member is asked to choose one rather than shown a shape the
 * product invented.
 */
function seatSaved(ids: string[], byId: Map<string, PlayerOption>):
{ formation: string | null; picks: Record<SlotKey, string> } {
  const counts: Record<Bucket, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const picks: Record<SlotKey, string> = {};

  for (const id of ids) {
    const player = byId.get(id);
    const bucket = player ? bucketOf(player.position) : null;
    if (!bucket) return { formation: null, picks: {} };
    picks[slotKey(bucket, counts[bucket])] = id;
    counts[bucket]++;
  }

  const label = `${counts.DEF}-${counts.MID}-${counts.FWD}`;
  const known = (FORMATIONS as readonly string[]).includes(label);
  return { formation: known && counts.GK === 1 ? label : null, picks: known ? picks : {} };
}

export type LineupPhase = 'editable' | 'locked' | 'scored';

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

  const [formation, setFormation] = useState<string | null>(seated.formation);
  const [picks, setPicks] = useState<Record<SlotKey, string>>(seated.picks);
  const [fillingSlot, setFillingSlot] = useState<SlotKey | null>(null);
  const [showWholeSquad, setShowWholeSquad] = useState(false);

  const editable = phase === 'editable';
  const quotas = formation ? quotasFor(formation) : null;
  const slots = quotas ? slotsFor(quotas) : null;
  const startedSet = useMemo(() => new Set(started ?? []), [started]);

  const chosen = Object.values(picks).filter(Boolean);
  const total = quotas ? quotas.GK + quotas.DEF + quotas.MID + quotas.FWD : 11;
  const isComplete = chosen.length === total;

  const changeFormation = (next: string) => {
    // Keep whoever still has a place in the new shape, in the order they were
    // picked — re-choosing nine players to try 4-4-2 is not a decision anybody
    // wants to make twice.
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
    setFormation(next);
    setPicks(kept);
    setFillingSlot(null);
  };

  const fillingBucket = fillingSlot ? (fillingSlot.replace(/\d+$/, '') as Bucket) : null;

  const sheetPlayers = useMemo(() => {
    if (!fillingBucket) return [];
    const taken = new Set(Object.entries(picks).filter(([k]) => k !== fillingSlot).map(([, v]) => v));
    return players
      .filter(p => !taken.has(p.id))
      .filter(p => showWholeSquad || bucketOf(p.position) === fillingBucket)
      .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
  }, [players, picks, fillingSlot, fillingBucket, showWholeSquad]);

  const fill = (playerId: string) => {
    if (!fillingSlot) return;
    setPicks(prev => ({ ...prev, [fillingSlot]: playerId }));
    setFillingSlot(null);
    setShowWholeSquad(false);
  };

  const clearSlot = (key: SlotKey) => {
    setPicks(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /*
   * A column that fills its container rather than one that grows.
   *
   * The pitch used to be `aspect-[3/4]` of the full width — around 670px tall in
   * a 500px dialog — so the whole picker overflowed and Save sat below the fold,
   * which is the one control the screen exists to reach. The pitch now takes the
   * height that is left after the shape chips and the footer, and the footer
   * never scrolls away.
   */
  return (
    <div className="flex flex-col h-full min-h-0">
      {editable && (
        <div className="flex-none mb-[14px]">
          <div className="tf-kicker text-[var(--text-muted)] mb-[8px]">
            {formation ? 'Formation' : 'Choose a shape to start picking'}
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {FORMATIONS.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={formation === f}
                onClick={() => changeFormation(f)}
                className={`h-[32px] px-[12px] rounded-[8px] font-heading font-bold text-[12px] border ${
                  formation === f
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-on-brand)]'
                    : 'border-[var(--surface-border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* The pitch keeps its own proportions — it is a pitch, and squashing it
          to fit reads as a broken graphic. What changed is that this scrolls and
          the footer below does not, so Save is never the thing pushed off. */}
      <div className="flex-1 min-h-0 overflow-y-auto tf-scroll">
      <div
        className="relative w-full aspect-[3/4] rounded-[12px] overflow-hidden border border-[var(--surface-border)]"
        style={{ background: 'linear-gradient(to bottom, var(--pitch-bg-top), var(--pitch-bg-bottom))' }}
      >
        {/* Markings, drawn together so they read as a pitch. */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--pitch-line)]" />
          <div className="absolute left-1/2 top-1/2 w-[96px] h-[96px] -ml-[48px] -mt-[48px] rounded-full border border-[var(--pitch-line)]" />
          <div className="absolute left-1/2 top-0 w-[140px] h-[46px] -ml-[70px] border border-t-0 border-[var(--pitch-line)] rounded-b-[8px]" />
          <div className="absolute left-1/2 bottom-0 w-[140px] h-[46px] -ml-[70px] border border-b-0 border-[var(--pitch-line)] rounded-t-[8px]" />
        </div>

        {slots ? (
          <div className="relative h-full p-[18px_12px] flex flex-col justify-between">
            {ROWS.map(bucket => (
              <div key={bucket} className="flex justify-evenly items-start">
                {slots[bucket].map(key => {
                  const id = picks[key];
                  const player = id ? byId.get(id) : undefined;
                  const filling = fillingSlot === key;
                  const didStart = phase === 'scored' && player ? startedSet.has(player.id) : false;
                  const benched = phase === 'scored' && !!player && started != null && !didStart;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!editable}
                      onClick={() => setFillingSlot(filling ? null : key)}
                      aria-label={player
                        ? `${player.name}, ${BUCKET_LABEL[bucket].toLowerCase()}${editable ? ' — change' : ''}`
                        : `Empty ${BUCKET_LABEL[bucket].toLowerCase()} place — add a player`}
                      className={`w-[62px] flex flex-col items-center gap-[4px] ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="relative">
                        <span
                          className="w-[48px] h-[48px] rounded-full grid place-items-center font-heading font-bold text-[13px] transition-transform"
                          style={
                            benched
                              ? { border: '2px dashed var(--pitch-slot-border)', color: 'var(--pitch-slot-text)' }
                              : player
                                ? { background: BUCKET_FILL[bucket], color: 'var(--pos-on)' }
                                : filling
                                  ? { border: '2px solid var(--color-brand)', background: 'var(--accent-surface)', color: 'var(--color-brand)', fontSize: 19, fontWeight: 400 }
                                  : { border: '2px dashed var(--pitch-slot-border)', color: 'var(--pitch-slot-text)', fontSize: 19, fontWeight: 400 }
                          }
                        >
                          {player ? discLabel(player) : '+'}
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
        ) : (
          <div className="relative h-full grid place-items-center p-[24px] text-center">
            <p className="text-[12.5px] leading-[1.6] text-[var(--pitch-name-empty)] max-w-[260px]">
              Pick a shape above. The places appear on the pitch and each one offers the players who
              can fill it.
            </p>
          </div>
        )}

        {fillingSlot && (
          <>
            <button
              type="button"
              aria-label="Close the squad list"
              onClick={() => { setFillingSlot(null); setShowWholeSquad(false); }}
              className="absolute inset-0 bg-[var(--pitch-scrim)]"
            />
            {/* Stops short of the top so the place being filled stays on screen. */}
            <div className="absolute left-0 right-0 bottom-0 top-[38%] bg-[var(--surface-card)] border-t border-[var(--surface-border-strong)] rounded-t-[18px] flex flex-col overflow-hidden">
              <div className="flex-none p-[11px_14px_12px] border-b border-[var(--surface-border)] flex items-center gap-[10px]">
                <span className="font-heading font-bold text-[13px] flex-1 min-w-0 truncate">
                  {showWholeSquad ? 'Whole squad' : `${BUCKET_LABEL[fillingBucket ?? 'MID']}s`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowWholeSquad(v => !v)}
                  className="font-heading font-bold text-[10px] tracking-[0.05em] text-[var(--text-link)]"
                >
                  {showWholeSquad ? 'BY POSITION' : 'SHOW ALL'}
                </button>
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
                    {showWholeSquad
                      ? 'Everyone in this squad is already on the pitch.'
                      : `The catalogue lists no available ${BUCKET_LABEL[fillingBucket ?? 'MID'].toLowerCase()} for this team. Show all to pick anyway.`}
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
                  : !formation ? 'Choose a shape first'
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
