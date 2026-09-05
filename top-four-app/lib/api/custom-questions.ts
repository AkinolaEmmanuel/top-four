import { apiFetch } from './fetcher';

export interface CustomQuestion {
  id: string;
  answerKind: 'yes_no' | 'true_false' | 'single_choice' | 'open_text';
  questionText: string;
  resolutionCriteria: string;
  points: number;
  opensAt: string;
  deadlineAt: string;
  outcomeAt: string;
  resolveBy: string;
  phase: string;
  editable: boolean;
  options: string[];
  settledByLeagueAdmin: boolean;
}

export interface CustomQuestionsPage {
  data: CustomQuestion[];
  nextCursor: string | null;
}

// The real per-kind answer value — the ruleset carries no labels, only these
// exact shapes: {value} for yes_no/true_false, {option} for single_choice,
// {text} for open_text.
export type CustomAnswerValue =
  | { value: boolean }
  | { option: string }
  | { text: string };

export interface DisclosedCustomAnswer {
  membershipId: string;
  answer: CustomAnswerValue;
}

export interface DisclosedCustomAnswersData {
  question: CustomQuestion;
  answers: DisclosedCustomAnswer[];
}

export interface OwnCustomAnswerDataDto {
  question: CustomQuestion;
  answered: boolean;
  answerId?: string;
  version?: number;
  answer?: any;
}

export interface OwnCustomAnswerResponseDto {
  data: OwnCustomAnswerDataDto;
}

export interface CreateCustomQuestionPayload {
  answerKind: string;
  questionText: string;
  resolutionCriteria: string;
  points: number;
  opensAt: string;
  deadlineAt: string;
  outcomeAt: string;
  options?: string[];
}

export async function fetchCustomQuestions(leagueId: string, cursor?: string): Promise<CustomQuestionsPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<CustomQuestionsPage>(`/leagues/${leagueId}/custom-questions${query}`);
}

export async function createCustomQuestion(leagueId: string, payload: CreateCustomQuestionPayload): Promise<CustomQuestion> {
  const response = await apiFetch<{ data: CustomQuestion }>(`/leagues/${leagueId}/custom-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function editCustomQuestion(leagueId: string, questionId: string, payload: Partial<CreateCustomQuestionPayload>): Promise<CustomQuestion> {
  const response = await apiFetch<{ data: CustomQuestion }>(`/leagues/${leagueId}/custom-questions/${questionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function fetchOwnCustomAnswer(leagueId: string, questionId: string): Promise<OwnCustomAnswerResponseDto> {
  return apiFetch<OwnCustomAnswerResponseDto>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`);
}

// `answer` must already be the real per-kind shape — see CustomAnswerValue.
export async function submitCustomAnswer(leagueId: string, questionId: string, expectedVersion: number, answer: CustomAnswerValue): Promise<{ id: string; version: number }> {
  const response = await apiFetch<{ data: { id: string; version: number } }>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expectedVersion, answer }),
  });
  return response.data;
}

// `correctAnswer` must be the same real per-kind shape the question's
// answerKind expects — the domain parses it exactly like a submitted answer.
export async function resolveCustomQuestion(leagueId: string, questionId: string, correctAnswer: CustomAnswerValue, reason?: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/custom-questions/${questionId}/resolution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correctAnswer, reason }),
  });
}

// Only available once the question's own deadline has passed.
export async function fetchDisclosedAnswers(leagueId: string, questionId: string): Promise<DisclosedCustomAnswersData> {
  const response = await apiFetch<{ data: DisclosedCustomAnswersData; nextCursor: string | null }>(`/leagues/${leagueId}/custom-questions/${questionId}/answers`);
  return response.data;
}

export async function voidCustomQuestion(leagueId: string, questionId: string, reason: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/custom-questions/${questionId}/void`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
}
