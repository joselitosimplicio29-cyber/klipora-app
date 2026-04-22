import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { igUserId, videoUrl, caption } = await req.json();

    if (!igUserId || !videoUrl) {
      return NextResponse.json({ error: "igUserId e videoUrl são obrigatórios" }, { status: 400 });
    }

    // 1. Criar o Container de Mídia (Reels)
    const createUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=REELS&video_url=${encodeURIComponent(videoUrl)}&caption=${encodeURIComponent(caption || "")}&access_token=${token}`;
    const createRes = await fetch(createUrl, { method: "POST" });
    const createData = await createRes.json();

    if (createData.error) {
      return NextResponse.json({ error: createData.error.message }, { status: 400 });
    }

    const containerId = createData.id;

    return NextResponse.json({ success: true, containerId });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
