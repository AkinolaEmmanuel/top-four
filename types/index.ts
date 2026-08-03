export type Profile = {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
};

// Phase 1 markets only. Phase 2 will add: "anytime_scorer", "player_card",
// "final_standings", "lineups" — deferred per the coverage/data-source
// analysis (they need /fixtures/events and /fixtures/lineups, which carry
// real coverage risk on domestic cups).
export type MarketType = "match_result" | "exact_score" | "btts" | "total_goals";

export type LeagueScopeType = "gameweek" | "range" | "season";

export type RoomScope = {
  type: LeagueScopeType;
  fromRound?: string;
  toRound?: string;
};

export type JoinPolicy = "closes_at_start" | "always_open";

export type LockPreset = "kickoff" | "5m" | "15m" | "30m" | "60m" | "2h";

/** Minutes before kickoff each preset locks predictions. "kickoff" = 0. */
export const LOCK_PRESET_MINUTES: Record<LockPreset, number> = {
  kickoff: 0,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "60m": 60,
  "2h": 120,
};

export const LOCK_PRESET_LABELS: Record<LockPreset, string> = {
  kickoff: "At kickoff",
  "5m": "5 minutes before",
  "15m": "15 minutes before",
  "30m": "30 minutes before",
  "60m": "60 minutes before",
  "2h": "2 hours before",
};

export type ScoringConfig = Record<MarketType | "custom_question", number>;

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  match_result: 2,
  exact_score: 5,
  btts: 1,
  total_goals: 1,
  custom_question: 3,
};

export const MARKET_LABELS: Record<MarketType, string> = {
  match_result: "Match Result",
  exact_score: "Exact Score",
  btts: "Both Teams to Score",
  total_goals: "Total Goals",
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  /** Enabled competition ids — a room can combine more than one (e.g. PL + UCL). */
  competitions: number[];
  scope: RoomScope;
  join_policy: JoinPolicy;
  lock_preset: LockPreset;
  enabled_markets: MarketType[];
  scoring_config: ScoringConfig;
  /** Ordered subset of enabled_markets used to break ties. Custom questions can never be a tiebreaker. */
  tiebreaker_order: MarketType[];
  /** House rule (sole correct predictor on a fixture gets a bonus) — not part of the spec, off by default. */
  lonely_wolf_enabled: boolean;
};

export type RoomRole = "owner" | "admin" | "participant";

export type RoomMember = {
  id: string;
  room_id: string;
  user_id: string;
  role: RoomRole;
  joined_at: string;
};

export type PredictionValue =
  | { market: "match_result"; pick: "home" | "draw" | "away" }
  | { market: "exact_score"; home: number; away: number }
  | { market: "btts"; pick: boolean }
  | { market: "total_goals"; pick: "over" | "under" };

export type Prediction = {
  id: string;
  room_id: string | null; // null = Global (no room required)
  user_id: string;
  fixture_id: number;
  market: MarketType;
  value: PredictionValue;
  submitted_at: string;
};

/** Creator-configured over/under line for the Total Goals market, per fixture. */
export type TotalGoalsLine = {
  room_id: string | null;
  fixture_id: number;
  line: number;
};

export type AwardCategory = "golden_boot" | "golden_ball" | "golden_glove" | "young_player";

export type AwardPick = {
  id: string;
  room_id: string | null;
  user_id: string;
  award: AwardCategory;
  player_name: string;
  submitted_at: string;
};

export type CustomQuestionType = "yes_no" | "true_false" | "options" | "open_text";

export type CustomQuestion = {
  id: string;
  room_id: string | null;
  question_text: string;
  type: CustomQuestionType;
  options: string[] | null;
  opens_at: string;
  deadline: string;
  points: number;
  context: string | null;
  /** Set by the creator after the deadline. Multiple accepted answers for open_text. */
  correct_answer: string[] | null;
  created_by: string;
  created_at: string;
};

export type CustomQuestionAnswer = {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  submitted_at: string;
};

// ── Gamification System Types ──────────────────────────────────────────

export type PowerUpType = "double_down" | "streak_shield" | "exact_score_boost";

export type GamificationStats = {
  xp: number;
  level: number;
  creds: number;
  current_streak: number;
  best_streak: number;
  streak_shields: number;
  double_downs_remaining: number;
  total_predictions: number;
  exact_scores_hit: number;
  perfect_gameweeks: number;
  rank_title: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  creds_reward: number;
  progress: number;
  max_progress: number;
  completed: boolean;
  claimed: boolean;
  category: "daily" | "gameweek" | "milestone";
};

