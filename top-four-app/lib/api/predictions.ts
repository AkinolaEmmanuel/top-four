import { apiFetch } from './fetcher';
import type { Api } from './types';

export type MissingPredictionTask = Api<'MissingPredictionTaskDto'>;
export type FixturePredictionTask = Api<'FixturePredictionTaskDto'>;
export type CustomQuestionPredictionTask = Api<'CustomQuestionPredictionTaskDto'>;
export type PredictionTask = FixturePredictionTask | CustomQuestionPredictionTask;

export type PredictionTaskPage = Api<'PredictionTaskPageDto'>;

export async function fetchPredictionTasks(cursor?: string): Promise<PredictionTaskPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<PredictionTaskPage>(`/me/prediction-tasks${query}`);
}
