import "server-only";
import { randomUUID, createHash } from "crypto";
import {
  DEFAULT_SCORING_CONFIG,
  type AwardCategory,
  type AwardPick,
  type CustomQuestion,
  type CustomQuestionAnswer,
  type CustomQuestionType,
  type JoinPolicy,
  type LockPreset,
  type MarketType,
  type Prediction,
  type PredictionValue,
  type Profile,
  type Room,
  type RoomMember,
  type RoomRole,
  type RoomScope,
  type ScoringConfig,
  type TotalGoalsLine,
} from "@/types";
import { COMPETITIONS } from "@/lib/api-football/mock-data";

// In-memory dev store. Resets on server restart — this stands in for a real
// backend (being built separately) until that's wired up. Not for production use.

/**
 * The synthetic "Global" room — predict against everyone on the platform,
 * no room required. Spans every supported competition. Centralized here so
 * every route resolves the exact same config instead of re-hardcoding it.
 */
export const GLOBAL_ROOM: Room = {
  id: "global",
  name: "Global",
  description: "Predict against everyone on the platform — no room required.",
  created_by: "",
  invite_code: "",
  is_active: true,
  created_at: "",
  updated_at: "",
  competitions: COMPETITIONS.map((c) => c.id),
  scope: { type: "season" },
  join_policy: "always_open",
  lock_preset: "5m",
  enabled_markets: ["match_result", "exact_score", "btts", "total_goals"],
  scoring_config: { ...DEFAULT_SCORING_CONFIG },
  tiebreaker_order: [],
  lonely_wolf_enabled: false,
};

type MockUser = Profile & { email: string; passwordHash: string };

type MockStore = {
  users: Map<string, MockUser>; // by id
  usersByEmail: Map<string, string>; // email -> id
  rooms: Map<string, Room>; // by id
  roomMembers: RoomMember[];
  predictions: Prediction[];
  awardPicks: AwardPick[];
  totalGoalsLines: TotalGoalsLine[];
  customQuestions: CustomQuestion[];
  customQuestionAnswers: CustomQuestionAnswer[];
};

// Next.js dev mode compiles route handlers and server components as
// separate on-demand entries, which can otherwise give each its own module
// instance. Stashing the store on `globalThis` (the same trick used for
// dev-mode Prisma client singletons) guarantees every entry shares the same
// data for the lifetime of the server process.
const globalForMockDb = globalThis as unknown as { __mockDb?: MockStore };

const db: MockStore =
  globalForMockDb.__mockDb ??
  (globalForMockDb.__mockDb = {
    users: new Map(),
    usersByEmail: new Map(),
    rooms: new Map(),
    roomMembers: [],
    predictions: [],
    awardPicks: [],
    totalGoalsLines: [],
    customQuestions: [],
    customQuestionAnswers: [],
  });

const {
  users,
  usersByEmail,
  rooms,
  roomMembers,
  predictions,
  awardPicks,
  totalGoalsLines,
  customQuestions,
  customQuestionAnswers,
} = db;

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function findUserByEmail(email: string): MockUser | undefined {
  const id = usersByEmail.get(email.toLowerCase());
  return id ? users.get(id) : undefined;
}

export function findUserById(id: string): MockUser | undefined {
  return users.get(id);
}

export function verifyPassword(user: MockUser, password: string) {
  return user.passwordHash === hashPassword(password);
}

export function createUser(input: {
  email: string;
  username: string;
  fullName?: string | null;
  password: string;
}): MockUser {
  const email = input.email.toLowerCase();
  if (usersByEmail.has(email)) {
    throw new Error("An account with this email already exists.");
  }

  const id = randomUUID();
  const timestamp = nowIso();
  const user: MockUser = {
    id,
    email,
    username: input.username,
    full_name: input.fullName ?? null,
    avatar_url: null,
    passwordHash: hashPassword(input.password),
    created_at: timestamp,
    updated_at: timestamp,
  };

  users.set(id, user);
  usersByEmail.set(email, id);

  // No starter room here — new users choose to create, join, or go Global
  // via the post-signup onboarding chooser (app/onboarding).
  return user;
}

