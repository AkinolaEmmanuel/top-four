import { NextResponse } from "next/server";
import {
  canAccessRoom,
  getEffectiveRoom,
  createCustomQuestion,
  getCustomQuestionsForRoom,
  getCustomQuestionAnswerForUser,
} from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import type { CustomQuestionType } from "@/types";

const VALID_TYPES: CustomQuestionType[] = ["yes_no", "true_false", "options", "open_text"];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const roomId = id === "global" ? null : id;
  const questions = getCustomQuestionsForRoom(roomId);
  const myAnswers: Record<string, string> = {};
  for (const question of questions) {
    const answer = getCustomQuestionAnswerForUser(question.id, session.userId);
    if (answer) myAnswers[question.id] = answer.answer;
  }

  return NextResponse.json({ questions, myAnswers });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const questionText = typeof body?.questionText === "string" ? body.questionText.trim() : "";
  const type = body?.type as CustomQuestionType;
  const options = Array.isArray(body?.options) ? body.options.filter((o: unknown) => typeof o === "string") : null;
  const opensAt = typeof body?.opensAt === "string" ? body.opensAt : new Date().toISOString();
  const deadline = typeof body?.deadline === "string" ? body.deadline : "";
  const points = Number(body?.points);
  const context = typeof body?.context === "string" && body.context.trim() ? body.context.trim() : null;

  if (!questionText || !VALID_TYPES.includes(type) || !deadline || !Number.isInteger(points) || points < 1 || points > 50) {
    return NextResponse.json({ error: "Fill in the question, type, deadline, and points (1–50)." }, { status: 400 });
  }
  if (type === "options" && (!options || options.length < 2)) {
    return NextResponse.json({ error: "Give at least two options." }, { status: 400 });
  }

  const roomId = id === "global" ? null : id;

  try {
    const question = createCustomQuestion({
      roomId,
      createdBy: session.userId,
      questionText,
      type,
      options: type === "options" ? options : null,
      opensAt,
      deadline,
      points,
      context,
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create question." }, { status: 403 });
  }
}
