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

  let body: { url?: string; duration?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const videoUrl = body?.url?.trim();
  if (!videoUrl || !videoUrl.startsWith("http")) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const ALLOWED = [15, 30, 60, 120];
  const clipDuration = ALLOWED.includes(body?.duration ?? 0) ? body!.duration! : 30;

  const timestamp = Date.now();
  const videoPath = path.join(DOWNLOADS_DIR, `video_${timestamp}.mp4`);
  const cookiesPath = path.join(DOWNLOADS_DIR, `cookies_${timestamp}.txt`);

  function detectPython(): string {
    for (const cmd of ["python3", "python", "py"]) {
      try { execSync(`${cmd} --version`, { stdio: "pipe" }); return cmd; } catch { }
    }
    throw new Error("Python não encontrado.");
  }

  // Salvar cookies do env em arquivo temporário
  let cookiesFlag = "";
  const cookiesEnv = process.env.YOUTUBE_COOKIES;
  if (cookiesEnv) {
    fs.writeFileSync(cookiesPath, cookiesEnv, "utf8");
    cookiesFlag = `--cookies "${cookiesPath}"`;
  }

  // 1. Download com remote-components para resolver JS challenge do YouTube
  try {
    const python = detectPython();
    const downloadCmd = `${python} -m yt_dlp -f "best[ext=mp4]/best" ${cookiesFlag} --remote-components ejs:github -o "${videoPath}" "${videoUrl}"`;
    console.log("Download cmd:", downloadCmd);
    execSync(downloadCmd, { cwd: ROOT_DIR, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (err: unknown) {
    const e = err as { message?: string; stderr?: string | Buffer };
    if (fs.existsSync(cookiesPath)) fs.unlinkSync(cookiesPath);
    return NextResponse.json({
      error: "Falha no download",
      detail: e?.stderr?.toString?.() || e?.message
    }, { status: 500 });
  }

  // Limpar cookies após uso
  if (fs.existsSync(cookiesPath)) fs.unlinkSync(cookiesPath);

  if (!fs.existsSync(videoPath)) {
    return NextResponse.json({ error: "Arquivo não encontrado após download" }, { status: 500 });
  }

  // 2. Detectar duração total com ffprobe
  let totalSeconds = 0;
  try {
    const probeCmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const output = execSync(probeCmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    totalSeconds = Math.floor(parseFloat(output.trim()));
    console.log(`Duração total: ${totalSeconds}s`);
  } catch (err: unknown) {
    const e = err as { message?: string; stderr?: string | Buffer };
    return NextResponse.json({
      error: "Falha ao detectar duração do vídeo",
      detail: e?.stderr?.toString?.() || e?.message
    }, { status: 500 });
  }

  if (totalSeconds < clipDuration) {
    return NextResponse.json({
      error: `Vídeo muito curto (${totalSeconds}s) para clips de ${clipDuration}s`
    }, { status: 400 });
  }

  // 3. Cortar em múltiplos clips
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
      const ffmpegCmd = `${FFMPEG} -y -i "${videoPath}" -ss ${start} -t ${clipDuration} -c copy "${clipPath}"`;
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

  // 4. Limpar vídeo original
  try { fs.unlinkSync(videoPath); } catch { }

  if (clips.length === 0) {
    return NextResponse.json({ error: "Nenhum clip gerado" }, { status: 500 });
  }

  const videoSizeKB = Math.round(clips.reduce((acc, c) => acc + c.sizeKB, 0));

  return NextResponse.json({
    success: true,
    message: `${clips.length} clips gerados com sucesso!`,
    clips,
    totalClips: clips.length,
    clipDuration,
    totalSeconds,
    videoSizeKB,
  });
}