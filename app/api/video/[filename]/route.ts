import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");
const FFPROBE = `ffprobe`;
const FFMPEG = `ffmpeg`;

export async function POST(req: NextRequest) {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const formData = await req.formData();
  const file = formData.get("video") as File | null;
  const durationRaw = formData.get("duration");

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  // Validar tipo de arquivo
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
    return NextResponse.json({ error: "Formato inválido. Use MP4, MOV, AVI ou WebM." }, { status: 400 });
  }

  const ALLOWED = [15, 30, 60, 120];
  const clipDuration = ALLOWED.includes(Number(durationRaw)) ? Number(durationRaw) : 30;

  const timestamp = Date.now();
  const ext = file.name.split(".").pop() || "mp4";
  const videoPath = path.join(DOWNLOADS_DIR, `video_${timestamp}.${ext}`);

  // Salvar arquivo no disco
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(videoPath, buffer);
    console.log(`Arquivo salvo: ${videoPath} (${Math.round(buffer.length / 1024)} KB)`);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao salvar o arquivo" }, { status: 500 });
  }

  // Detectar duração total com ffprobe
  let totalSeconds = 0;
  try {
    const probeCmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const output = execSync(probeCmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    totalSeconds = Math.floor(parseFloat(output.trim()));
    console.log(`Duração total: ${totalSeconds}s`);
  } catch (err: unknown) {
    const e = err as { message?: string; stderr?: string | Buffer };
    try { fs.unlinkSync(videoPath); } catch { }
    return NextResponse.json({
      error: "Falha ao ler o vídeo. Tente outro formato.",
      detail: e?.stderr?.toString?.() || e?.message
    }, { status: 500 });
  }

  if (totalSeconds < clipDuration) {
    try { fs.unlinkSync(videoPath); } catch { }
    return NextResponse.json({
      error: `Vídeo muito curto (${totalSeconds}s) para clips de ${clipDuration}s`
    }, { status: 400 });
  }

  // Cortar em múltiplos clips
  const clips: {
    clipUrl: string;
    clipFilename: string;
    start: number;
    end: number;
    sizeKB: number;
    index: number;
  }[] = [];

  const totalClips = Math.floor(totalSeconds / clipDuration);

  for (let i = 0; i < totalClips; i++) {
    const start = i * clipDuration;
    const clipFilename = `clip_${timestamp}_${i + 1}.mp4`;
    const clipPath = path.join(DOWNLOADS_DIR, clipFilename);

    try {
      const ffmpegCmd = `${FFMPEG} -y -i "${videoPath}" -ss ${start} -t ${clipDuration} -c:v libx264 -c:a aac -preset fast "${clipPath}"`;
      execSync(ffmpegCmd, { cwd: ROOT_DIR, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

      if (fs.existsSync(clipPath)) {
        const sizeKB = Math.round(fs.statSync(clipPath).size / 1024);
        clips.push({
          index: i + 1,
          clipUrl: `/api/video/${clipFilename}`,
          clipFilename,
          start,
          end: start + clipDuration,
          sizeKB,
        });
      }
    } catch (err) {
      console.error(`Erro no clip ${i + 1}:`, err);
    }
  }

  // Limpar vídeo original
  try { fs.unlinkSync(videoPath); } catch { }

  if (clips.length === 0) {
    return NextResponse.json({ error: "Nenhum clip gerado" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `${clips.length} clips gerados com sucesso!`,
    clips,
    totalClips: clips.length,
    clipDuration,
    totalSeconds,
    videoSizeKB: Math.round(clips.reduce((acc, c) => acc + c.sizeKB, 0)),
  });
}