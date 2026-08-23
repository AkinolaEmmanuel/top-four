import { apiFetch } from './fetcher';

export interface MissingPredictionTask {
  marketType: string;
  side?: string;
  expectedVersion: number;
  state: string;
  submissionAllowed: boolean;
  deadlineAt: string | null;
}

export interface FixturePredictionTask {
  kind: 'fixture';
  league: { id: string; name: string };
  leagueFixtureId: string;
  fixtureId: string;
  kickoffAt: string | null;
  competition: { id: string; slug: string; displayName: string };
  homeTeam: { id: string; displayName: string };
  awayTeam: { id: string; displayName: string };
  nextDeadlineAt: string | null;
  missingPredictions: MissingPredictionTask[];
}

export interface CustomQuestionPredictionTask {
  kind: 'custom_question';
  league: { id: string; name: string };
  question: {
    id: string;
    answerKind: string;
    expectedVersion: number;
    questionText: string;
    resolutionCriteria: string;
    points: number;
    opensAt: string;
    deadlineAt: string;
    outcomeAt: string;
    options: string[];
  };
  state: 'upcoming' | 'open';
  submissionAllowed: boolean;
}

export type PredictionTask = FixturePredictionTask | CustomQuestionPredictionTask;

export interface PredictionTaskPage {
  items: PredictionTask[];
  serverTime: string;
  nextCursor: string | null;
}

export async function fetchPredictionTasks(cursor?: string): Promise<PredictionTaskPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<PredictionTaskPage>(`/me/prediction-tasks${query}`);
}
