import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("klipora_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const user = db.getUserById(sessionId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
