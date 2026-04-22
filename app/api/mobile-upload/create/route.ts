import { NextResponse } from "next/server";
import { createSession } from "@/lib/uploadTokens";
import { randomUUID } from "crypto";

export async function POST() {
  const token = randomUUID();
  createSession(token);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://klipora-app-production.up.railway.app";
  const uploadUrl = `${baseUrl}/m/upload/${token}`;

  return NextResponse.json({ token, uploadUrl });
}