const DEMO_EMAIL = "demo@topfour.app";

/**
 * Returns the shared demo account, seeding it as an active player across
 * every game mode (several rooms plus Global) on first use, since the demo
 * skips onboarding. Backs the one-click "Try the demo" login — no real
 * credentials involved.
 */
export function getOrCreateDemoUser(): MockUser {
  const existing = findUserByEmail(DEMO_EMAIL);
  if (existing) return existing;

  const user = createUser({
    email: DEMO_EMAIL,
    username: "demo_manager",
    fullName: "Demo Manager",
    password: randomUUID(),
  });
  seedDemoData(user.id);
  return user;
}

/**
 * Populates the demo account so "Try the demo" lands somewhere lively:
 * member of multiple rooms (admin of some, invited to others) plus an
 * active Global presence, with a graded mix of exact/correct/flop picks
 * (including a Lonely Wolf bonus) and partially-filled Tournament Honors —
 * fixture ids below match the FT (101, 102) and NS (103-106) entries in
 * lib/api-football/mock-data.ts.
 */
function seedDemoData(demoUserId: string) {
  const sam =
    findUserByEmail("sam@demo.topfour.app") ??
    createUser({
      email: "sam@demo.topfour.app",
      username: "sam_striker",
      fullName: "Sam Striker",
      password: randomUUID(),
    });
  const robin =
    findUserByEmail("robin@demo.topfour.app") ??
    createUser({
      email: "robin@demo.topfour.app",
      username: "robin_winger",
      fullName: "Robin Winger",
      password: randomUUID(),
    });
  const casey =
    findUserByEmail("casey@demo.topfour.app") ??
    createUser({
      email: "casey@demo.topfour.app",
      username: "casey_keeper",
      fullName: "Casey Keeper",
      password: randomUUID(),
    });

  // Room 1 — the demo manager's home room, owner, two friends along for the ride.
  // Lonely Wolf is switched on here specifically to demo that house rule.
  const room1 = createRoom(demoUserId, {
    name: "The Group Chat",
    description: "Your first room — invite your squad or start predicting solo.",
    lonely_wolf_enabled: true,
  });
  joinRoomByInviteCode(sam.id, room1.invite_code);
  joinRoomByInviteCode(robin.id, room1.invite_code);

  // Room 2 — a second room the demo manager also runs.
  const room2 = createRoom(demoUserId, {
    name: "Sunday League Legends",
    description: "Five-a-side lads, arguing about the Premier League every gameweek.",
  });
  joinRoomByInviteCode(casey.id, room2.invite_code);

  // Room 3 — a room the demo manager joined rather than created.
  const room3 = createRoom(sam.id, {
    name: "The Office League",
    description: "Work group chat prediction league.",
  });
  joinRoomByInviteCode(demoUserId, room3.invite_code);
  joinRoomByInviteCode(robin.id, room3.invite_code);

  // Fixture 101 (FT): Arsenal 2-1 Chelsea (home win). Fixture 102 (FT): Liverpool 1-1 Man United (draw).
  const exactScore = (home: number, away: number): PredictionValue => ({ market: "exact_score", home, away });
  const scorePicks: { roomId: string | null; userId: string; fixtureId: number; value: PredictionValue }[] = [
    // Room 1 — demo manager nails 102 alone for the Lonely Wolf bonus.
    { roomId: room1.id, userId: demoUserId, fixtureId: 101, value: exactScore(1, 0) },
    { roomId: room1.id, userId: demoUserId, fixtureId: 102, value: exactScore(1, 1) },
    { roomId: room1.id, userId: sam.id, fixtureId: 101, value: exactScore(2, 1) },
    { roomId: room1.id, userId: sam.id, fixtureId: 102, value: exactScore(2, 1) },
    { roomId: room1.id, userId: robin.id, fixtureId: 101, value: exactScore(0, 2) },
    { roomId: room1.id, userId: robin.id, fixtureId: 102, value: exactScore(0, 1) },

    // Room 1 open fixtures — mid-gameweek, one fixture (106) left unpredicted on purpose.
    { roomId: room1.id, userId: demoUserId, fixtureId: 103, value: exactScore(2, 0) },
    { roomId: room1.id, userId: demoUserId, fixtureId: 104, value: exactScore(1, 1) },
    { roomId: room1.id, userId: demoUserId, fixtureId: 105, value: exactScore(1, 2) },

    // Room 2 — a tied race with Casey.
    { roomId: room2.id, userId: demoUserId, fixtureId: 101, value: exactScore(2, 1) },
    { roomId: room2.id, userId: demoUserId, fixtureId: 102, value: exactScore(2, 0) },
    { roomId: room2.id, userId: casey.id, fixtureId: 101, value: exactScore(2, 1) },

    // Room 3 — demo manager is off the pace here, a flop against Sam's exact call.
    { roomId: room3.id, userId: demoUserId, fixtureId: 101, value: exactScore(1, 1) },
    { roomId: room3.id, userId: sam.id, fixtureId: 101, value: exactScore(2, 1) },

    // Global — open to everyone, no room required. Another Lonely Wolf-shaped result on 102
    // (Lonely Wolf itself is off by default in Global; this just shows the exact/flop mix).
    { roomId: null, userId: demoUserId, fixtureId: 101, value: exactScore(2, 1) },
    { roomId: null, userId: demoUserId, fixtureId: 102, value: exactScore(1, 1) },
    { roomId: null, userId: sam.id, fixtureId: 101, value: exactScore(1, 0) },
    { roomId: null, userId: robin.id, fixtureId: 102, value: exactScore(2, 0) },
  ];

  for (const pick of scorePicks) {
    submitPrediction({ roomId: pick.roomId, userId: pick.userId, fixtureId: pick.fixtureId, market: "exact_score", value: pick.value });
  }
  // Also give the demo manager a Match Result and BTTS pick on an open fixture, to show more than one market in the Lobby.
  submitPrediction({ roomId: room1.id, userId: demoUserId, fixtureId: 103, market: "match_result", value: { market: "match_result", pick: "home" } });
  submitPrediction({ roomId: room1.id, userId: demoUserId, fixtureId: 103, market: "btts", value: { market: "btts", pick: false } });

  // Tournament Honors — left partially filled, like a manager still deciding on the rest.
  submitAwardPick({ roomId: room1.id, userId: demoUserId, award: "golden_boot", playerName: "Erling Haaland" });
  submitAwardPick({ roomId: room1.id, userId: demoUserId, award: "golden_ball", playerName: "Mohamed Salah" });
  submitAwardPick({ roomId: null, userId: demoUserId, award: "golden_boot", playerName: "Erling Haaland" });
  submitAwardPick({ roomId: null, userId: demoUserId, award: "young_player", playerName: "Cole Palmer" });

  // Custom questions — one already settled (graded), one still open, to demo both states.
  const settledQuestion = createCustomQuestion({
    roomId: room1.id,
    createdBy: demoUserId,
    questionText: "Will Arsenal finish in the top 4 this season?",
    type: "yes_no",
    options: null,
    opensAt: nowIso(),
    deadline: nowIso(),
    points: 3,
    context: null,
  });
  submitCustomQuestionAnswer({ questionId: settledQuestion.id, userId: demoUserId, answer: "yes" });
  submitCustomQuestionAnswer({ questionId: settledQuestion.id, userId: sam.id, answer: "no" });
  settleCustomQuestion(settledQuestion.id, demoUserId, ["yes"]);

  createCustomQuestion({
    roomId: room1.id,
    createdBy: demoUserId,
    questionText: "Who wins the Golden Boot this season?",
    type: "open_text",
    options: null,
    opensAt: nowIso(),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    points: 5,
    context: "Accepted answers will include common name variants (e.g. \"Man United\" / \"Manchester United\").",
  });
}

