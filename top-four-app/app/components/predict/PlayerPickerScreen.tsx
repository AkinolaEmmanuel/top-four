'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSubmitPrediction } from '@/hooks/api/useFixturePrediction';
import { ApiError } from '@/lib/api/fetcher';
import {
  MARKET_COPY, MARKET_TYPE, matches, playerMeta, positionsIn,
  type PickerMarket, type PickerSquad,
} from '@/lib/predict/player-picker';

/**
 * The player picker — one component for both platforms.
 *
 * Search, filtering and the pick itself all live here; the squads arrive from
 * the server already shaped. The saved pick is preselected, so reopening the
 * screen shows what the server actually holds rather than an empty list.
 */

const TINTS = [
  'var(--ident-1)', 'var(--ident-2)', 'var(--ident-3)', 'var(--ident-4)',
  'var(--ident-5)', 'var(--ident-6)', 'var(--ident-7)',
];

export function PlayerPickerScreen({
  leagueId, fixtureId, market, squads, savedPlayerId, expectedVersion, snapshotId, price, leagueName, backHref,
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
  leagueName: string;
  backHref: string;
}) {
  const router = useRouter();
  const submit = useSubmitPrediction(leagueId, fixtureId);

  const [picked, setPicked] = useState<string | null>(savedPlayerId);
  const [search, setSearch] = useState('');
  const [side, setSide] = useState<'both' | 'home' | 'away'>('both');
  const [position, setPosition] = useState('All');
  const [failed, setFailed] = useState<string | null>(null);

  const copy = MARKET_COPY[market];
  const positions = ['All', ...positionsIn(squads)];
  const visible = squads
    .filter(squad => side === 'both' || squad.side === side)
    .map(squad => ({ ...squad, players: squad.players.filter(p => matches(p, search, position)) }));
  const shown = visible.reduce((n, s) => n + s.players.length, 0);

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
        onSuccess: () => router.push(backHref),
        onError: error => setFailed(
          error instanceof ApiError && error.status === 409
            ? 'Changed somewhere else — go back and reopen to see the stored pick.'
            : error instanceof Error && error.message ? error.message : 'Not saved.',
        ),
      },
    );
  };

  const chip = (on: boolean) =>
    `flex items-center h-[32px] px-[13px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`;

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="flex items-center gap-[11px] md:max-w-[880px] md:mx-auto md:px-[24px] md:py-[18px]">
          <Link href={backHref} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] truncate">{copy.title}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px] truncate">
              {squads[0]?.name} v {squads[1]?.name}{leagueName ? ` · ${leagueName}` : ''}
            </div>
          </div>
          {price && <span className="font-heading font-bold text-[11px] text-[var(--nav-accent)] flex-none">{price}</span>}
        </div>
      </header>

      <div className="flex-none px-[var(--gutter)] md:px-0 pt-[12px] md:max-w-[880px] md:mx-auto md:w-full md:px-[24px]">
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

      <main className="tf-scroll flex-1 overflow-auto">
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
          ) : visible.map(squad => squad.players.length > 0 && (
            <section key={squad.side} className="mt-[16px]">
              <div className="flex items-baseline justify-between p-[0_var(--gutter)_8px] md:px-0">
                <span className="tf-kicker text-[var(--text-muted)]">{squad.name}</span>
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
                    className={`w-full text-left flex items-center gap-[11px] p-[11px_var(--gutter)] md:px-[6px] border-t border-[var(--surface-border)] ${on ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}
                  >
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
