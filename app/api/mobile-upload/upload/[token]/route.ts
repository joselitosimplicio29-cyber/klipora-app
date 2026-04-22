import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/uploadTokens";
import path from "path";
import fs from "fs";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = getSession(token);

  if (!session) {
    return NextResponse.json({ error: "Token expirado ou inválido" }, { status: 404 });
  }

  updateSession(token, { status: "uploading", progress: 10 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Erro ao ler arquivo" }, { status: 400 });
  }

  const file = formData.get("video") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const ext = file.name.split(".").pop() || "mp4";
  const filename = `mobile_${token.slice(0, 8)}.${ext}`;
  const videoPath = path.join(DOWNLOADS_DIR, filename);

  try {
    updateSession(token, { progress: 50 });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(videoPath, buffer);
    updateSession(token, { status: "done", progress: 100, videoPath, filename });
    return NextResponse.json({ ok: true });
  } catch (e) {
    updateSession(token, { status: "expired" });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
