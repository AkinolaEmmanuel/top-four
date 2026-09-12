'use client';

import { useState } from 'react';
import { useSubmitPrediction } from '@/hooks/api/useFixturePrediction';
import { failureMessage } from '@/lib/api/failure';
import {
  MARKET_COPY, MARKET_TYPE, matches, playerMeta, positionsIn,
  type PickerMarket, type PickerSquad,
} from '@/lib/predict/player-picker';

/**
 * Search, filter and pick one player from both squads.
 *
 * Shared by the route and by the dialog the fixture opens over itself — the
 * design's own container for this. Which one it is in decides only the chrome
 * around it and what happens after a save; the choosing is the same either way.
 */

const TINTS = [
  'var(--ident-0)', 'var(--ident-1)', 'var(--ident-2)', 'var(--ident-3)',
  'var(--ident-4)', 'var(--ident-5)', 'var(--ident-6)', 'var(--ident-7)',
];

export function PlayerPickerPanel({
  leagueId, fixtureId, market, squads, savedPlayerId, expectedVersion, snapshotId, price,
  onSaved, onClose,
}: {
  leagueId: string;
  fixtureId: string;
  market: PickerMarket;
  squads: PickerSquad[];
  savedPlayerId: string | null;
  expectedVersion: number;
  /** Null while the squad list is still being built, which blocks saving. */
  snapshotId: string | null;
  price: string;
  /** Given the stored id and the version it now carries. */
  onSaved: (playerId: string, version: number) => void;
  /** Present in a dialog, absent on the route, which has a breadcrumb instead. */
  onClose?: () => void;
}) {
  const submit = useSubmitPrediction(leagueId, fixtureId);

  const [picked, setPicked] = useState<string | null>(savedPlayerId);
  const [search, setSearch] = useState('');
  const [side, setSide] = useState<'both' | 'home' | 'away'>('both');
  const [position, setPosition] = useState('All');
  const [failed, setFailed] = useState<string | null>(null);

  const copy = MARKET_COPY[market];
  const positions = ['All', ...positionsIn(squads)];
  const withBoth = squads.filter(squad => side === 'both' || squad.side === side);
  const visible = withBoth
    .map(squad => ({ ...squad, players: squad.players.filter(p => matches(p, search, position)) }));
  const shown = visible.reduce((n, squad) => n + squad.players.length, 0);

  const save = () => {
    if (!picked || submit.isPending) return;
    if (!snapshotId) {
      setFailed('The squad list is still loading — try again in a moment.');
      return;
    }
    setFailed(null);
    submit.mutate(
      { marketType: MARKET_TYPE[market], expectedVersion, answer: { playerId: picked, snapshotId } },
      {
        onSuccess: result => onSaved(picked, result?.version ?? expectedVersion + 1),
        onError: error => setFailed(failureMessage(error, 'Not saved.')),
      },
    );
  };

  const chip = (on: boolean) =>
    `flex items-center h-[32px] px-[13px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {onClose && (
        <div className="flex-none flex items-center gap-[10px] p-[14px_16px] border-b border-[var(--surface-border)]">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-bold text-[15px] truncate">{copy.title}</h2>
            <p className="text-[10.5px] text-[var(--text-muted)] mt-[2px] truncate">{squads[0]?.name} v {squads[1]?.name}</p>
          </div>
          <span className="font-heading font-bold text-[11px] text-[var(--text-link)] flex-none">{price}</span>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[22px] leading-none text-[var(--text-muted)] flex-none">×</button>
        </div>
      )}

      <div className="flex-none px-[var(--gutter)] md:px-[16px] pt-[12px]">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search both squads"
          aria-label="Search both squads"
          className="w-full h-[42px] px-[14px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] text-[13px] text-[var(--text-primary)]"
        />

        <div className="tf-scroll flex gap-[6px] mt-[10px] overflow-x-auto">
          {(['both', 'home', 'away'] as const).map(id => (
            <button key={id} type="button" aria-pressed={side === id} onClick={() => setSide(id)} className={chip(side === id)}>
              {id === 'both' ? 'Both teams' : squads.find(s => s.side === id)?.name ?? id}
            </button>
          ))}
        </div>

        <div className="tf-scroll flex gap-[6px] mt-[8px] pb-[12px] overflow-x-auto border-b border-[var(--surface-border)]">
          {positions.map(p => (
            <button key={p} type="button" aria-pressed={position === p} onClick={() => setPosition(p)} className={chip(position === p)}>{p}</button>
          ))}
        </div>
      </div>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto">
        <div className="md:max-w-[880px] md:mx-auto md:px-[24px]">
          {shown === 0 ? (
            <div className="p-[60px_30px] text-center">
              <div className="font-heading font-bold text-[17px] tracking-[-0.4px]">No player matches that</div>
              <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px] max-w-[320px] mx-auto">
                Search filters the squads TopFour holds for this match — it cannot add a player to them.
              </p>
              <button type="button" onClick={() => { setSearch(''); setPosition('All'); setSide('both'); }} className="mt-[18px] font-heading font-bold text-[11px] text-[var(--text-link)]">
                CLEAR THE FILTERS
              </button>
            </div>
          ) : (
            /* Side by side at width. One squad above the other means scrolling
               past eleven names to compare the two, which is the comparison the
               screen exists to support. */
            <div className={`md:grid md:gap-0 ${withBoth.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {visible.map(squad => squad.players.length > 0 && (
              <section key={squad.side} className="mt-[16px] md:mt-0 md:border-l md:border-[var(--surface-border)] md:first:border-l-0">
                <div className="flex items-center gap-[10px] p-[0_var(--gutter)_8px] md:sticky md:top-0 md:z-10 md:p-[11px_16px] md:bg-[var(--surface-subtle)] md:border-b md:border-[var(--surface-border)]">
                  <span className="tf-kicker text-[var(--text-muted)] flex-1 md:flex-none md:text-[12.5px] md:normal-case md:tracking-normal md:font-bold md:text-[var(--text-primary)]">{squad.name}</span>
                  <span className="md:flex-1" />
                  <span className="text-[10px] text-[var(--text-muted)] tf-num">{squad.players.length} shown</span>
                </div>
                {squad.players.map((player, i) => {
                  const on = picked === player.id;
                  return (
                    <button
                      key={player.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked(player.id)}
                      className={`w-full text-left flex items-center gap-[11px] p-[11px_var(--gutter)] md:px-[16px] border-t border-[var(--surface-border)] ${on ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}
                    >
                      {/* The shirt is its own column here: a teamsheet is
                          numbered, and two players can share a short name. */}
                      <span className="hidden md:block w-[22px] text-right flex-none font-heading font-semibold text-[11px] text-[var(--text-muted)] tf-num">
                        {player.shirt ?? '–'}
                      </span>
                      <span className="w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]" style={{ background: TINTS[i % TINTS.length] }}>
                        {player.initials}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13px] truncate">{player.name}</div>
                        <div className="text-[10.5px] text-[var(--text-muted)] mt-[2px]">{playerMeta(player)}</div>
                      </div>
                      {on && <span className="text-[var(--color-brand)] text-[15px] flex-none">✓</span>}
                    </button>
                  );
                })}
              </section>
            ))}
            </div>
          )}

          <p className="p-[18px_var(--gutter)_20px] md:px-0 text-[11px] leading-[1.6] text-[var(--text-muted)]">{copy.rule}</p>
        </div>
      </main>

      <footer className="flex-none border-t border-[var(--surface-border)] bg-[var(--surface-card)] p-[12px_var(--gutter)_calc(12px+env(safe-area-inset-bottom))] md:px-[24px]">
        <div className="md:max-w-[880px] md:mx-auto flex items-center gap-[12px]">
          <div className="flex-1 min-w-0 text-[11.5px]">
            {failed
              ? <span role="alert" className="text-[var(--danger-text)]">{failed}</span>
              : picked
                ? <span className="text-[var(--success-text)]">Ready to save — you can change it until the lock.</span>
                : <span className="text-[var(--text-muted)]">Pick one player.</span>}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!picked || submit.isPending}
            className={`h-[46px] px-[22px] rounded-[12px] font-heading font-bold text-[12.5px] flex-none ${picked ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'}`}
          >
            {submit.isPending ? 'Saving…' : 'Save pick'}
          </button>
        </div>
      </footer>
    </div>
  );
}
