import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    // Ensure user exists in DB
    const user = db.createUser(email);

    // Save session in cookie
    const cookieStore = await cookies();
    cookieStore.set("klipora_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
