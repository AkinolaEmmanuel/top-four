import { cache } from 'react';
import { serverFetch, serverFetchOrNull } from '@/lib/api/server-fetch';
import type { Api } from '@/lib/api/types';

/**
 * The league identity every screen under `/leagues/[id]` shows.
 *
 * Wrapped in React's `cache` so the layout and the page it wraps share one
 * read per request: without it, hoisting the chrome into the layout would have
 * added a second league fetch to every navigation rather than removing work.
 */

export interface LeagueContext {
  league: Api<'LeagueReadResponseDto'>;
  /** Unanswered markets, capped — a four-digit badge is wider than its tab. */
  unansweredBadge: string;
  competition: string;
}

/** The same dashboard read the context already made, shared with the pages. */
export const getLeagueDashboard = cache(async (leagueId: string) =>
  serverFetchOrNull<Api<'LeagueDashboardResponseDto'>>(`/leagues/${leagueId}/dashboard`));

/**
 * The league itself. Every screen under `/leagues/[id]` needs it and the layout
 * needs it too, so it is read once per request and shared — seven pages were
 * each issuing their own copy of this alongside the layout's.
 */
export const getLeague = cache(async (leagueId: string) =>
  serverFetch<Api<'LeagueReadResponseDto'>>(`/leagues/${leagueId}`));

export const getLeagueContext = cache(async (leagueId: string): Promise<LeagueContext> => {
  const [league, dashboard] = await Promise.all([
    getLeague(leagueId),
    getLeagueDashboard(leagueId),
  ]);

  const unanswered = dashboard?.data.summary.predictionCompleteness.unanswered ?? 0;

  return {
    league,
    unansweredBadge: unanswered > 0 ? (unanswered > 99 ? '99+' : String(unanswered)) : '',
    competition: league.competitions[0]?.displayName ?? '',
  };
});

