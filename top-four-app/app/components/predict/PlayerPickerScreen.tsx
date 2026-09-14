'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '../Breadcrumb';
import { PlayerPickerPanel } from './PlayerPickerPanel';
import { MARKET_COPY, type PickerMarket, type PickerSquad } from '@/lib/predict/player-picker';

/**
 * The player picker — one component for both platforms.
 *
 * Search, filtering and the pick itself all live here; the squads arrive from
 * the server already shaped. The saved pick is preselected, so reopening the
 * screen shows what the server actually holds rather than an empty list.
 */

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
  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <Breadcrumb trail={[
        { label: 'Leagues', href: '/leagues' },
        { label: leagueName, href: `/leagues/${leagueId}/fixtures` },
        { label: 'Fixture', href: backHref },
        { label: MARKET_COPY[market].title },
      ]} />

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="flex items-center gap-[11px] md:max-w-[880px] md:mx-auto md:px-[24px] md:py-[18px]">
          <Link href={backHref} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] truncate">{MARKET_COPY[market].title}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px] truncate">
              {squads[0]?.name} v {squads[1]?.name}
            </div>
          </div>
          {price && <span className="font-heading font-bold text-[11px] text-[var(--nav-accent)] flex-none">{price}</span>}
        </div>
      </header>

      <PlayerPickerPanel
        leagueId={leagueId}
        fixtureId={fixtureId}
        market={market}
        squads={squads}
        savedPlayerId={savedPlayerId}
        expectedVersion={expectedVersion}
        snapshotId={snapshotId}
        price={price}
        onSaved={() => router.push(backHref)}
      />
    </div>
  );
}