export function toProfile(user: MockUser): Profile {
  const { id, username, full_name, avatar_url, created_at, updated_at } = user;
  return { id, username, full_name, avatar_url, created_at, updated_at };
}

export function getRoomsForUser(
  userId: string
): { role: RoomMember["role"]; joined_at: string; room: Room }[] {
  return roomMembers
    .filter((m) => m.user_id === userId)
    .map((m) => ({
      role: m.role,
      joined_at: m.joined_at,
      room: rooms.get(m.room_id)!,
    }))
    .filter((entry) => entry.room != null)
    .sort((a, b) => b.joined_at.localeCompare(a.joined_at));
}

export function createRoom(
  userId: string,
  input: {
    name: string;
    description?: string | null;
    competitions?: number[];
    scope?: RoomScope;
    join_policy?: JoinPolicy;
    lock_preset?: LockPreset;
    enabled_markets?: MarketType[];
    scoring_config?: ScoringConfig;
    tiebreaker_order?: MarketType[];
    lonely_wolf_enabled?: boolean;
  }
): Room {
  const id = randomUUID();
  const timestamp = nowIso();
  const room: Room = {
    id,
    name: input.name,
    description: input.description ?? null,
    created_by: userId,
    invite_code: makeInviteCode(),
    is_active: true,
    created_at: timestamp,
    updated_at: timestamp,
    competitions: input.competitions ?? [39], // Premier League
    scope: input.scope ?? { type: "season" },
    join_policy: input.join_policy ?? "always_open",
    lock_preset: input.lock_preset ?? "5m", // spec default
    enabled_markets: input.enabled_markets ?? ["match_result", "exact_score", "btts", "total_goals"],
    scoring_config: input.scoring_config ?? { ...DEFAULT_SCORING_CONFIG },
    tiebreaker_order: input.tiebreaker_order ?? [],
    lonely_wolf_enabled: input.lonely_wolf_enabled ?? false,
  };
  rooms.set(id, room);
  roomMembers.push({ id: randomUUID(), room_id: id, user_id: userId, role: "owner", joined_at: timestamp });
  return room;
}

