"use client";

import { useState, useRef } from "react";

interface Clip {
  index: number;
  clipUrl: string;
  clipFilename: string;
  start: number;
  end: number;
  sizeKB: number;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  detail?: string;
  clips?: Clip[];
  totalClips?: number;
  clipDuration?: number;
  totalSeconds?: number;
  videoSizeKB?: number;
  format?: string;
}

const DURATIONS = [15, 30, 60, 120];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatDuration(s: number) {
  if (s < 60) return `${s}s`;
  return `${s / 60}min`;
}

function formatSize(kb: number) {
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function AppPage() {
  const [mode, setMode] = useState<"upload" | "youtube">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [duration, setDuration] = useState(30);
  const [format, setFormat] = useState("original");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setActiveClip(null);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function resetAll() {
    setFile(null);
    setYoutubeUrl("");
    setResult(null);
    setActiveClip(null);
  }

  const canSubmit = mode === "upload" ? !!file : youtubeUrl.startsWith("http");

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setActiveClip(null);

    const msgs = [
      "Enviando vídeo...",
      "Processando...",
      "Cortando clips...",
      "Quase pronto...",
    ];

    let pi = 0;
    setProgress(msgs[0]);

    const iv = setInterval(() => {
      pi = (pi + 1) % msgs.length;
      setProgress(msgs[pi]);
    }, 3000);

    try {
      let res: Response;

      if (mode === "upload") {
        const form = new FormData();
        form.append("video", file!);
        form.append("duration", String(duration));
        form.append("format", format);

        res = await fetch("/api/process-video", {
          method: "POST",
          body: form,
        });
      } else {
        res = await fetch("/api/process-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: youtubeUrl,
            duration,
            format,
          }),
        });
      }

      const data: ApiResponse = await res.json();
      setResult(data);

      if (data.success && data.clips?.length) {
        setActiveClip(data.clips[0]);
      }
    } catch (err) {
      setResult({ error: "Erro de rede", detail: String(err) });
    } finally {
      clearInterval(iv);
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing:border-box; }
        body {
          margin:0;
          background:#0d0d1a;
          color:#fff;
          font-family:Inter, system-ui, sans-serif;
        }

        .page {
          min-height:100vh;
          background:
            radial-gradient(ellipse 60% 40% at 20% 0%, rgba(124,58,237,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 10%, rgba(192,38,211,0.12) 0%, transparent 55%),
            #0d0d1a;
          padding:40px 20px 80px;
        }

        .wrap {
          max-width:1100px;
          margin:0 auto;
        }

        .topbar {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:32px;
        }

        .logo {
          font-size:28px;
          font-weight:800;
          letter-spacing:2px;
          color:#d38bff;
        }

        .back {
          color:#fff;
          text-decoration:none;
          border:1px solid rgba(255,255,255,0.14);
          padding:10px 16px;
          border-radius:10px;
          background:rgba(255,255,255,0.04);
        }

        .grid {
          display:grid;
          grid-template-columns: 430px 1fr;
          gap:20px;
          align-items:start;
        }

        .card, .results {
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.10);
          border-radius:20px;
          padding:24px;
        }

        h1 {
          margin:0 0 8px;
          font-size:30px;
        }

        .sub {
          color:rgba(255,255,255,0.55);
          margin-bottom:22px;
          font-size:14px;
        }

        .mode-tabs, .format-grid, .dur-grid {
          display:grid;
          gap:8px;
        }

        .mode-tabs, .format-grid {
          grid-template-columns:1fr 1fr;
        }

        .dur-grid {
          grid-template-columns:repeat(4,1fr);
        }

        .label {
          display:flex;
          justify-content:space-between;
          margin:18px 0 10px;
          font-size:13px;
          color:rgba(255,255,255,0.55);
        }

        .label strong {
          color:#d38bff;
        }

        button, .fake-btn {
          border:none;
          border-radius:10px;
          padding:12px 14px;
          cursor:pointer;
          font-weight:600;
        }

        .btn-secondary {
          background:rgba(255,255,255,0.04);
          color:rgba(255,255,255,0.65);
          border:1px solid rgba(255,255,255,0.10);
        }

        .btn-secondary.on {
          background:rgba(124,58,237,0.20);
          border:1px solid #7c3aed;
          color:#fff;
        }

        .submit {
          width:100%;
          margin-top:20px;
          background:linear-gradient(135deg,#7c3aed,#c026d3);
          color:#fff;
          font-size:16px;
        }

        .submit:disabled {
          opacity:.45;
          cursor:not-allowed;
        }

        .drop-zone {
          border:2px dashed rgba(124,58,237,0.35);
          border-radius:14px;
          padding:34px 20px;
          text-align:center;
          margin-top:16px;
          cursor:pointer;
          background:rgba(124,58,237,0.05);
        }

        .drop-zone.drag {
          border-color:#7c3aed;
          background:rgba(124,58,237,0.12);
        }

        .drop-title {
          font-weight:600;
          margin:10px 0 6px;
        }

        .drop-sub, .hint {
          color:rgba(255,255,255,0.45);
          font-size:13px;
        }

        .yt-input {
          width:100%;
          margin-top:16px;
          border-radius:10px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.05);
          color:#fff;
          padding:14px 16px;
          outline:none;
        }

        .file-box {
          margin-top:16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:14px 16px;
          border-radius:12px;
          background:rgba(124,58,237,0.10);
          border:1px solid rgba(124,58,237,0.30);
        }

        .file-name {
          font-size:14px;
          font-weight:600;
        }

        .file-size {
          font-size:12px;
          color:rgba(255,255,255,0.45);
          margin-top:4px;
        }

        .loading {
          margin-top:18px;
          color:rgba(255,255,255,0.65);
          font-size:14px;
        }

        .err {
          margin-top:18px;
          background:rgba(239,68,68,0.08);
          border:1px solid rgba(239,68,68,0.22);
          border-radius:12px;
          padding:14px;
        }

        .err-title {
          color:#f87171;
          font-weight:700;
          margin-bottom:8px;
        }

        .err-detail {
          font-family:monospace;
          font-size:12px;
          color:rgba(255,255,255,0.55);
          white-space:pre-wrap;
          word-break:break-word;
        }

        .results h2 {
          margin:0 0 8px;
        }

        .meta {
          color:rgba(255,255,255,0.45);
          font-size:13px;
          margin-bottom:18px;
        }

        .player {
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:16px;
          overflow:hidden;
          margin-bottom:16px;
        }

        .player-top, .player-bottom {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 14px;
          font-size:13px;
        }

        .player-top {
          border-bottom:1px solid rgba(255,255,255,0.06);
        }

        .player-bottom {
          border-top:1px solid rgba(255,255,255,0.06);
        }

        video {
          width:100%;
          display:block;
          background:#000;
          max-height:440px;
        }

        .download {
          text-decoration:none;
          background:linear-gradient(135deg,#7c3aed,#c026d3);
          color:#fff;
          padding:8px 14px;
          border-radius:8px;
          font-size:13px;
        }

        .clip-list {
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .clip-item {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          padding:12px 14px;
          border-radius:12px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          cursor:pointer;
        }

        .clip-item.on {
          background:rgba(124,58,237,0.14);
          border-color:#7c3aed;
        }

        .clip-left {
          display:flex;
          flex-direction:column;
          gap:4px;
        }

        .clip-time {
          font-weight:600;
        }

        .clip-size {
          font-size:12px;
          color:rgba(255,255,255,0.45);
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="wrap">
          <div className="topbar">
            <div className="logo">KLIPORA</div>
            <a className="back" href="/">Voltar</a>
          </div>

          <div className="grid">
            <div className="card">
              <h1>Gerar clips</h1>
              <p className="sub">
                Faça upload do vídeo ou cole um link do YouTube para gerar seus clips.
              </p>

              <div className="mode-tabs">
                <button
                  className={`btn-secondary${mode === "upload" ? " on" : ""}`}
                  onClick={() => setMode("upload")}
                  disabled={loading}
                >
                  🎬 Upload
                </button>
                <button
                  className={`btn-secondary${mode === "youtube" ? " on" : ""}`}
                  onClick={() => setMode("youtube")}
                  disabled={loading}
                >
                  ▶️ YouTube
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi,.mkv,.m4v"
                style={{ display: "none" }}
                onChange={onFileChange}
              />

              {mode === "upload" &&
                (!file ? (
                  <div
                    className={`drop-zone${isDragging ? " drag" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                  >
                    <div style={{ fontSize: 36 }}>🎬</div>
                    <div className="drop-title">
                      Arraste o vídeo aqui ou clique para selecionar
                    </div>
                    <div className="drop-sub">
                      MP4, MOV, AVI, WebM, MKV
                    </div>
                  </div>
                ) : (
                  <div className="file-box">
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">
                        {formatSize(Math.round(file.size / 1024))}
                      </div>
                    </div>
                    <button className="btn-secondary" onClick={() => setFile(null)}>
                      Trocar
                    </button>
                  </div>
                ))}

              {mode === "youtube" && (
                <>
                  <input
                    className="yt-input"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  <p className="hint" style={{ marginTop: 8 }}>
                    O link do YouTube ainda pode falhar por bloqueio 403 do provedor.
                  </p>
                </>
              )}

              <div className="label">
                <span>Formato</span>
                <strong>{format === "9:16" ? "9:16 Vertical" : "Original"}</strong>
              </div>

              <div className="format-grid">
                <button
                  className={`btn-secondary${format === "original" ? " on" : ""}`}
                  onClick={() => setFormat("original")}
                  disabled={loading}
                >
                  📺 Original
                </button>
                <button
                  className={`btn-secondary${format === "9:16" ? " on" : ""}`}
                  onClick={() => setFormat("9:16")}
                  disabled={loading}
                >
                  📱 9:16
                </button>
              </div>

              <div className="label">
                <span>Duração</span>
                <strong>{formatDuration(duration)}</strong>
              </div>

              <div className="dur-grid">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    className={`btn-secondary${duration === d ? " on" : ""}`}
                    onClick={() => setDuration(d)}
                    disabled={loading}
                  >
                    {formatDuration(d)}
                  </button>
                ))}
              </div>

              <button
                className="submit"
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
              >
                {loading ? progress || "Processando..." : "⚡ Gerar clips"}
              </button>

              {loading && <div className="loading">{progress}</div>}

              {result && !result.success && (
                <div className="err">
                  <div className="err-title">✗ {result.error}</div>
                  {result.detail && <div className="err-detail">{result.detail}</div>}
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-secondary" onClick={resetAll}>
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="results">
              <h2>Resultados</h2>
              <div className="meta">
                {result?.success
                  ? `${result.totalClips} clips gerados · ${result.format === "9:16" ? "9:16" : "Original"}`
                  : "Seus clips vão aparecer aqui."}
              </div>

              {result?.success && activeClip ? (
                <>
                  <div className="player">
                    <div className="player-top">
                      <span>Clip {activeClip.index}</span>
                      <span>
                        {formatTime(activeClip.start)} → {formatTime(activeClip.end)}
                      </span>
                    </div>

                    <video key={activeClip.clipUrl} controls autoPlay>
                      <source src={activeClip.clipUrl} type="video/mp4" />
                    </video>

                    <div className="player-bottom">
                      <span>{formatSize(activeClip.sizeKB)}</span>
                      <a
                        className="download"
                        href={activeClip.clipUrl}
                        download={activeClip.clipFilename}
                      >
                        Baixar
                      </a>
                    </div>
                  </div>

                  <div className="clip-list">
                    {result.clips?.map((clip) => (
                      <div
                        key={clip.index}
                        className={`clip-item${activeClip.index === clip.index ? " on" : ""}`}
                        onClick={() => setActiveClip(clip)}
                      >
                        <div className="clip-left">
                          <div className="clip-time">
                            {formatTime(clip.start)} → {formatTime(clip.end)}
                          </div>
                          <div className="clip-size">{formatSize(clip.sizeKB)}</div>
                        </div>
                        <div>▶</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.5)" }}>
                  Envie um vídeo para gerar e visualizar os clips.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}