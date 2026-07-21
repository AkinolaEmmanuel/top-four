import { NextResponse } from "next/server";
import { createRoom } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import { LOCK_PRESET_MINUTES, type LockPreset, type MarketType } from "@/types";

const VALID_MARKETS: MarketType[] = ["match_result", "exact_score", "btts", "total_goals"];
const VALID_LOCK_PRESETS = Object.keys(LOCK_PRESET_MINUTES) as LockPreset[];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Give your room a name." }, { status: 400 });
  }

  const competitions = Array.isArray(body?.competitions)
    ? body.competitions.filter((n: unknown): n is number => typeof n === "number")
    : undefined;

  const scope =
    body?.scope && typeof body.scope === "object" && typeof body.scope.type === "string"
      ? body.scope
      : undefined;

  const join_policy = body?.join_policy === "closes_at_start" || body?.join_policy === "always_open" ? body.join_policy : undefined;

  const lock_preset = VALID_LOCK_PRESETS.includes(body?.lock_preset) ? (body.lock_preset as LockPreset) : undefined;

  const enabled_markets = Array.isArray(body?.enabled_markets)
    ? body.enabled_markets.filter((m: unknown): m is MarketType => VALID_MARKETS.includes(m as MarketType))
    : undefined;

  const scoring_config =
    body?.scoring_config && typeof body.scoring_config === "object" ? body.scoring_config : undefined;

  const tiebreaker_order = Array.isArray(body?.tiebreaker_order)
    ? body.tiebreaker_order.filter((m: unknown): m is MarketType => VALID_MARKETS.includes(m as MarketType))
    : undefined;

  const lonely_wolf_enabled = typeof body?.lonely_wolf_enabled === "boolean" ? body.lonely_wolf_enabled : undefined;

  const room = createRoom(session.userId, {
    name,
    description: description || null,
    competitions,
    scope,
    join_policy,
    lock_preset,
    enabled_markets,
    scoring_config,
    tiebreaker_order,
    lonely_wolf_enabled,
  });

  return NextResponse.json({ room }, { status: 201 });
}
