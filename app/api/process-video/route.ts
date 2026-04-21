import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");
const FFPROBE = `ffprobe`;
const FFMPEG = `ffmpeg`;

export const maxDuration = 300;

async function uploadToR2(filePath: string, key: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: "video/mp4",
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function POST(req: NextRequest) {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const videoPath = path.join(DOWNLOADS_DIR, `video_${timestamp}.mp4`);
  const ALLOWED = [15, 30, 60, 120];
  let clipDuration = 30;
  let format = "original";

  const contentType = req.headers.get("content-type") || "";

  // ── MODO 1: UPLOAD DE ARQUIVO ──────────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Erro ao ler FormData" }, { status: 400 });
    }

    const file = formData.get("video") as File | null;
    const durationRaw = formData.get("duration");
    const formatRaw = formData.get("format");

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const dur = parseInt(String(durationRaw ?? "30"));
    clipDuration = ALLOWED.includes(dur) ? dur : 30;
    format = String(formatRaw ?? "original");

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json({ error: "Falha ao salvar arquivo", detail: e?.message }, { status: 500 });
    }

  // ── MODO 2: URL DO YOUTUBE ─────────────────────────────────────────────────
  } else if (contentType.i