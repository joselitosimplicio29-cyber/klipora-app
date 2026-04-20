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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  function resetAll() {
    setFile(null);
    setResult(null);
    setActiveClip(null);
    setTimeout(() => toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

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

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setActiveClip(null);

    const msgs = ["Enviando vídeo...", "Processando...", "Cortando clips...", "Quase pronto..."];
    let pi = 0;
    setProgress(msgs[0]);
    const iv = setInterval(() => { pi = (pi + 1) % msgs.length; setProgress(msgs[pi]); }, 6000);

    try {
      const form = new FormData();
      form.append("video", file);
      form.append("duration", String(duration));

      const res = await fetch("/api/process-video", { method: "POST", body: form });
      const data: ApiResponse = await res.json();
      setResult(data);
      if (data.success && data.clips?.length) {
        setActiveClip(data.clips[0]);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d1a; }
        .page { min-height: 100vh; background: #0d0d1a; color: #fff; font-family: 'Inter', system-ui, sans-serif; }
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,13,26,0.85); backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 100;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          letter-spacing: 2px;
          background: linear-gradient(90deg, #b57bee, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-links a { color: rgba(255,255,255,0.65); font-size: 14px; text-decoration: none; }
        .nav-btn {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
          color: #fff; padding: 8px 20px; border-radius: 8px; font-size: 14px; cursor: pointer;
        }
        .bg-glow {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 0%, rgba(124,58,237,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 10%, rgba(192,38,211,0.12) 0%, transparent 55%);
        }
        .hero {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 80px 24px 60px;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          color: #c4a0ff; font-size: 12px; font-weight: 500; letter-spacing: .5px;
          padding: 5px 14px; border-radius: 100px; margin-bottom: 28px; text-transform: uppercase;
        }
        .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #b57bee; }
        .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5vw, 64px); font-weight: 800; line-height: 1.05;
          letter-spacing: -2px; max-width: 800px; margin-bottom: 20px;
        }
        .hero h1 em {
          font-style: normal;
          background: linear-gradient(90deg, #9d6ffd, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.6); max-width: 480px;
          line-height: 1.75; margin-bottom: 36px;
        }
        .hero-sub strong { color: rgba(255,255,255,0.9); font-weight: 500; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .btn-grad {
          background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; border: none;
          padding: 13px 26px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
        }
        .btn-ghost {
          background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.2);
          padding: 13px 26px; border-radius: 10px; font-size: 15px; cursor: pointer;
        }
        .tool-wrap { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 0 24px 80px; }
        .tool-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; padding: 32px;
        }
        .tool-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
        .tool-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 24px; }
        .drop-zone {
          border: 2px dashed rgba(124,58,237,0.3); border-radius: 12px;
          padding: 36px 24px; text-align: center; cursor: pointer;
          transition: all .2s; margin-bottom: 20px; background: rgba(124,58,237,0.04);
        }
        .drop-zone:hover, .drop-zone.drag { border-color: #7c3aed; background: rgba(124,58,237,0.1); }
        .drop-icon { font-size: 36px; margin-bottom: 10px; }
        .drop-text { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
        .drop-sub { font-size: 13px; color: rgba(255,255,255,0.4); }
        .drop-formats { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 8px; }
        .file-selected {
          display: flex; align-items: center; gap: 12px;
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
        }
        .file-icon { font-size: 24px; flex-shrink: 0; }
        .file-info { flex: 1; min-width: 0; }
        .file-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-size { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .file-change { font-size: 12px; color: #a78bfa; cursor: pointer; background: none; border: none; flex-shrink: 0; }
        .dur-label {
          display: flex; justify-content: space-between; font-size: 13px;
          color: rgba(255,255,255,0.5); margin-bottom: 10px;
        }
        .dur-label strong { color: #b57bee; font-size: 15px; }
        .dur-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 24px; }
        .dur-btn {
          padding: 11px 0; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); transition: all .15s;
        }
        .dur-btn:hover { border-color: rgba(124,58,237,0.4); color: #fff; }
        .dur-btn.on { background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #c4a0ff; }
        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #7c3aed, #c026d3); border: none;
          border-radius: 10px; color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: 'Syne', sans-serif; transition: opacity .2s;
        }
        .submit-btn:disabled { opacity: .4; cursor: not-allowed; }
        .loading-box { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 28px 0; }
        .spinner-ring {
          width: 40px; height: 40px; border: 3px solid rgba(124,58,237,0.2);
          border-top-color: #9d6ffd; border-radius: 50%; animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-txt { font-size: 14px; color: rgba(255,255,255,0.5); }
        .loading-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
        .loading-bar-fill {
          height: 100%; width: 40%; background: linear-gradient(135deg, #7c3aed, #c026d3);
          animation: loadbar 1.8s ease-in-out infinite alternate;
        }
        @keyframes loadbar { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
        .results-wrap { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 0 24px 80px; animation: fadeUp .4s ease; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        .results-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .results-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
        .results-title span { background: linear-gradient(135deg, #9d6ffd, #e040fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .results-meta { font-size: 13px; color: rgba(255,255,255,0.35); }
        .novo-btn {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
          color: #fff; padding: 8px 20px; border-radius: 8px; font-size: 14px; cursor: pointer;
          transition: background .15s;
        }
        .novo-btn:hover { background: rgba(255,255,255,0.12); }
        .results-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .player-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(124,58,237,0.25); border-radius: 18px; overflow: hidden; }
        .player-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .player-label { font-size: 13px; font-weight: 600; color: #c4a0ff; }
        .player-time { font-size: 12px; color: rgba(255,255,255,0.35); }
        video { width: 100%; display: block; background: #000; max-height: 400px; object-fit: contain; }
        .player-bottom { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; }
        .player-size { font-size: 12px; color: rgba(255,255,255,0.3); }
        .dl-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; border: none;
          padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; text-decoration: none;
        }
        .clip-sidebar { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .clip-sidebar-hd { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: .8px; }
        .clip-list { overflow-y: auto; flex: 1; max-height: 440px; }
        .clip-list::-webkit-scrollbar { width: 4px; }
        .clip-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .clip-row { display: flex; align-items: center; gap: 12px; padding: 11px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background .15s; }
        .clip-row:hover { background: rgba(255,255,255,0.04); }
        .clip-row.on { background: rgba(124,58,237,0.12); border-left: 2px solid #7c3aed; }
        .clip-num { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .clip-row.on .clip-num { background: rgba(124,58,237,0.25); color: #c4a0ff; }
        .clip-info { flex: 1; min-width: 0; }
        .clip-time-txt { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); }
        .clip-row.on .clip-time-txt { color: #fff; }
        .clip-size-txt { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .clip-play { color: rgba(255,255,255,0.25); font-size: 12px; }
        .clip-row.on .clip-play { color: #9d6ffd; }
        .dl-all-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px;
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          color: #c4a0ff; font-size: 13px; font-weight: 600;
          cursor: pointer; border-top: 1px solid rgba(255,255,255,0.06);
          transition: background .15s;
        }
        .dl-all-btn:hover { background: rgba(124,58,237,0.25); }
        .err-box { max-width: 680px; margin: 0 auto 60px; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 18px 20px; position: relative; z-index: 1; }
        .err-title { font-size: 14px; font-weight: 600; color: #f87171; margin-bottom: 8px; }
        .err-detail { font-family: monospace; font-size: 11px; color: rgba(255,255,255,0.35); white-space: pre-wrap; word-break: break-all; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; max-height: 140px; overflow-y: auto; }
        .err-novo { margin-top: 14px; }
        @media (max-width: 700px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bg-glow" />

      <div className="page">
        <nav>
          <span className="nav-logo">KLIPORA</span>
          <div className="nav-links">
            <a href="#problema">Problema</a>
            <a href="#solucao">Solução</a>
            <a href="#precos">Preços</a>
            <a href="#faq">FAQ</a>
          </div>
          <button className="nav-btn" onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}>
            Entrar na lista
          </button>
        </nav>

        <section className="hero">
          <div className="badge"><span className="badge-dot" /> MVP em construção · acesso antecipado</div>
          <h1>1 vídeo longo.<br /><em>Infinitos clips virais.</em></h1>
          <p className="hero-sub">
            Faça upload do seu vídeo e o Klipora gera <strong>clips prontos para TikTok, Reels e YouTube Shorts</strong> automaticamente.
          </p>
          <div className="hero-btns">
            <button className="btn-grad" onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}>
              Gerar clips grátis
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}>
              Como funciona
            </button>
          </div>
        </section>

        <div className="tool-wrap" id="tool" ref={toolRef}>
          <div className="tool-card">
            <p className="tool-title">Gerar clips agora</p>
            <p className="tool-sub">Faça upload do seu vídeo, escolha a duração e gere todos os clips de uma vez.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi,.mkv,.m4v"
              style={{ display: "none" }}
              onChange={onFileChange}
            />

            {!file ? (
              <div
                className={`drop-zone${isDragging ? " drag" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <div className="drop-icon">🎬</div>
                <p className="drop-text">Arraste o vídeo aqui ou clique para selecionar</p>
                <p className="drop-sub">Selecione um arquivo do seu dispositivo</p>
                <p className="drop-formats">MP4 · MOV · AVI · WebM · MKV</p>
              </div>
            ) : (
              <div className="file-selected">
                <span className="file-icon">🎬</span>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatSize(Math.round(file.size / 1024))}</p>
                </div>
                <button className="file-change" onClick={() => { setFile(null); setResult(null); }}>Trocar</button>
              </div>
            )}

            <div className="dur-label">
              <span>Duração de cada clip</span>
              <strong>{formatDuration(duration)}</strong>
            </div>
            <div className="dur-grid">
              {DURATIONS.map((d) => (
                <button key={d} className={`dur-btn${duration === d ? " on" : ""}`} onClick={() => setDuration(d)} disabled={loading}>
                  {formatDuration(d)}
                </button>
              ))}
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading || !file}>
              {loading ? progress || "Processando..." : "⚡ Gerar todos os clips"}
            </button>

            {loading && (
              <div className="loading-box">
                <div className="spinner-ring" />
                <p className="loading-txt">{progress}</p>
                <div className="loading-bar"><div className="loading-bar-fill" /></div>
              </div>
            )}
          </div>
        </div>

        {result?.success && result.clips && result.clips.length > 0 && (
          <div className="results-wrap" ref={resultsRef}>
            <div className="results-top">
              <p className="results-title"><span>✓ {result.totalClips} clips gerados</span></p>
              <p className="results-meta">
                {Math.floor((result.totalSeconds ?? 0) / 60)}min de vídeo · clips de {formatDuration(result.clipDuration ?? 30)}
              </p>
              <button className="novo-btn" onClick={resetAll}>+ Novo vídeo</button>
            </div>
            <div className="results-grid">
              <div className="player-box">
                {activeClip && (
                  <>
                    <div className="player-top">
                      <span className="player-label">Clip {activeClip.index}</span>
                      <span className="player-time">{formatTime(activeClip.start)} → {formatTime(activeClip.end)}</span>
                    </div>
                    <video key={activeClip.clipUrl} controls autoPlay>
                      <source src={activeClip.clipUrl} type="video/mp4" />
                    </video>
                    <div className="player-bottom">
                      <span className="player-size">{formatSize(activeClip.sizeKB)}</span>
                      <a className="dl-btn" href={activeClip.clipUrl} download={activeClip.clipFilename}>
                        ↓ Baixar
                      </a>
                    </div>
                  </>
                )}
              </div>
              <div className="clip-sidebar">
                <div className="clip-sidebar-hd">{result.totalClips} clips gerados</div>
                <div className="clip-list">
                  {result.clips.map((clip) => (
                    <div key={clip.index} className={`clip-row${activeClip?.index === clip.index ? " on" : ""}`} onClick={() => setActiveClip(clip)}>
                      <div className="clip-num">{clip.index}</div>
                      <div className="clip-info">
                        <div className="clip-time-txt">{formatTime(clip.start)} → {formatTime(clip.end)}</div>
                        <div className="clip-size-txt">{formatSize(clip.sizeKB)}</div>
                      </div>
                      <span className="clip-play">▶</span>
                    </div>
                  ))}
                </div>
                <button
                  className="dl-all-btn"
                  onClick={() => {
                    result.clips?.forEach((clip) => {
                      const a = document.createElement("a");
                      a.href = clip.clipUrl;
                      a.download = clip.clipFilename;
                      a.click();
                    });
                  }}
                >
                  ↓ Baixar todos os clips
                </button>
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="err-box">
            <p className="err-title">✗ {result.error}</p>
            {result.detail && <pre className="err-detail">{result.detail}</pre>}
            <div className="err-novo">
              <button className="novo-btn" onClick={resetAll}>+ Tentar com outro vídeo</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}