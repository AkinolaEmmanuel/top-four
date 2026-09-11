import type { CSSProperties, Dispatch, ReactElement, SetStateAction } from 'react';
import type { QuestionPreset } from '@/lib/constants/question-presets';

/**
 * The contract between the custom-questions page and its two twins.
 *
 * Scope note: the top-level props are typed precisely, because that is where
 * a page/twin disagreement actually goes wrong — a renamed or dropped prop
 * reads as `undefined` and the screen quietly loses a control. The row
 * collections stay loosely typed for now: both twins annotate every iterator
 * as `(row: any)`, so a precise element type would be discarded at the point
 * of use. Tightening those means removing the inner annotations too, which is
 * worth doing but is a separate pass.
 */

export type QuestionsView = 'list' | 'empty' | 'create' | 'resolve';

/** A row in one of the twins' lists. Deliberately open — see the note above. */
export interface QuestionRow {
  [key: string]: unknown;
}

export interface QuestionGroup {
  [key: string]: unknown;
}

export interface ChoiceChip {
  label: string;
  style: string | CSSProperties;
  pick: () => void;
}

/**
 * The confirm sheet, as a positional tuple:
 * [title, body, stat pairs, confirm label, isDangerous]. Null when closed.
 */
export type QuestionSheet = [string, string, string[][], string, boolean] | null;

/** The selected question type, as a [id, label, description] tuple. */
export type QuestionTypeTuple = string[];

export interface LeagueQuestionsSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  leagueName: string | undefined;
  setView: Dispatch<SetStateAction<QuestionsView>>;
  setSheet: Dispatch<SetStateAction<string | null>>;
  SHEET: QuestionSheet;

  onList: boolean;
  onEmpty: boolean;
  onCreate: boolean;
  onResolve: boolean;

  allIn: boolean;
  stake: number;
  committed: number;
  owing: number;
  /** Null when this league has no standings-predictor question to link to. */
  standingsHref: string | null;

  // The create form.
  qText: string;
  setQText: Dispatch<SetStateAction<string>>;
  qType: string;
  types: ChoiceChip[];
  TYPE: QuestionTypeTuple;
  optionsList: QuestionRow[];
  setQOptions: Dispatch<SetStateAction<string[]>>;
  qPoints: number;
  pointOptions: ChoiceChip[];
  qCriteria: string;
  setQCriteria: Dispatch<SetStateAction<string>>;
  qDeadline: string;
  setQDeadline: Dispatch<SetStateAction<string>>;
  qOutcomeAt: string;
  setQOutcomeAt: Dispatch<SetStateAction<string>>;
  previewDeadlineLabel: string;
  canPublish: boolean;
  publishLabel: string;
  publishNote: string;
  publishAction: () => void;
  presets: QuestionPreset[];
  applyPreset: (preset: QuestionPreset) => void;

  // Resolving a question.
  resolveTitle: string;
  resolveSubtitle: string;
  outcomes: QuestionRow[];
  resolveIsText: boolean;
  resolveText: string;
  setResolveText: Dispatch<SetStateAction<string>>;
  resolveSpellings: string[];
  addResolveSpelling: () => void;
  removeResolveSpelling: (index: number) => void;
  canSettleNow: boolean;
  settleLabel: string;
  settleAction: () => void;
  voidAction: () => void;
  resolveNotesList: QuestionRow[];

  toast: string | null;
}

export interface LeagueQuestionsMobileProps extends LeagueQuestionsSharedProps {
  /** How many members the proposed answer would award points to. Mobile only —
   *  the desktop twin shows the same figure inside its confirm sheet instead. */
  match: number;
  view: QuestionsView;
  admin: boolean;
  groups: QuestionGroup[];
  IconMap: Record<string, () => ReactElement>;
  tabs: Array<{ label: string; ic: string; on: boolean }>;
}

export interface LeagueQuestionsDesktopProps extends LeagueQuestionsSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  avatarInitials: string;
  avatarName: string;
  showContext: boolean;
  contextTabs: Array<{ label: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  heroStyle: CSSProperties;
  heroTone: string;
  heroKicker: string;
  heroNum: string;
  heroSub: string;
  heroNote: string;
  newBtnStyle: CSSProperties;
  openItems: QuestionRow[];
  pastGroups: QuestionGroup[];
  setQType: Dispatch<SetStateAction<string>>;
  setQPoints: Dispatch<SetStateAction<number>>;
  publishStyle: CSSProperties;
  publishNoteStyle: CSSProperties;
  previewText: string;
  previewPoints: string;
  settleStyle: CSSProperties;
  toastStyle: CSSProperties;
  memberCount: number | undefined;
}
