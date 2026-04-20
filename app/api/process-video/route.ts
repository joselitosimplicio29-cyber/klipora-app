import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, "downloads");
const FFPROBE = "ffprobe";
const FFMPEG = "ffmpeg";

export const maxDuration = 300;

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
      return NextResponse.json(
        { error: "Erro ao ler FormData" },
        { status: 400 }
      );
    }

    const file = formData.get("video") as File | null;
    const durationRaw = formData.get("duration");
    const formatRaw = formData.get("format");

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const dur = parseInt(String(durationRaw ?? "30"), 10);
    clipDuration = ALLOWED.includes(dur) ? dur : 30;
    format = String(formatRaw ?? "original");

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json(
        { error: "Falha ao salvar arquivo", detail: e?.message },
        { status: 500 }
      );
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

    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: "RAPIDAPI_KEY não configurada" },
        { status: 500 }
      );
    }

    const ytMatch = videoUrl.match(
      /(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/
    );
    const videoId = ytMatch?.[1];

    if (!videoId) {
      return NextResponse.json(
        { error: "ID do vídeo não encontrado na URL" },
        { status: 400 }
      );
    }

    let downloadUrl = "";

    try {
      const apiRes = await fetch(
        `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "ytstream-download-youtube-videos.p.rapidapi.com",
            "x-rapidapi-key": RAPIDAPI_KEY,
          },
        }
      );

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        return NextResponse.json(
          { error: "Falha na API YTStream", detail: errText },
          { status: 500 }
        );
      }

      const apiData = await apiRes.json();
      const formats = apiData?.formats || apiData?.adaptiveFormats || [];

      const mp4WithAudio = formats.find(
        (f: { mimeType?: string; url?: string; audioQuality?: string }) =>
          f.mimeType?.includes("video/mp4") && f.url && f.audioQuality
      );

      const mp4Any = formats.find(
        (f: { mimeType?: string; url?: string }) =>
          f.mimeType?.includes("video/mp4") && f.url
      );

      if (mp4WithAudio?.url) {
        downloadUrl = mp4WithAudio.url;
      } else if (mp4Any?.url) {
        downloadUrl = mp4Any.url;
      } else if (apiData?.url) {
        downloadUrl = apiData.url;
      } else {
        return NextResponse.json(
          {
            error: "Nenhum formato MP4 encontrado",
            detail: JSON.stringify(apiData).slice(0, 300),
          },
          { status: 500 }
        );
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json(
        { error: "Erro ao chamar YTStream API", detail: e?.message },
        { status: 500 }
      );
    }

    try {
      const videoRes = await fetch(downloadUrl);

      if (!videoRes.ok) {
        return NextResponse.json(
          {
            error: "Falha ao baixar vídeo",
            detail: `Status ${videoRes.status}`,
          },
          { status: 500 }
        );
      }

      const buffer = Buffer.from(await videoRes.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
    } catch (err: unknown) {
      const e = err as { message?: string };
      return NextResponse.json(
        { error: "Erro ao salvar vídeo", detail: e?.message },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Content-Type não suportado" },
      { status: 400 }
    );
  }

  if (!fs.existsSync(videoPath)) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 500 }
    );
  }

  let totalSeconds = 0;

  try {
    const probeCmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const output = execSync(probeCmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    totalSeconds = Math.floor(parseFloat(output.trim()));
  } catch (err: unknown) {
    const e = err as { message?: string; stderr?: string | Buffer };

    try {
      fs.unlinkSync(videoPath);
    } catch {}

    return NextResponse.json(
      {
        error: "Falha ao detectar duração",
        detail: e?.stderr?.toString?.() || e?.message,
      },
      { status: 500 }
    );
  }

  if (totalSeconds < clipDuration) {
    try {
      fs.unlinkSync(videoPath);
    } catch {}

    return NextResponse.json(
      {
        error: `Vídeo muito curto (${totalSeconds}s) para clips de ${clipDuration}s`,
      },
      { status: 400 }
    );
  }

  const clips: {
    clipUrl: string;
    clipFilename: string;
    start: number;
    end: number;
    sizeKB: number;
    index: number;
  }[] = [];

  const totalClips = Math.floor(totalSeconds / clipDuration);

  const videoFilter =
    format === "9:16"
      ? `-vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0"`
      : "";

  const videoCodec =
    format === "9:16"
      ? "-c:v libx264 -preset fast -crf 23"
      : "-c:v copy";

  for (let i = 0; i < totalClips; i++) {
    const start = i * clipDuration;
    const clipFilename = `clip_${timestamp}_${i + 1}.mp4`;
    const clipPath = path.join(DOWNLOADS_DIR, clipFilename);

    try {
      const ffmpegCmd = `${FFMPEG} -y -i "${videoPath}" -ss ${start} -t ${clipDuration} ${videoFilter} ${videoCodec} -c:a copy "${clipPath}"`;

      execSync(ffmpegCmd, {
        cwd: ROOT_DIR,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

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

  try {
    fs.unlinkSync(videoPath);
  } catch {}

  if (clips.length === 0) {
    return NextResponse.json(
      { error: "Nenhum clip gerado" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `${clips.length} clips gerados com sucesso!`,
    clips,
    totalClips: clips.length,
    clipDuration,
    totalSeconds,
    format,
    videoSizeKB: Math.round(clips.reduce((acc, c) => acc + c.sizeKB, 0)),
  });
}