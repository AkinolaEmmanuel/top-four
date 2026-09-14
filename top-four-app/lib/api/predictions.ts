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
  homeTeam: { id: string; displayName: string; code: string | null; logoUrl: string | null };
  awayTeam: { id: string; displayName: string; code: string | null; logoUrl: string | null };
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

async function fetchPredictionTasksPage(cursor?: string): Promise<PredictionTaskPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<PredictionTaskPage>(`/me/prediction-tasks${query}`);
}

// Paginated at 20 per page, and this used to only ever fetch the first page.
// This list is a user's actionable to-do (unanswered markets across every
// unfinished league they're in), not history -- a member in several active
// leagues each with a few unanswered fixtures over a busy weekend can easily
// clear 20 items, and anything past that was silently invisible on the
// Predict tab and the Home page's queue with no sign anything was missing.
export async function fetchPredictionTasks(): Promise<PredictionTaskPage> {
  const first = await fetchPredictionTasksPage();
  const items = [...first.items];
  let cursor = first.nextCursor;
  while (cursor) {
    const page = await fetchPredictionTasksPage(cursor);
    items.push(...page.items);
    cursor = page.nextCursor;
  }
  return { items, serverTime: first.serverTime, nextCursor: null };
}
