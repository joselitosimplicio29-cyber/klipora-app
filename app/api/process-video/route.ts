import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");
const FFPROBE = `ffprobe`;
const FFMPEG = `ffmpeg`;

export const maxDuration = 300;

// Estilos de legenda (burn-in via FFmpeg ASS force_style)
// FontSize menor pois os clips geralmente são 9:16 / 720p vertical
const SUBTITLE_STYLES: Record<string, string> = {
  minimalista: `Fontname=Arial,FontSize=13,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2,MarginV=60`,
  hormozi:     `Fontname=Arial,FontSize=14,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,Outline=3,Bold=1,Alignment=2,MarginV=60`,
  neon:        `Fontname=Arial,FontSize=13,PrimaryColour=&H00FFFF00,OutlineColour=&H00FF00FF,Outline=3,Alignment=2,MarginV=60`,
  bold:        `Fontname=Arial,FontSize=13,PrimaryColour=&H00FFFFFF,BackColour=&H90000000,BorderStyle=4,Outline=0,Shadow=0,Alignment=2,MarginV=60`,
};

interface ProcessedClip {
  clipUrl: string;
  clipFilename: string;
  start: number;
  end: number;
  sizeKB: number;
  index: number;
  subtitle: string;
  captions_url: string;
  srt_url: string;
  copy: { 
    legendas: { curta: string; media: string; longa: string }; 
    hooks: string[]; 
    hashtags: string[] 
  };
}


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

async function uploadTextToR2(content: string, key: string, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: Buffer.from(content, "utf-8"),
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

function secondsToVTT(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
}

function secondsToSRT(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

// Quebra um segmento longo em chunks curtos (max N palavras por entrada)
// Isso cria o efeito "TikTok/Reels" com poucas palavras por frame
function splitToChunks(
  segments: Array<{ start: number; end: number; text: string }>,
  wordsPerChunk = 4
): Array<{ start: number; end: number; text: string }> {
  const result: Array<{ start: number; end: number; text: string }> = [];
  for (const seg of segments) {
    const words = seg.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const duration = seg.end - seg.start;
    const timePerWord = duration / words.length;
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk);
      const chunkStart = seg.start + i * timePerWord;
      const chunkEnd = Math.min(seg.start + (i + wordsPerChunk) * timePerWord, seg.end);
      result.push({ start: chunkStart, end: chunkEnd, text: chunk.join(" ") });
    }
  }
  return result;
}

function buildVTT(segments: Array<{ start: number; end: number; text: string }>): string {
  // VTT para o player web: segmentos originais (mais legível)
  let vtt = "WEBVTT\n\n";
  for (const seg of segments) {
    const text = seg.text.trim();
    if (!text) continue;
    vtt += `${secondsToVTT(seg.start)} --> ${secondsToVTT(seg.end)}\n${text}\n\n`;
  }
  return vtt;
}

function buildSRT(
  segments: Array<{ start: number; end: number; text: string }>,
  shortChunks = true
): string {
  // SRT para burn-in: chunks curtos (efeito viral)
  const entries = shortChunks ? splitToChunks(segments, 4) : segments;
  return entries
    .filter(s => s.text.trim())
    .map((seg, i) => `${i + 1}\n${secondsToSRT(seg.start)} --> ${secondsToSRT(seg.end)}\n${seg.text.trim()}\n`)
    .join("\n");
}

type Segment = { start: number; end: number; text: string };

