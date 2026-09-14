import { apiFetch } from './fetcher';
import type { Api } from './types';
import { queueWindow } from '@/lib/predict/queue-window';

export type MissingPredictionTask = Api<'MissingPredictionTaskDto'>;
export type FixturePredictionTask = Api<'FixturePredictionTaskDto'>;
export type CustomQuestionPredictionTask = Api<'CustomQuestionPredictionTaskDto'>;
export type PredictionTask = FixturePredictionTask | CustomQuestionPredictionTask;

export type PredictionTaskPage = Api<'PredictionTaskPageDto'>;

/**
 * The tab badge's read: this week, not the season.
 *
 * Unwindowed this returned one arbitrary page of a season-long feed, so the
 * badge showed "20" — the page size — while Predict said 200 and Home said 800.
 * The badge counts fixtures and questions needing attention in the same week
 * every other figure is measured over.
 */
export async function fetchPredictionTasks(cursor?: string): Promise<PredictionTaskPage> {
  const parts = [queueWindow(Date.now()), `limit=${TASK_BADGE_LIMIT}`];
  if (cursor) parts.push(`cursor=${encodeURIComponent(cursor)}`);
  return apiFetch<PredictionTaskPage>(`/me/prediction-tasks?${parts.join('&')}`);
}

/** Enough to count a busy week; the badge caps its display well below this. */
const TASK_BADGE_LIMIT = 100;
