import { notFound, redirect } from 'next/navigation';
import { LeagueQuestionsScreen } from '../../../components/leagues/LeagueQuestionsScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
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

/**
 * The standings predictor is a plain open-text question; nothing marks it as
 * special. The only reliable signal is the exact wording the preset writes, so
 * this matches on that rather than pretending every league has one.
 */
function standingsQuestionIn(questions: CustomQuestion[]): CustomQuestion | undefined {
  return questions.find(q =>
    (q.phase === 'open' || q.phase === 'scheduled')
    && q.answerKind === 'open_text'
    && /Final Table Order/i.test(q.questionText));
}

export default async function LeagueQuestionsPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let questions: Questions | null;

  try {
    [league, questions] = await Promise.all([
      serverFetch<LeagueRead>(`/leagues/${id}`),
      serverFetchOrNull<Questions>(`/leagues/${id}/custom-questions`),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/questions`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/questions`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const items = questions?.data ?? [];

  const answers = await Promise.all(items.map(q =>
    serverFetchOrNull<{ data: OwnCustomAnswerData }>(`/leagues/${id}/custom-questions/${q.id}/answer`)
      .then(r => [q.id, r?.data.answer ?? null] as const)));
  const byQuestion = new Map(answers);

  const role = league.membership?.role;
  const standings = standingsQuestionIn(items);

  return (
    <LeagueQuestionsScreen
      leagueId={id}
      leagueName={league.name}
      cards={items.map(q => toQuestionCard(q, byQuestion.get(q.id) ?? null))}
      canAdmin={role === 'owner' || role === 'admin'}
      standingsHref={standings ? `/predict/standings?leagueId=${id}&questionId=${standings.id}` : null}
    />
  );
}
