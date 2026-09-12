import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { LeagueTabs } from '../../components/leagues/LeagueTabs';
import { LeagueContextBar } from '../../components/leagues/LeagueContextBar';
import { getLeagueContext } from '@/lib/leagues/league-context';
import { NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { pluralise } from '@/lib/format';
import { lifecycleBadge } from '@/lib/leagues/lifecycle';

/**
 * The chrome every league screen shares: identity, tabs, and one content column.
 *
 * It lives here rather than in each screen because a layout does not remount
 * when you move between the routes it wraps. Each screen used to draw its own
 * header — Table's was a tall hero, Fixtures' a 54px bar — and its own content
 * width, from 680px to 1080px, so switching tabs changed the shape of the page
 * and moved everything under it. The chrome is now invariant; only the content
 * below it varies, and a screen that wants a hero puts it in its own content.
 *
 * A shape check first: a mistyped id is not a failure at our end, and letting
 * it reach the API turns it into a 400 and then the unexpected-failure screen.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function LeagueLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const id = params.id;
  if (!UUID.test(id)) notFound();

  let context;
  try {
    context = await getLeagueContext(id);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const { league, competition, unansweredBadge } = context;
  const memberLabel = league.memberCount > 0 ? pluralise(league.memberCount, 'member') : '';
  const badge = lifecycleBadge(league.lifecycleState);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      {/* Phones keep the design's dark header: a back chevron, the league, its
          competition. Wide screens get the design's level two instead — one
          54px bar with the league on the left and its tabs pushed right, rather
          than the two stacked bars this used to draw. */}
      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:hidden">
        <div className="flex items-center gap-[11px]">
          <Link
            href="/leagues"
            aria-label="Back to my leagues"
            className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]"
          >‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px] truncate">
              {league.name}
            </div>
            <div className="flex items-center gap-[7px] mt-[5px] min-w-0">
              <span
                className="font-heading font-bold text-[8.5px] tracking-[0.07em] px-[6px] py-[2px] rounded-[4px] flex-none uppercase"
                style={{ background: 'var(--nav-fill)', color: 'var(--nav-text)' }}
              >
                {badge.label}
              </span>
              <span className="text-[10.5px] text-[var(--nav-text-faint)] truncate">
                {memberLabel ? `${competition} · ${memberLabel}` : competition}
              </span>
            </div>
          </div>
        </div>
      </header>

      <LeagueContextBar
        leagueId={id}
        leagueName={league.name}
        meta={memberLabel ? `${competition} · ${memberLabel}` : competition}
        lifecycleState={league.lifecycleState}
        unansweredBadge={unansweredBadge}
      />

      <LeagueTabs leagueId={id} badge={unansweredBadge} variant="phone" />

      {/* No column here. Each screen puts its own content in one — see
          LeagueColumn — because a band has to be able to run the full width,
          and anything the layout wraps is wrapped whether it is content or not. */}
      <main className="tf-scroll flex-1 min-h-0 overflow-auto pb-[86px] md:pb-[26px]">
        {children}
      </main>
    </div>
  );
}