export function joinRoomByInviteCode(userId: string, code: string): Room {
  const normalized = code.trim().toUpperCase();
  const room = Array.from(rooms.values()).find((r) => r.invite_code === normalized);
  if (!room) throw new Error("Invalid invite code.");

  const alreadyMember = roomMembers.some((m) => m.room_id === room.id && m.user_id === userId);
  if (!alreadyMember) {
    roomMembers.push({ id: randomUUID(), room_id: room.id, user_id: userId, role: "participant", joined_at: nowIso() });
  }
  return room;
}

export function getRoomById(id: string): Room | undefined {
  return rooms.get(id);
}

/** Resolves a real room OR the synthetic Global room by the same id-based routing used everywhere ("global" literal). */
export function getEffectiveRoom(id: string): Room | undefined {
  if (id === "global") return GLOBAL_ROOM;
  return rooms.get(id);
}

export function isRoomMember(roomId: string, userId: string): boolean {
  return roomMembers.some((m) => m.room_id === roomId && m.user_id === userId);
}

/** Global is open to any authenticated user; real rooms require membership. */
export function canAccessRoom(id: string, userId: string): boolean {
  if (id === "global") return true;
  return isRoomMember(id, userId);
}

export function getRoomMembers(roomId: string): { userId: string; role: RoomMember["role"] }[] {
  return roomMembers
    .filter((m) => m.room_id === roomId)
    .map((m) => ({ userId: m.user_id, role: m.role }));
}

export function getMemberRole(roomId: string, userId: string): RoomRole | undefined {
  return roomMembers.find((m) => m.room_id === roomId && m.user_id === userId)?.role;
}

/** Owner or admin — the two roles allowed to manage members, invites, and custom questions. */
export function canManageRoom(roomId: string, userId: string): boolean {
  const role = getMemberRole(roomId, userId);
  return role === "owner" || role === "admin";
}

export function isRoomOwner(roomId: string, userId: string): boolean {
  return getMemberRole(roomId, userId) === "owner";
}

