import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "clip.mp4";
  const dl = req.nextUrl.searchParams.get("dl") === "1"; // ?dl=1 → força download

  if (!url) return NextResponse.json({ error: "url obrigatória" }, { status: 400 });

  // Valida origem
  const R2_PUBLIC = process.env.R2_PUBLIC_URL ?? "";
  if (R2_PUBLIC && !url.startsWith(R2_PUBLIC)) {
    return NextResponse.json({ error: "URL não permitida" }, { status: 403 });
  }

  // Repassa Range header para o R2 (necessário para seek no player HTML5)
  const rangeHeader = req.headers.get("range");
  const upstream = await fetch(url, {
    headers: rangeHeader ? { range: rangeHeader } : {},
    signal: AbortSignal.timeout(60000),
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: `Upstream error: ${upstream.status}` }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  if (contentLength) headers["Content-Length"] = contentLength;
  if (contentRange) headers["Content-Range"] = contentRange;
  if (dl) headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(filename)}"`;

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
