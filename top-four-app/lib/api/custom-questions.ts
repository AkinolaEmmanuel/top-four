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
  return apiFetch<CustomQuestion>(`/leagues/${leagueId}/custom-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function editCustomQuestion(leagueId: string, questionId: string, payload: Partial<CreateCustomQuestionPayload>): Promise<CustomQuestion> {
  return apiFetch<CustomQuestion>(`/leagues/${leagueId}/custom-questions/${questionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchOwnCustomAnswer(leagueId: string, questionId: string): Promise<OwnCustomAnswerResponseDto> {
  return apiFetch<OwnCustomAnswerResponseDto>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`);
}

export async function submitCustomAnswer(leagueId: string, questionId: string, expectedVersion: number, answer: unknown): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expectedVersion, answer }),
  });
}

export async function resolveCustomQuestion(leagueId: string, questionId: string, correctAnswer: unknown, reason?: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/custom-questions/${questionId}/resolution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correctAnswer, reason }),
  });
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