export function transferOwnership(roomId: string, currentOwnerId: string, newOwnerId: string): void {
  if (!isRoomOwner(roomId, currentOwnerId)) {
    throw new Error("Only the current owner can transfer ownership.");
  }
  const newOwnerMember = roomMembers.find((m) => m.room_id === roomId && m.user_id === newOwnerId);
  if (!newOwnerMember) throw new Error("New owner must already be a member of the room.");

  const currentOwnerMember = roomMembers.find((m) => m.room_id === roomId && m.user_id === currentOwnerId);
  if (currentOwnerMember) currentOwnerMember.role = "admin";
  newOwnerMember.role = "owner";
}

export function updateMemberRole(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
  newRole: Exclude<RoomRole, "owner">
): void {
  if (!canManageRoom(roomId, actorUserId)) {
    throw new Error("Only the owner or an admin can manage members.");
  }
  const targetMember = roomMembers.find((m) => m.room_id === roomId && m.user_id === targetUserId);
  if (!targetMember) throw new Error("Member not found.");
  if (targetMember.role === "owner") {
    throw new Error("The owner's role can't be changed this way — transfer ownership instead.");
  }
  targetMember.role = newRole;
}

export function removeMember(roomId: string, actorUserId: string, targetUserId: string): void {
  if (!canManageRoom(roomId, actorUserId)) {
    throw new Error("Only the owner or an admin can remove members.");
  }
  const target = roomMembers.find((m) => m.room_id === roomId && m.user_id === targetUserId);
  if (target?.role === "owner") throw new Error("The owner can't be removed.");

  const idx = roomMembers.findIndex((m) => m.room_id === roomId && m.user_id === targetUserId);
  if (idx >= 0) roomMembers.splice(idx, 1);
}

export function deleteRoom(roomId: string, actorUserId: string): void {
  if (!isRoomOwner(roomId, actorUserId)) {
    throw new Error("Only the owner can delete the room.");
  }
  rooms.delete(roomId);
  for (let i = roomMembers.length - 1; i >= 0; i--) {
    if (roomMembers[i].room_id === roomId) roomMembers.splice(i, 1);
  }
  for (let i = predictions.length - 1; i >= 0; i--) {
    if (predictions[i].room_id === roomId) predictions.splice(i, 1);
  }
  for (let i = customQuestions.length - 1; i >= 0; i--) {
    if (customQuestions[i].room_id === roomId) customQuestions.splice(i, 1);
  }
}

/** roomId is null for Global — the open, no-room-required prediction mode. */
export function submitPrediction(input: {
  roomId: string | null;
  userId: string;
  fixtureId: number;
  market: MarketType;
  value: PredictionValue;
}): Prediction {
  const existingIdx = predictions.findIndex(
    (p) =>
      p.room_id === input.roomId &&
      p.user_id === input.userId &&
      p.fixture_id === input.fixtureId &&
      p.market === input.market
  );
  const prediction: Prediction = {
    id: existingIdx >= 0 ? predictions[existingIdx].id : randomUUID(),
    room_id: input.roomId,
    user_id: input.userId,
    fixture_id: input.fixtureId,
    market: input.market,
    value: input.value,
    submitted_at: nowIso(),
  };
  if (existingIdx >= 0) predictions[existingIdx] = prediction;
  else predictions.push(prediction);
  return prediction;
}

export function getPredictionsForRoom(roomId: string | null): Prediction[] {
  return predictions.filter((p) => p.room_id === roomId);
}

export function getPredictionsForUser(roomId: string | null, userId: string): Prediction[] {
  return predictions.filter((p) => p.room_id === roomId && p.user_id === userId);
}

/** Every user who has ever predicted in this scope — used to build the Global leaderboard's participant list. */
export function getParticipantIdsForScope(roomId: string | null): string[] {
  return Array.from(new Set(predictions.filter((p) => p.room_id === roomId).map((p) => p.user_id)));
}

export function setTotalGoalsLine(roomId: string | null, fixtureId: number, line: number): TotalGoalsLine {
  const idx = totalGoalsLines.findIndex((l) => l.room_id === roomId && l.fixture_id === fixtureId);
  const entry: TotalGoalsLine = { room_id: roomId, fixture_id: fixtureId, line };
  if (idx >= 0) totalGoalsLines[idx] = entry;
  else totalGoalsLines.push(entry);
  return entry;
}

