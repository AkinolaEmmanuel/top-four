import type { Api } from '@/lib/api/types';
import { identityTint } from './league-overview';
import { ordinal, pluralise } from '@/lib/format';

/**
 * The league table, shaped once on the server.
 *
 * Pagination is the server's: it returns one page of entries and the league-wide
 * total. The screen used to ask for a page and then slice those rows again by
 * absolute position, so page two sliced rows 50–100 out of a fifty-row page and
 * came back empty. Nothing slices here.
 */

export const PAGE_SIZE = 50;

export interface TableRow {
  membershipId: string;
  position: number;
  name: string;
  initials: string;
  points: number;
  pointsLabel: string;
  tint: number;
  isYou: boolean;
  /** Shares this position with somebody else. */
  isTied: boolean;
  competitionPoints: Api<'StandingCompetitionPointsDto'>[];
  customQuestionPoints: number;
}

export interface TablePage {
  rows: TableRow[];
  page: number;
  pageCount: number;
  /** 1-based, inclusive, for "51–100 of 846". */
  from: number;
  to: number;
  totalMembers: number;
}

export function toTableRows(
  entries: Api<'StandingEntryDto'>[],
  ownMembershipId: string | undefined,
  ownDisplayName: string | undefined,
): TableRow[] {
  const positionCounts = new Map<number, number>();
  for (const entry of entries) {
    positionCounts.set(entry.position, (positionCounts.get(entry.position) ?? 0) + 1);
  }

  return entries.map(entry => {
    const isYou = entry.membershipId === ownMembershipId;
    const name = isYou && ownDisplayName ? ownDisplayName : entry.displayName;
    return {
      membershipId: entry.membershipId,
      position: entry.position,
      name,
      initials: name.substring(0, 2).toUpperCase(),
      points: entry.totalPoints,
      pointsLabel: entry.totalPoints.toLocaleString('en-GB'),
      tint: identityTint(entry.membershipId),
      isYou,
      isTied: (positionCounts.get(entry.position) ?? 0) > 1,
      competitionPoints: entry.competitionPoints ?? [],
      customQuestionPoints: entry.customQuestionPoints ?? 0,
    };
  });
}

export function toTablePage(rows: TableRow[], page: number, totalMembers: number): TablePage {
  const pageCount = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  return {
    rows,
    page: safePage,
    pageCount,
    from: (safePage - 1) * PAGE_SIZE + 1,
    to: Math.min(safePage * PAGE_SIZE, totalMembers),
    totalMembers,
  };
}

/** How the member's own standing reads above the table. */
export function ownStandingLine(
  own: Api<'OwnStandingDataDto'> | null,
  totalMembers: number,
): { position: string; caption: string } {
  if (!own) return { position: '—', caption: 'No points yet' };
  return {
    position: ordinal(own.position),
    caption: `of ${pluralise(totalMembers, 'member')}`,
  };
}

export interface BreakdownLine {
  label: string;
  value: string;
  /** The final line, drawn above a rule. */
  isTotal: boolean;
}

/** A member's points, split by where they came from. */
export function toBreakdown(
  row: TableRow,
  competitionNames: Map<string, string>,
): BreakdownLine[] {
  const lines: BreakdownLine[] = row.competitionPoints.map(cp => ({
    label: competitionNames.get(cp.supportedCompetitionId) ?? 'Competition',
    value: cp.points.toLocaleString('en-GB'),
    isTotal: false,
  }));

  if (row.customQuestionPoints !== 0) {
    lines.push({ label: 'Custom questions', value: row.customQuestionPoints.toLocaleString('en-GB'), isTotal: false });
  }

  lines.push({ label: 'Total', value: row.pointsLabel, isTotal: true });
  return lines;
}
