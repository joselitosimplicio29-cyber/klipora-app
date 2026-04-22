import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "clip.mp4";

  if (!url) {
    return NextResponse.json({ error: "url obrigatória" }, { status: 400 });
  }

  // Só permite URLs do R2 público configurado
  const R2_PUBLIC = process.env.R2_PUBLIC_URL ?? "";
  if (R2_PUBLIC && !url.startsWith(R2_PUBLIC)) {
    return NextResponse.json({ error: "URL não permitida" }, { status: 403 });
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      return NextResponse.json({ error: `Erro ao buscar arquivo: ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "video/mp4";
    const body = res.body;
    if (!body) return NextResponse.json({ error: "Sem conteúdo" }, { status: 502 });

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