export function getTotalGoalsLine(roomId: string | null, fixtureId: number): TotalGoalsLine | undefined {
  return totalGoalsLines.find((l) => l.room_id === roomId && l.fixture_id === fixtureId);
}

export function getTotalGoalsLinesForRoom(roomId: string | null): TotalGoalsLine[] {
  return totalGoalsLines.filter((l) => l.room_id === roomId);
}

export function submitAwardPick(input: {
  roomId: string | null;
  userId: string;
  award: AwardCategory;
  playerName: string;
}): AwardPick {
  const existingIdx = awardPicks.findIndex(
    (a) => a.room_id === input.roomId && a.user_id === input.userId && a.award === input.award
  );
  const pick: AwardPick = {
    id: existingIdx >= 0 ? awardPicks[existingIdx].id : randomUUID(),
    room_id: input.roomId,
    user_id: input.userId,
    award: input.award,
    player_name: input.playerName,
    submitted_at: nowIso(),
  };
  if (existingIdx >= 0) awardPicks[existingIdx] = pick;
  else awardPicks.push(pick);
  return pick;
}

export function getAwardPicksForUser(roomId: string | null, userId: string): AwardPick[] {
  return awardPicks.filter((a) => a.room_id === roomId && a.user_id === userId);
}

export function createCustomQuestion(input: {
  roomId: string | null;
  createdBy: string;
  questionText: string;
  type: CustomQuestionType;
  options: string[] | null;
  opensAt: string;
  deadline: string;
  points: number;
  context: string | null;
}): CustomQuestion {
  if (input.roomId && !canManageRoom(input.roomId, input.createdBy)) {
    throw new Error("Only the owner or an admin can create custom questions.");
  }
  const question: CustomQuestion = {
    id: randomUUID(),
    room_id: input.roomId,
    question_text: input.questionText,
    type: input.type,
    options: input.options,
    opens_at: input.opensAt,
    deadline: input.deadline,
    points: input.points,
    context: input.context,
    correct_answer: null,
    created_by: input.createdBy,
    created_at: nowIso(),
  };
  customQuestions.push(question);
  return question;
}

export function getCustomQuestionsForRoom(roomId: string | null): CustomQuestion[] {
  return customQuestions.filter((q) => q.room_id === roomId);
}

export function getCustomQuestionById(id: string): CustomQuestion | undefined {
  return customQuestions.find((q) => q.id === id);
}

export function submitCustomQuestionAnswer(input: {
  questionId: string;
  userId: string;
  answer: string;
}): CustomQuestionAnswer {
  const existingIdx = customQuestionAnswers.findIndex(
    (a) => a.question_id === input.questionId && a.user_id === input.userId
  );
  const answer: CustomQuestionAnswer = {
    id: existingIdx >= 0 ? customQuestionAnswers[existingIdx].id : randomUUID(),
    question_id: input.questionId,
    user_id: input.userId,
    answer: input.answer,
    submitted_at: nowIso(),
  };
  if (existingIdx >= 0) customQuestionAnswers[existingIdx] = answer;
  else customQuestionAnswers.push(answer);
  return answer;
}

export function getCustomQuestionAnswerForUser(
  questionId: string,
  userId: string
): CustomQuestionAnswer | undefined {
  return customQuestionAnswers.find((a) => a.question_id === questionId && a.user_id === userId);
}

export function getAllAnswersForQuestion(questionId: string): CustomQuestionAnswer[] {
  return customQuestionAnswers.filter((a) => a.question_id === questionId);
}

/** Settling stores the creator's accepted answer(s) — open_text can accept several variants. */
export function settleCustomQuestion(
  questionId: string,
  actorUserId: string,
  correctAnswers: string[]
): CustomQuestion {
  const question = customQuestions.find((q) => q.id === questionId);
  if (!question) throw new Error("Question not found.");
  if (question.room_id && !canManageRoom(question.room_id, actorUserId)) {
    throw new Error("Only the owner or an admin can settle this question.");
  }
  question.correct_answer = correctAnswers;
  return question;
}
