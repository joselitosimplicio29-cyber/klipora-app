import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { igUserId, containerId, publish } = await req.json();

    if (!containerId) {
      return NextResponse.json({ error: "containerId é obrigatório" }, { status: 400 });
    }

    // Consultar status
    const statusUrl = `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${token}`;
    const statusRes = await fetch(statusUrl);
    const statusData = await statusRes.json();

    if (statusData.error) {
      return NextResponse.json({ error: statusData.error.message }, { status: 400 });
    }

    if (statusData.status_code === "FINISHED" && publish && igUserId) {
      // Tentar publicar
      const pubUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${containerId}&access_token=${token}`;
      const pubRes = await fetch(pubUrl, { method: "POST" });
      const pubData = await pubRes.json();

      if (pubData.error) {
         return NextResponse.json({ error: pubData.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, published: true, id: pubData.id });
    }

    return NextResponse.json({ success: true, status: statusData.status_code });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
