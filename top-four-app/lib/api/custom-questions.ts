import { apiFetch } from './fetcher';
import type { Api } from './types';

/**
 * The question itself is the server's type. The *answer* values are not: the
 * API still declares every one of them as a bare object, so the generated types
 * are `Record<string, never>` and `{[key: string]: unknown}`. Those would be a
 * loss, so the two answer unions below stay hand-written and are marked
 * UNTYPED UPSTREAM with the field the backend needs to describe.
 */

export type CustomQuestion = Api<'CustomQuestionItemResponseDto'>;
export type CustomQuestionsPage = Api<'CustomQuestionPageResponseDto'>;
export type CustomAnswerMutation = Api<'CustomAnswerMutationDataDto'>;

/**
 * UNTYPED UPSTREAM: `SubmitCustomAnswerDto.answer` is a bare object.
 * The wire carries exactly one of these per answer kind: `{value}` for
 * yes_no/true_false, `{option}` for single_choice, `{text}` for open_text.
 */
export type CustomAnswerValue =
  | { value: boolean }
  | { option: string }
  | { text: string };

/**
 * UNTYPED UPSTREAM: `ResolveCustomQuestionDto.correctAnswer` is a bare object.
 *
 * Resolving is the same shape as answering for yes_no/true_false/single_choice,
 * but open_text is deliberately different: the domain takes a list of accepted
 * spellings rather than one `{text}`, so an admin can accept every real variant
 * members typed. A generated `Record<string, never>` cannot express that, and
 * getting it wrong silently marks correct answers wrong.
 */
export type CustomResolutionValue =
  | { value: boolean }
  | { option: string }
  | { acceptedAnswers: string[] };

/** The server types `answer` as an open record; it is really a CustomAnswerValue. */
export type DisclosedCustomAnswer = Omit<Api<'DisclosedCustomAnswerDto'>, 'answer'> & {
  answer: CustomAnswerValue;
};

export type DisclosedCustomAnswersData = Omit<Api<'DisclosedCustomAnswersDataDto'>, 'answers'> & {
  answers: DisclosedCustomAnswer[];
};

export type OwnCustomAnswerData = Omit<Api<'OwnCustomAnswerDataDto'>, 'answer'> & {
  answer: CustomAnswerValue | null;
};

export interface OwnCustomAnswerResponse {
  data: OwnCustomAnswerData;
}

export type CreateCustomQuestionPayload = Api<'CreateCustomQuestionDto'>;
export type EditCustomQuestionPayload = Api<'EditCustomQuestionDto'>;

export async function fetchCustomQuestions(leagueId: string, cursor?: string): Promise<CustomQuestionsPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<CustomQuestionsPage>(`/leagues/${leagueId}/custom-questions${query}`);
}

export async function createCustomQuestion(leagueId: string, payload: CreateCustomQuestionPayload): Promise<CustomQuestion> {
  const response = await apiFetch<Api<'CustomQuestionResponseDto'>>(`/leagues/${leagueId}/custom-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function editCustomQuestion(leagueId: string, questionId: string, payload: EditCustomQuestionPayload): Promise<CustomQuestion> {
  const response = await apiFetch<Api<'CustomQuestionResponseDto'>>(`/leagues/${leagueId}/custom-questions/${questionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function fetchOwnCustomAnswer(leagueId: string, questionId: string): Promise<OwnCustomAnswerResponse> {
  return apiFetch<OwnCustomAnswerResponse>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`);
}

// `answer` must already be the real per-kind shape — see CustomAnswerValue.
export async function submitCustomAnswer(leagueId: string, questionId: string, expectedVersion: number, answer: CustomAnswerValue): Promise<CustomAnswerMutation> {
  const response = await apiFetch<Api<'CustomAnswerMutationResponseDto'>>(`/leagues/${leagueId}/custom-questions/${questionId}/answer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, answer }),
  });
  return response.data;
}

// `correctAnswer` must match the real per-kind resolution shape — open_text
// takes {acceptedAnswers: string[]}, not {text}. See CustomResolutionValue.
export async function resolveCustomQuestion(leagueId: string, questionId: string, correctAnswer: CustomResolutionValue, reason?: string): Promise<CustomQuestion> {
  const response = await apiFetch<Api<'CustomQuestionResponseDto'>>(`/leagues/${leagueId}/custom-questions/${questionId}/resolution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correctAnswer, reason }),
  });
  return response.data;
}

// Only available once the question's own deadline has passed.
export async function fetchDisclosedAnswers(leagueId: string, questionId: string): Promise<DisclosedCustomAnswersData> {
  const response = await apiFetch<{ data: DisclosedCustomAnswersData; nextCursor: string | null }>(`/leagues/${leagueId}/custom-questions/${questionId}/answers`);
  return response.data;
}

export async function voidCustomQuestion(leagueId: string, questionId: string, reason: string): Promise<CustomQuestion> {
  const response = await apiFetch<Api<'CustomQuestionResponseDto'>>(`/leagues/${leagueId}/custom-questions/${questionId}/void`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return response.data;
}
