import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");
const FFMPEG = "ffmpeg";

function resolveDownloadUrl(url: string): string {
  // Google Drive: /file/d/ID/view → uc?export=download&id=ID
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && url.includes("drive.google.com")) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}&confirm=t`;
  }
  // Dropbox: ?dl=0 → ?dl=1
  if (url.includes("dropbox.com")) {
    return url
      .replace("?dl=0", "?dl=1")
      .replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }
  // Link direto — usa como está
  return url;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const rawUrl = body?.url?.trim();
  if (!rawUrl || !rawUrl.startsWith("http")) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const downloadUrl = resolveDownloadUrl(rawUrl);

  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const videoPath = path.join(DOWNLOADS_DIR, `link_${timestamp}.mp4`);

  try {
    // Usa ffmpeg para baixar e converter para mp4 (garante compatibilidade)
    execSync(
      `${FFMPEG} -y -user_agent "Mozilla/5.0" -i "${downloadUrl}" -c copy "${videoPath}"`,
      { timeout: 300000, stdio: "pipe" }
    );
  } catch (e) {
    // Fallback: download direto com fetch
    try {
      const res = await fetch(downloadUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
    } catch (e2) {
      return NextResponse.json(
        { error: "Não foi possível baixar o arquivo", detail: String(e2) },
        { status: 500 }
      );
    }
  }

  if (!fs.existsSync(videoPath)) {
    return NextResponse.json({ error: "Arquivo não gerado" }, { status: 500 });
  }

  const sizeKB = Math.round(fs.statSync(videoPath).size / 1024);
  return NextResponse.json({ ok: true, videoPath, sizeKB });
}
