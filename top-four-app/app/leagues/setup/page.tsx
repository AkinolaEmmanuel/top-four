import { redirect } from 'next/navigation';
import { LeagueSetupScreen } from '../../components/leagues/LeagueSetupScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import type { Api } from '@/lib/api/types';
import { roundLabel, type SetupCompetition, type SetupRound, type SetupStage } from '@/lib/leagues/league-setup';
import type { CatalogueCompetition, CatalogueSeason } from '@/lib/api/catalogue';

/**
 * League setup, with its catalogue read on the server.
 *
 * This used to walk the catalogue in the browser after hydration — one request
 * for the competitions, then a seasons request and a stages request for each of
 * them, in sequence. Six competitions meant thirteen serial round-trips before
 * the first round could be drawn. They are issued together here instead, and
 * the stage and round ids survive the trip, which is what lets a league be
 * scoped to a round rather than always to a whole season.
 */

// The catalogue module already narrows what the schema leaves as a bare object.
type Competition = CatalogueCompetition;
type Season = CatalogueSeason;
type Stage = { id: string; name: string; kind: string; sortOrder: number; rounds: Round[] };
type Round = { id: string; name: string; sortOrder: number };

/** The catalogue is the same for everyone and changes rarely. */
const CATALOGUE_TTL_SECONDS = 300;

function toSetupCompetition(
  competition: Competition,
  season: Season,
  stages: Stage[],
): SetupCompetition {
  const ordered = stages.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const setupStages: SetupStage[] = ordered.map(stage => ({ id: stage.id, name: stage.name }));

  const rounds: SetupRound[] = ordered
    .flatMap(stage =>
      stage.rounds
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((round, index) => ({
          stageId: stage.id,
          roundId: round.id,
          label: roundLabel(round.name, index),
          full: round.name,
        })),
    );

  return {
    id: competition.slug,
    supportedCompetitionId: competition.id,
    seasonId: season.id,
    name: competition.displayName,
    abbr: competition.shortName?.slice(0, 3).toUpperCase() || competition.displayName.slice(0, 3).toUpperCase(),
    season: season.label,
    logoUrl: competition.logoUrl ?? null,
    stages: setupStages,
    rounds,
  };
}

export default async function LeagueSetupPage() {
  let competitions: Competition[];
  try {
    competitions = await serverFetch<Competition[]>('/football/catalogue/competitions', {
      revalidate: CATALOGUE_TTL_SECONDS,
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/leagues/setup');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/leagues/setup');
    throw error;
  }

  // Every competition's season, then every chosen season's stages — two waves
  // of parallel reads rather than one long chain.
  const seasonsPer = await Promise.all(
    competitions.map(c =>
      serverFetchOrNull<Season[]>(`/football/catalogue/competitions/${c.id}/seasons`, {
        revalidate: CATALOGUE_TTL_SECONDS,
      }),
    ),
  );

  const selectable = competitions.flatMap((competition, index) => {
    const seasons = seasonsPer[index] ?? [];
    const season = seasons.find(s => s.selectableForNewLeague) ?? seasons[0];
    return season ? [{ competition, season }] : [];
  });

  const stagesPer = await Promise.all(
    selectable.map(({ season }) =>
      serverFetchOrNull<Stage[]>(`/football/catalogue/seasons/${season.id}/stages`, {
        revalidate: CATALOGUE_TTL_SECONDS,
      }),
    ),
  );

  const setupCompetitions = selectable
    .map(({ competition, season }, index) =>
      toSetupCompetition(competition, season, stagesPer[index] ?? []))
    // A competition with no rounds cannot be scoped, so it is not offered.
    .filter(c => c.rounds.length > 0);

  // The cap, stated before any effort is spent on a league that cannot be made.
  const leagues = await serverFetchOrNull<Api<'LeagueListResponseDto'>>('/leagues');

  return (
    <LeagueSetupScreen
      competitions={setupCompetitions}
      placesUsed={leagues?.unfinishedLeagueCount ?? 0}
      placesLimit={leagues?.unfinishedLeagueLimit ?? 20}
    />
  );
}
