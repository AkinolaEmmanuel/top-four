import { NextResponse } from "next/server";
import {
  canAccessRoom,
  getEffectiveRoom,
  getCustomQuestionById,
  submitCustomQuestionAnswer,
} from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, qid } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const question = getCustomQuestionById(qid);
  if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });
  if (new Date() > new Date(question.deadline)) {
    return NextResponse.json({ error: "🔒 This question's deadline has passed." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  if (!answer) {
    return NextResponse.json({ error: "Enter an answer." }, { status: 400 });
  }

  const saved = submitCustomQuestionAnswer({ questionId: qid, userId: session.userId, answer });
  return NextResponse.json({ answer: saved }, { status: 201 });
}