async function generateSubtitles(clipPath: string): Promise<{
  vttContent: string;
  srtContent: string;
  subtitle: string;
  segments: Segment[];
}> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return { vttContent: "", srtContent: "", subtitle: "", segments: [] };

  const audioPath = clipPath.replace(".mp4", "_audio.mp3");
  try {
    execSync(
      `${FFMPEG} -y -i "${clipPath}" -vn -ar 16000 -ac 1 -b:a 64k "${audioPath}"`,
      { stdio: ["pipe", "pipe", "pipe"], timeout: 60000 }
    );

    const audioBuffer = fs.readFileSync(audioPath);
    const groqForm = new FormData();
    groqForm.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "audio.mp3");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("response_format", "verbose_json");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: groqForm,
    });

      const data = await groqRes.json() as {
        text?: string;
        segments?: Segment[];
      };
      const segments = data.segments ?? [];
      return {
        vttContent: buildVTT(segments),
        srtContent: buildSRT(segments),
        subtitle: data.text?.trim() ?? "",
        segments,
      };
    }
  } catch {
    // legendas são opcionais
  } finally {
    try { fs.unlinkSync(audioPath); } catch { }
  }
  return { vttContent: "", srtContent: "", subtitle: "", segments: [] };
}
async function generateCopy(subtitle: string): Promise<{
  legendas: { curta: string; media: string; longa: string };
  hooks: string[];
  hashtags: string[];
}> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY || !subtitle) {
    return { legendas: { curta: "", media: "", longa: "" }, hooks: [], hashtags: [] };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
        messages: [{
          role: "user",
          content: `Dado este trecho de vídeo, gere em JSON:
- legendas: { curta (até 100 chars), media (até 200 chars), longa (até 400 chars) }
- hooks: array com 3 frases de gancho de 1 linha
- hashtags: array com 10 hashtags (5 nicho + 5 amplas)

Trecho: "${subtitle.slice(0, 500)}"

Responda APENAS com JSON válido.`,
        }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content ?? "{}";
      return JSON.parse(content);
    }
  } catch {
    // copy é opcional
  }
  return { legendas: { curta: "", media: "", longa: "" }, hooks: [], hashtags: [] };
}

