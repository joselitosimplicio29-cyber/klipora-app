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

  } else if (contentType.includes("application/json")) {
    let body: { url?: string; duration?: number; format?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const videoUrl = body?.url?.trim();
    if (!videoUrl || !videoUrl.startsWith("http")) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const dur = body?.duration ?? 30;
    clipDuration = ALLOWED.includes(dur) ? dur : 30;
    format = body?.format ?? "original";

    // Extrai o ID do vídeo do YouTube (suporta /watch?v=, youtu.be/, /shorts/)
    const ytMatch = videoUrl.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    const videoId = ytMatch?.[1];
    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo não encontrado. Cole um link válido do YouTube." }, { status: 400 });
    }

    // Baixa o vídeo diretamente com yt-dlp (mais confiável que ffmpeg + RapidAPI)
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const ytDlpCmd = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 --no-playlist -o "${videoPath}" "${ytUrl}"`;
      execSync(ytDlpCmd, { cwd: ROOT_DIR, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 300000 });
    } catch (err: unknown) {
      const e = err as { message?: string; stderr?: string | Buffer };
      const detail = e?.stderr?.toString?.() || e?.message || String(err);
      return NextResponse.json({ error: "Erro ao baixar vídeo do YouTube", detail: detail.slice(0, 500) }, { status: 500 });
    }

  } else {
    return NextResponse.json({ error: "Content-Type não suportado" }, { status: 400 });
  }

  if (!fs.existsSync(videoPath)) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 500 });
  }

  let totalSeconds = 0;
  try {
    const probeCmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const output = execSync(probeCmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    totalSeconds = Math.floor(parseFloat(output.trim()));
  } catch (err: unknown) {
    const e = err as { message?: string; stderr?: string | Buffer };
    try { fs.unlinkSync(videoPath); } catch { }
    return NextResponse.json({ error: "Falha ao detectar duração", detail: e?.stderr?.toString?.() || e?.message }, { status: 500 });
  }

  if (totalSeconds < clipDuration) {
    try { fs.unlinkSync(videoPath); } catch { }
    return NextResponse.json({ error: `Vídeo muito curto (${totalSeconds}s) para clips de ${clipDuration}s` }, { status: 400 });
  }

  const clips: {
    clipUrl: string;
    clipFilename: string;
    start: number;
    end: number;
    sizeKB: number;
    index: number;
  }[] = [];
  const clipErrors: string[] = [];

  const totalClips = Math.floor(totalSeconds / clipDuration);
  const videoFilter = format === "9:16" ? `-vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0"` : "";
  const videoCodec = format === "9:16" ? "-c:v libx264 -preset fast -crf 23" : "-c:v copy";

  for (let i = 0; i < totalClips; i++) {
    const start = i * clipDuration;
    const clipFilename = `clip_${timestamp}_${i + 1}.mp4`;
    const clipPath = path.join(DOWNLOADS_DIR, clipFilename);

    try {
      const ffmpegCmd = `${FFMPEG} -y -i "${videoPath}" -ss ${start} -t ${clipDuration} ${videoFilter} ${videoCodec} -c:a copy "${clipPath}"`;
      execSync(ffmpegCmd, { cwd: ROOT_DIR, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

      if (fs.existsSync(clipPath)) {
        const sizeKB = Math.round(fs.statSync(clipPath).size / 1024);
        const r2Key = `clips/${clipFilename}`;
        const publicUrl = await uploadToR2(clipPath, r2Key);

        clips.push({
          index: i + 1,
          clipUrl: publicUrl,
          clipFilename,
          start,
          end: start + clipDuration,
          sizeKB,
        });

        try { fs.unlinkSync(clipPath); } catch { }
      } else {
        clipErrors.push(`Clip ${i + 1}: FFmpeg não gerou o arquivo`);
      }
    } catch (err: unknown) {
      const e = err as { message?: string; stderr?: string | Buffer };
      const detail = e?.stderr?.toString?.() || e?.message || String(err);
      clipErrors.push(`Clip ${i + 1}: ${detail.slice(0, 300)}`);
      console.error(`Erro no clip ${i + 1}:`, detail);
    }
  }

  try { fs.unlinkSync(videoPath); } catch { }

  if (clips.length === 0) {
    return NextResponse.json({
      error: "Nenhum clip gerado",
      detail: clipErrors.join("\n"),
      clipErrors,
      totalSeconds,
      clipDuration,
      downloadsDir: DOWNLOADS_DIR,
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `${clips.length} clips gerados!`,
    clips,
    totalClips: clips.length,
    clipDuration,
    totalSeconds,
    format,
    videoSizeKB: Math.round(clips.reduce((acc, c) => acc + c.sizeKB, 0)),
  });
}
