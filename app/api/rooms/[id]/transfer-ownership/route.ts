import { NextResponse } from "next/server";
import { transferOwnership } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const newOwnerId = typeof body?.userId === "string" ? body.userId : "";

  if (!newOwnerId) {
    return NextResponse.json({ error: "Choose a member to transfer ownership to." }, { status: 400 });
  }

  try {
    transferOwnership(id, session.userId, newOwnerId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not transfer ownership." }, { status: 403 });
  }
}
