import { GamificationStats } from "@/types";

export const RANK_TITLES = [
  "Rookie Pundit",
  "Armchair Critic",
  "Local Supporter",
  "Matchday Regular",
  "Tactical Mastermind",
  "Derby Specialist",
  "Golden Boot Analyst",
  "Grand Predictor",
  "Stadium Legend",
  "Football Oracle",
];

/**
 * Calculate rank title based on current level.
 */
export function getRankTitle(level: number): string {
  const index = Math.min(Math.floor((level - 1) / 3), RANK_TITLES.length - 1);
  return RANK_TITLES[index];
}

/**
 * Calculate XP required for next level: Base 100 * Level ^ 1.4
 */
export function getXpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.4));
}

/**
 * Calculate progress percentage towards next level (0 - 100)
 */
export function getLevelProgress(xp: number, level: number): number {
  const currentLevelXp = level === 1 ? 0 : getXpForNextLevel(level - 1);
  const nextLevelXp = getXpForNextLevel(level);
  const range = nextLevelXp - currentLevelXp;
  if (range <= 0) return 100;
  const progress = Math.min(Math.max((xp - currentLevelXp) / range, 0), 1) * 100;
  return Math.round(progress);
}

export const INITIAL_GUEST_STATS: GamificationStats = {
  xp: 340,
  level: 3,
  creds: 450,
  current_streak: 3,
  best_streak: 7,
  streak_shields: 1,
  double_downs_remaining: 2,
  total_predictions: 14,
  exact_scores_hit: 3,
  perfect_gameweeks: 1,
  rank_title: "Local Supporter",
};
