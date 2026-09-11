import type { CustomAnswerValue, CustomQuestion } from '@/lib/api/custom-questions';
import { pluralise } from '@/lib/format';

/**
 * Custom questions, shaped once on the server.
 *
 * A question's phase decides almost everything about how it reads — whether it
 * can still be answered, whether it shows points, whether an admin can settle
 * it — so that is resolved here rather than re-derived in the markup.
 */

export type QuestionPhase = 'open' | 'closed' | 'settled' | 'void' | 'scheduled';
export type QuestionGroup = 'open' | 'closed' | 'done';

export interface QuestionChoice {
  id: string;
  label: string;
}

export interface QuestionCard {
  id: string;
  title: string;
  criteria: string;
  phase: QuestionPhase;
  group: QuestionGroup;
  answerKind: CustomQuestion['answerKind'];
  points: number;
  pointsLabel: string;
  /** Empty for open text, which is typed rather than picked. */
  choices: QuestionChoice[];
  isFreeText: boolean;
  deadlineAt: string;
  /** "closes Saturday 18:00" — the question's own deadline, not a fixed string. */
  deadlineLabel: string;
  canAnswer: boolean;
  /** The member's stored answer, as the raw id the choices compare against. */
  answered: string | undefined;
  /**
   * The version a new answer must be submitted against. The API rejects a
   * mismatch, so a changed answer sent against 0 is refused as a conflict —
   * which is what "you can change it until the deadline" used to hit.
   */
  answerVersion: number;
}

const GROUP_FOR: Record<string, QuestionGroup> = {
  open: 'open', scheduled: 'open', closed: 'closed', settled: 'done', void: 'done',
};

export const GROUP_LABELS: Record<QuestionGroup, string> = {
  open: 'Open now',
  closed: 'Waiting on the outcome',
  done: 'Already settled',
};

/** Reads the stored answer back into the id the choice tiles compare against. */
export function answerToChoiceId(
  answerKind: CustomQuestion['answerKind'],
  answer: CustomAnswerValue | null | undefined,
): string | undefined {
  if (!answer) return undefined;
  if ('value' in answer) {
    if (answerKind === 'true_false') return answer.value ? 'true' : 'false';
    return answer.value ? 'yes' : 'no';
  }
  if ('option' in answer) return answer.option;
  if ('text' in answer) return answer.text;
  return undefined;
}

/** The wire shape for an answer, which differs per kind. */
export function toAnswerValue(
  answerKind: CustomQuestion['answerKind'],
  raw: string,
): CustomAnswerValue {
  if (answerKind === 'yes_no') return { value: raw === 'yes' };
  if (answerKind === 'true_false') return { value: raw === 'true' };
  if (answerKind === 'open_text') return { text: raw };
  return { option: raw };
}

function choicesFor(question: CustomQuestion): QuestionChoice[] {
  if (question.answerKind === 'yes_no') return [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }];
  if (question.answerKind === 'true_false') return [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }];
  if (question.answerKind === 'single_choice') return (question.options ?? []).map(o => ({ id: o, label: o }));
  return [];
}

export function toQuestionCard(
  question: CustomQuestion,
  storedAnswer: CustomAnswerValue | null | undefined,
  answerVersion: number | null | undefined,
): QuestionCard {
  const phase = (question.phase as QuestionPhase) ?? 'closed';
  const deadline = new Date(question.deadlineAt);

  return {
    id: question.id,
    title: question.questionText,
    criteria: question.resolutionCriteria,
    phase,
    group: GROUP_FOR[phase] ?? 'closed',
    answerKind: question.answerKind,
    points: question.points,
    pointsLabel: pluralise(question.points, 'pt'),
    choices: choicesFor(question),
    isFreeText: question.answerKind === 'open_text',
    deadlineAt: question.deadlineAt,
    deadlineLabel: `closes ${deadline.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`,
    canAnswer: phase === 'open',
    answered: answerToChoiceId(question.answerKind, storedAnswer),
    answerVersion: answerVersion ?? 0,
  };
}

export interface QuestionSection {
  group: QuestionGroup;
  label: string;
  cards: QuestionCard[];
}

export function toQuestionSections(cards: QuestionCard[]): QuestionSection[] {
  const order: QuestionGroup[] = ['open', 'closed', 'done'];
  return order
    .map(group => ({ group, label: GROUP_LABELS[group], cards: cards.filter(c => c.group === group) }))
    .filter(section => section.cards.length > 0);
}

/** Points riding on questions the member has not answered yet. */
export function unclaimedPoints(cards: QuestionCard[]): number {
  return cards.filter(c => c.canAnswer && !c.answered).reduce((n, c) => n + c.points, 0);
}

/** Points already committed — answered, and not yet settled against. */
export function committedPoints(cards: QuestionCard[]): number {
  return cards.filter(c => c.canAnswer && c.answered).reduce((n, c) => n + c.points, 0);
}
