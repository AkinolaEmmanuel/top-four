import { NextResponse } from "next/server";
import { getEffectiveRoom, settleCustomQuestion } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, qid } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const correctAnswers = Array.isArray(body?.correctAnswers)
    ? body.correctAnswers.filter((a: unknown): a is string => typeof a === "string" && a.trim().length > 0)
    : [];

  if (correctAnswers.length === 0) {
    return NextResponse.json({ error: "Provide at least one accepted answer." }, { status: 400 });
  }

  try {
    const question = settleCustomQuestion(qid, session.userId, correctAnswers);
    return NextResponse.json({ question });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not settle question." }, { status: 403 });
  }
}
