import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { LeagueRulesScreen } from '../../../components/leagues/LeagueRulesScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { LeagueContentSkeleton } from '@/app/components/leagues/LeagueContentSkeleton';
import { getLeague } from '@/lib/leagues/league-context';
import {
  lateJoinLabel, lockMinutes, maxPointsNote, maxPointsPerFixture,
  toMarketRules, toTiebreakerLabels, type CompetitionRule,
} from '@/lib/leagues/league-rules';
import type { Api } from '@/lib/api/types';
import type { CatalogueSeason } from '@/lib/api/catalogue';

/**
 * The league rules, fetched on the server.
 *
 * Everything except the season labels comes from the league read itself. A
 * scope's round bounds are stage and round ids rather than round numbers, so a
 * partial season is described by its kind — printing the ids gave
 * "Rounds [object Object]–[object Object]".
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Preferences = Api<'NotificationPreferencesResponseDto'>;

const SCOPE_LABELS: Record<string, string> = {
  full_season: 'Full season',
  single_round: 'One round',
  round_range: 'Part of the season',
};

export default function LeagueRulesPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LeagueContentSkeleton rows={5} />}>
      <Rules params={params} />
    </Suspense>
  );
}

async function Rules({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let preferences: Preferences | null;

  try {
    [league, preferences] = await Promise.all([
      getLeague(id),
      serverFetchOrNull<Preferences>('/me/notification-preferences'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/rules`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/rules`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const scopes = league.ruleset?.competitionScopes ?? [];
  const named = new Map(league.competitions.map(c => [c.supportedCompetitionId, c.displayName]));

  const competitions: CompetitionRule[] = await Promise.all(scopes.map(async scope => {
    const seasons = await serverFetchOrNull<CatalogueSeason[]>(
      `/football/catalogue/competitions/${scope.supportedCompetitionId}/seasons`,
      { revalidate: 3600 },
    );
    return {
      name: named.get(scope.supportedCompetitionId) ?? 'Competition',
      scope: SCOPE_LABELS[scope.kind] ?? 'Part of the season',
      season: seasons?.find(s => s.id === scope.seasonId)?.label ?? '',
    };
  }));

  const role = league.membership?.role;

  return (
    <LeagueRulesScreen
      leagueId={id}
      leagueName={league.name}
      description={league.description ?? ''}
      version={league.version}
      canEdit={role === 'owner' || role === 'admin'}
      markets={toMarketRules(league.ruleset)}
      competitions={competitions}
      maxPoints={maxPointsPerFixture(league.ruleset)}
      maxNote={maxPointsNote(league.ruleset)}
      tiebreakers={toTiebreakerLabels(league.ruleset)}
      lockMinutes={lockMinutes(league.ruleset)}
      lateJoin={lateJoinLabel(league.ruleset)}
      invitationsOn={league.invitationSettings?.enabled !== false}
      approvalRequired={!!league.invitationSettings?.joinApprovalRequired}
      remindersOn={preferences?.data.round_reminder !== false}
    />
  );
}
