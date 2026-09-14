import { CatalogueCompetition, CatalogueTeam } from '../api/catalogue';

export interface QuestionPreset {
  id: string;
  category: 'domestic_standings' | 'full_table' | 'champions_league';
  categoryLabel: string;
  answerKind: 'single_choice' | 'open_text' | 'yes_no';
  questionText: string;
  resolutionCriteria: string;
  points: number;
  options?: string[];
  description: string;
}

/**
 * Dynamically generates question presets tailored to ANY tournament and its squad of clubs.
 */
export function generateCompetitionQuestionPresets(
  competition?: CatalogueCompetition | null,
  teams: CatalogueTeam[] = []
): QuestionPreset[] {
  const compName = competition?.displayName || 'League';
  const isCup = competition?.kind === 'tournament' || competition?.kind === 'cup' || competition?.slug?.includes('champions') || competition?.slug?.includes('cup');
  const teamNames = teams.map((t) => t.displayName);

  if (isCup) {
    return [
      {
        id: `${competition?.slug || 'tourn'}_winner`,
        category: 'champions_league',
        categoryLabel: `${compName} Road to Glory`,
        answerKind: 'single_choice',
        questionText: `Who will win the ${compName}?`,
        resolutionCriteria: `The club that lifts the trophy in the official ${compName} Final.`,
        points: 30,
        options: teamNames.length > 0 ? teamNames : undefined,
        description: `Pick the ${compName} Champion.`
      },
      {
        id: `${competition?.slug || 'tourn'}_finalists`,
        category: 'champions_league',
        categoryLabel: `${compName} Road to Glory`,
        answerKind: 'open_text',
        questionText: `Predict the Two ${compName} Finalists`,
        resolutionCriteria: `The two clubs competing in the official final match.`,
        points: 20,
        description: 'Name the two finalists.'
      },
      {
        id: `${competition?.slug || 'tourn'}_semis`,
        category: 'champions_league',
        categoryLabel: `${compName} Road to Glory`,
        answerKind: 'open_text',
        questionText: `Predict the 4 ${compName} Semi-Finalists`,
        resolutionCriteria: `The four clubs advancing to the semi-final stage.`,
        points: 15,
        description: 'Name the four semi-finalists.'
      },
      {
        id: `${competition?.slug || 'tourn'}_top8`,
        category: 'champions_league',
        categoryLabel: `${compName} Road to Glory`,
        answerKind: 'open_text',
        questionText: `Predict ${compName} League Phase / Group Top Qualifiers`,
        resolutionCriteria: `The top qualifying teams advancing directly to the Round of 16.`,
        points: 25,
        description: 'Name the top direct qualifiers.'
      }
    ];
  }

  // Standard Domestic League (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, etc.)
  const top4Label = teams.length >= 18 ? 'Top 4 Finishers' : 'Top 3 Finishers';
  const relegLabel = teams.length >= 18 ? 'Three Relegated Clubs' : 'Relegated Clubs';

  return [
    {
      id: `${competition?.slug || 'league'}_winner`,
      category: 'domestic_standings',
      categoryLabel: `${compName} Milestones`,
      answerKind: 'single_choice',
      questionText: `Who will win the ${compName} title?`,
      resolutionCriteria: `The club finishing 1st in the official final ${compName} standings.`,
      points: 25,
      options: teamNames.length > 0 ? teamNames : undefined,
      description: `Pick the ${compName} champion.`
    },
    {
      id: `${competition?.slug || 'league'}_top_four`,
      category: 'domestic_standings',
      categoryLabel: `${compName} Milestones`,
      answerKind: 'open_text',
      questionText: `Predict the ${top4Label} (European / Championship Spots)`,
      resolutionCriteria: `List the clubs finishing in top qualification positions in ${compName}.`,
      points: 20,
      description: `Name the clubs securing top spots in ${compName}.`
    },
    {
      id: `${competition?.slug || 'league'}_europe`,
      category: 'domestic_standings',
      categoryLabel: `${compName} Milestones`,
      answerKind: 'open_text',
      questionText: `Predict European Qualification Spots in ${compName}`,
      resolutionCriteria: `List the clubs qualifying for European continental competitions.`,
      points: 15,
      description: 'Name the continental qualification clubs.'
    },
    {
      id: `${competition?.slug || 'league'}_relegation`,
      category: 'domestic_standings',
      categoryLabel: `${compName} Milestones`,
      answerKind: 'open_text',
      questionText: `Predict the ${relegLabel} in ${compName}`,
      resolutionCriteria: `List the bottom clubs relegated at season end in ${compName}.`,
      points: 20,
      description: 'Name the bottom relegated clubs.'
    },
    {
      id: `${competition?.slug || 'league'}_full_table`,
      category: 'full_table',
      categoryLabel: 'Full Table Order',
      answerKind: 'open_text',
      questionText: `Complete ${compName} Final Table Order (1–${teams.length || 20})`,
      resolutionCriteria: `The full ordered list of clubs from 1st to bottom in the official final ${compName} table.`,
      points: 50,
      description: `Predict the exact 1st through ${teams.length || 20}th order of all clubs.`
    }
  ];
}

export function getStandingsQuestionPresets(teams: string[] = []): QuestionPreset[] {
  return generateCompetitionQuestionPresets(null, teams.map(name => ({ id: name, displayName: name })));
}

export const STANDINGS_QUESTION_PRESETS = getStandingsQuestionPresets();