export async function POST(req: NextRequest) {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("klipora_session")?.value;
  const user = sessionId ? db.getUserById(sessionId) : null;
  const isPro = user?.isPro || false;

  const timestamp = Date.now();
  const videoPath = path.join(DOWNLOADS_DIR, `video_${timestamp}.mp4`);
  const ALLOWED = [15, 30, 60, 120];
  let clipDuration = 30;
  let format = "original";
  let subtitleStyle = "none";
  let preuploadedPath: string | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try { formData = await req.formData(); }
    catch { return NextResponse.json({ error: "Erro ao ler FormData" }, { status: 400 }); }

    const file = formData.get("video") as File | null;
    const durationRaw = formData.get("duration");
    const formatRaw = formData.get("format");
    const styleRaw = formData.get("subtitleStyle");

    if (!file || file.size === 0) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

    const dur = parseInt(String(durationRaw ?? "30"));
    clipDuration = ALLOWED.includes(dur) ? dur : 30;
    format = String(formatRaw ?? "original");
    subtitleStyle = String(styleRaw ?? "none");

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json({ error: "Falha ao salvar arquivo", detail: e?.message }, { status: 500 });
    }

  } else if (contentType.includes("application/json")) {
    let body: { preuploadedPath?: string; duration?: number; format?: string; subtitleStyle?: string };
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

    const dur = body?.duration ?? 30;
    clipDuration = ALLOWED.includes(dur) ? dur : 30;
    format = body?.format ?? "original";
    subtitleStyle = body?.subtitleStyle ?? "none";

    if (body?.preuploadedPath) {
      // Arquivo já está no servidor (upload mobile)
      const safePath = path.resolve(body.preuploadedPath);
      if (!safePath.startsWith(DOWNLOADS_DIR)) {
        return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
      }
      if (!fs.existsSync(safePath)) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }
      preuploadedPath = safePath;
      // Copiar para videoPath padronizado
      fs.copyFileSync(safePath, videoPath);
    } else {
      return NextResponse.json({ error: "Parâmetros inválidos. Use upload de arquivo ou preuploadedPath." }, { status: 400 });
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
    // Se o vídeo for menor que a duração desejada, simplesmente usamos a duração total do vídeo
    // Isso evita o erro de "vídeo muito curto"
    clipDuration = totalSeconds;
  }

  if (totalSeconds < 1) {
    try { fs.unlinkSync(videoPath); } catch { }
    return NextResponse.json({ error: "Vídeo inválido ou sem duração detectada." }, { status: 400 });
  }

  const clips: ProcessedClip[] = [];
  const clipErrors: string[] = [];

  const totalClips = isPro ? Math.floor(totalSeconds / clipDuration) : 1;
  const watermarkFilter = !isPro ? `,drawtext=text='KLIPORA.COM.BR':x=w-tw-20:y=20:fontsize=28:fontcolor=white@0.6:box=1:boxcolor=black@0.4:boxborderw=5` : "";
  const videoFilter = format === "9:16" ? `-vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0${watermarkFilter}"` : (watermarkFilter ? `-vf "${watermarkFilter.slice(1)}"` : "");
  const videoCodec = (format === "9:16" || !isPro) ? "-c:v libx264 -preset fast -crf 23" : "-c:v copy";
  const hasStyle = subtitleStyle !== "none" && subtitleStyle in SUBTITLE_STYLES;

  for (let i = 0; i < totalClips; i++) {
    const start = i * clipDuration;
    const clipFilename = `clip_${timestamp}_${i + 1}.mp4`;
    const clipPath = path.join(DOWNLOADS_DIR, clipFilename);

    try {
      const ffmpegCmd = `${FFMPEG} -y -i "${videoPath}" -ss ${start} -t ${clipDuration} ${videoFilter} ${videoCodec} -c:a copy "${clipPath}"`;
      execSync(ffmpegCmd, { cwd: ROOT_DIR, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

      if (!fs.existsSync(clipPath)) { clipErrors.push(`Clip ${i + 1}: FFmpeg não gerou o arquivo`); continue; }

      const sizeKB = Math.round(fs.statSync(clipPath).size / 1024);
      const r2Key = `clips/${clipFilename}`;

      // Gera transcrição
      const { vttContent, srtContent, subtitle, segments } = await generateSubtitles(clipPath);

      // Gera copy IA
      const copy = await generateCopy(subtitle);

      // Burn-in de legenda se estilo selecionado
      let finalClipPath = clipPath;
      if (hasStyle && srtContent) {
        const srtPath = clipPath.replace(".mp4", ".srt");
        fs.writeFileSync(srtPath, srtContent);
        const burnedPath = clipPath.replace(".mp4", "_sub.mp4");
        const styleStr = SUBTITLE_STYLES[subtitleStyle];
        try {
          // Escapa a path para o filtro do ffmpeg (Windows e Linux)
          const escapedSrt = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");
          execSync(
            `${FFMPEG} -y -i "${clipPath}" -vf "subtitles='${escapedSrt}':force_style='${styleStr}'" -c:v libx264 -preset fast -crf 23 -c:a copy "${burnedPath}"`,
            { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 120000 }
          );
          if (fs.existsSync(burnedPath)) {
            finalClipPath = burnedPath;
            try { fs.unlinkSync(clipPath); } catch { }
          }
        } catch {
          // burn-in falhou — usa clip original
        } finally {
          try { fs.unlinkSync(srtPath); } catch { }
        }
      }

      // Upload do clip para R2
      const publicUrl = await uploadToR2(finalClipPath, r2Key);

      // Upload VTT
      let captions_url = "";
      if (vttContent) {
        const vttKey = `captions/${clipFilename.replace(".mp4", ".vtt")}`;
        captions_url = await uploadTextToR2(vttContent, vttKey, "text/vtt");
      }

      // Upload SRT
      let srt_url = "";
      if (srtContent) {
        const srtKey = `captions/${clipFilename.replace(".mp4", ".srt")}`;
        srt_url = await uploadTextToR2(srtContent, srtKey, "text/plain");
      }

      clips.push({ index: i + 1, clipUrl: publicUrl, clipFilename, start, end: start + clipDuration, sizeKB, subtitle, captions_url, srt_url, copy });

      try { fs.unlinkSync(finalClipPath); } catch { }
    } catch (err: unknown) {
      const e = err as { message?: string; stderr?: string | Buffer };
      const detail = e?.stderr?.toString?.() || e?.message || String(err);
      clipErrors.push(`Clip ${i + 1}: ${detail.slice(0, 300)}`);
    }
  }

  // Limpar arquivo mobile pré-enviado
  if (preuploadedPath) try { fs.unlinkSync(preuploadedPath); } catch { }
  try { fs.unlinkSync(videoPath); } catch { }

  if (clips.length === 0) {
    return NextResponse.json({ error: "Nenhum clip gerado", detail: clipErrors.join("\n"), clipErrors, totalSeconds, clipDuration, downloadsDir: DOWNLOADS_DIR }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `${clips.length} clips gerados!`,
    clips,
    totalClips: clips.length,
    clipDuration,
    totalSeconds,
    format,
    subtitleStyle,
    videoSizeKB: Math.round(clips.reduce((acc, c) => acc + c.sizeKB, 0)),
  });
}
