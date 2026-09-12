import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { LeagueTabs } from '../../components/leagues/LeagueTabs';
import { getLeagueContext } from '@/lib/leagues/league-context';
import { NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';

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

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:p-0 md:bg-[var(--surface-card)] md:border-b md:border-[var(--surface-border)]">
        <div className="flex items-center gap-[11px] md:max-w-[1080px] md:mx-auto md:px-[24px] md:h-[54px] md:items-end">
          <Link
            href="/leagues"
            aria-label="Back to my leagues"
            className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] md:hidden"
          >‹</Link>
          <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-[10px] md:pb-[11px]">
            <div className="font-heading font-[650] md:font-bold text-[17px] md:text-[14.5px] leading-[1.1] tracking-[-0.3px] truncate md:text-[var(--text-primary)]">
              {league.name}
            </div>
            <div className="text-[10.5px] md:text-[11px] text-[var(--nav-text-faint)] md:text-[var(--text-muted)] mt-[4px] md:mt-0">
              {competition}
            </div>
          </div>
        </div>
      </header>

      <LeagueTabs leagueId={id} badge={unansweredBadge} />

      <main className="tf-scroll flex-1 overflow-auto pb-[86px] md:pb-[26px]">
        {/* One column for every screen, so a tab switch never reflows the page. */}
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:pt-[20px]">
          {children}
        </div>
      </main>
    </div>
  );
}
