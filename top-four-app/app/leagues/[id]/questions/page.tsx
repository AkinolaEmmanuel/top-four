import { notFound, redirect } from 'next/navigation';
import { LeagueQuestionsScreen } from '../../../components/leagues/LeagueQuestionsScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPagesOrEmpty, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { toQuestionCard } from '@/lib/leagues/league-questions';
import type { Api } from '@/lib/api/types';
import type { CustomQuestion, OwnCustomAnswerData } from '@/lib/api/custom-questions';

/**
 * Custom questions, fetched on the server.
 *
 * The member's own answer to each question is a separate read per question —
 * the API has no batch form — so they are issued together rather than in the
 * sequence of hooks this screen used to run.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Questions = Api<'CustomQuestionPageResponseDto'>;

export default async function LeagueQuestionsPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let questions: { items: CustomQuestion[] };

  try {
    [league, questions] = await Promise.all([
      serverFetch<LeagueRead>(`/leagues/${id}`),
      serverFetchAllPagesOrEmpty<CustomQuestion, Questions>(`/leagues/${id}/custom-questions`),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/questions`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/questions`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const items = questions.items;

  const answers = await Promise.all(items.map(q =>
    serverFetchOrNull<{ data: OwnCustomAnswerData }>(`/leagues/${id}/custom-questions/${q.id}/answer`)
      .then(r => [q.id, { answer: r?.data.answer ?? null, version: r?.data.version ?? 0 }] as const)));
  const byQuestion = new Map(answers);

  const role = league.membership?.role;

  return (
    <LeagueQuestionsScreen
      leagueId={id}
      leagueName={league.name}
      cards={items.map(q => {
        const stored = byQuestion.get(q.id);
        return toQuestionCard(q, stored?.answer ?? null, stored?.version);
      })}
      canAdmin={role === 'owner' || role === 'admin'}
    />
  );
}
