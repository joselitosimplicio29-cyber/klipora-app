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

export default function Home() {
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  async function handleSubmit() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setActiveClip(null);

    const msgs = ["Baixando vídeo...", "Analisando conteúdo...", "Cortando clips...", "Quase pronto..."];
    let pi = 0;
    setProgress(msgs[0]);
    const iv = setInterval(() => { pi = (pi + 1) % msgs.length; setProgress(msgs[pi]); }, 5000);

    try {
      const res = await fetch("/api/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), duration }),
      });
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0e0b1e;
          --bg2: #130f26;
          --surface: rgba(255,255,255,0.04);
          --surface2: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.08);
          --border2: rgba(255,255,255,0.14);
          --purple: #7c3aed;
          --purple-light: #9d6ffd;
          --pink: #e040fb;
          --pink2: #c026d3;
          --grad: linear-gradient(135deg, #7c3aed, #c026d3);
          --text: #ffffff;
          --text2: rgba(255,255,255,0.6);
          --text3: rgba(255,255,255,0.35);
          --radius: 12px;
          --radius-lg: 18px;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

        /* BG GLOW */
        .bg-glow {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 0%, rgba(124,58,237,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 10%, rgba(192,38,211,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 50%);
        }

        .page { position: relative; z-index: 1; min-height: 100vh; }

        /* NAV */
        nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          border-bottom: 1px solid var(--border);
          background: rgba(14,11,30,0.8); backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 100;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          letter-spacing: 2px;
          background: linear-gradient(90deg, #b57bee, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-links a { color: var(--text2); font-size: 14px; text-decoration: none; transition: color .2s; }
        .nav-links a:hover { color: var(--text); }
        .nav-btn {
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text); padding: 8px 20px; border-radius: 8px;
          font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.12); }

        /* HERO */
        .hero {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 96px 24px 80px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          color: #c4a0ff; font-size: 12px; font-weight: 500; letter-spacing: .5px;
          padding: 5px 14px; border-radius: 100px; margin-bottom: 28px;
          text-transform: uppercase;
        }
        .hero-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #b57bee; }
        .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(40px, 6vw, 72px); font-weight: 800; line-height: 1.05;
          letter-spacing: -2px; max-width: 860px; margin-bottom: 20px;
        }
        .hero h1 em {
          font-style: normal;
          background: linear-gradient(90deg, #9d6ffd, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 17px; color: var(--text2); max-width: 480px;
          line-height: 1.75; margin-bottom: 40px;
        }
        .hero-sub strong { color: var(--text); font-weight: 500; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .btn-grad {
          background: var(--grad); color: #fff; border: none;
          padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: opacity .2s, transform .2s;
        }
        .btn-grad:hover { opacity: .9; transform: translateY(-1px); }
        .btn-ghost {
          background: var(--surface); border: 1px solid var(--border2); color: var(--text);
          padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: background .2s;
        }
        .btn-ghost:hover { background: var(--surface2); }

        /* FEATURES STRIP */
        .features-strip {
          display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
          padding: 0 24px 64px;
        }
        .feature-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); font-size: 13px; padding: 7px 14px; border-radius: 100px;
        }
        .feature-chip-icon { font-size: 14px; }

        /* TOOL SECTION */
        .tool-wrap {
          max-width: 680px; margin: 0 auto; padding: 0 24px 80px;
        }
        .tool-card {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: var(--radius-lg); padding: 36px;
          backdrop-filter: blur(10px);
        }
        .tool-card-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
          margin-bottom: 6px;
        }
        .tool-card-sub { font-size: 14px; color: var(--text2); margin-bottom: 28px; }

        /* INPUT */
        .input-wrap {
          display: flex; gap: 0; margin-bottom: 24px;
          border: 1px solid var(--border2); border-radius: 10px; overflow: hidden;
          background: rgba(255,255,255,0.05); transition: border-color .2s;
        }
        .input-wrap:focus-within { border-color: rgba(124,58,237,0.6); }
        .input-icon {
          display: flex; align-items: center; padding: 0 14px;
          color: var(--text3); font-size: 16px; flex-shrink: 0;
        }
        .url-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 14px; padding: 14px 0;
        }
        .url-input::placeholder { color: var(--text3); }

        /* DURATION */
        .dur-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: var(--text2); margin-bottom: 10px;
        }
        .dur-label strong { color: #b57bee; font-size: 15px; font-weight: 600; }
        .dur-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 24px; }
        .dur-btn {
          padding: 11px 0; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: 1px solid var(--border);
          background: var(--surface); color: var(--text2); transition: all .15s;
        }
        .dur-btn:hover { border-color: rgba(124,58,237,0.4); color: var(--text); }
        .dur-btn.on {
          background: rgba(124,58,237,0.2); border-color: var(--purple);
          color: #c4a0ff;
        }

        /* SUBMIT BTN */
        .submit-btn {
          width: 100%; padding: 15px; background: var(--grad); border: none;
          border-radius: 10px; color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; letter-spacing: .3px; transition: opacity .2s;
          font-family: 'Syne', sans-serif;
        }
        .submit-btn:hover:not(:disabled) { opacity: .88; }
        .submit-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* LOADING */
        .loading-box {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 28px 0;
        }
        .spinner-ring {
          width: 40px; height: 40px;
          border: 3px solid rgba(124,58,237,0.2);
          border-top-color: #9d6ffd;
          border-radius: 50%; animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-txt { font-size: 14px; color: var(--text2); }
        .loading-bar {
          width: 100%; height: 3px; background: rgba(255,255,255,0.06);
          border-radius: 99px; overflow: hidden; margin-top: 4px;
        }
        .loading-bar-fill {
          height: 100%; width: 40%; background: var(--grad);
          border-radius: 99px;
          animation: loadbar 1.8s ease-in-out infinite alternate;
        }
        @keyframes loadbar { from { transform: translateX(-100%); } to { transform: translateX(250%); } }

        /* RESULTS */
        .results-wrap {
          max-width: 1000px; margin: 0 auto; padding: 0 24px 80px;
          animation: fadeUp .4s ease;
        }
        @keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }

        .results-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .results-title {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
        }
        .results-title span {
          background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .results-meta { font-size: 13px; color: var(--text3); }

        .results-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }

        /* PLAYER */
        .player-box {
          background: var(--surface); border: 1px solid rgba(124,58,237,0.25);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .player-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--border);
        }
        .player-clip-name { font-size: 13px; font-weight: 600; color: #c4a0ff; }
        .player-clip-time { font-size: 12px; color: var(--text3); }
        video { width: 100%; display: block; background: #000; max-height: 380px; object-fit: contain; }
        .player-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 18px;
        }
        .player-size { font-size: 12px; color: var(--text3); }
        .dl-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--grad); color: #fff; border: none;
          padding: 8px 16px; border-radius: 7px; font-size: 13px;
          font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity .2s;
        }
        .dl-btn:hover { opacity: .85; }

        /* CLIP LIST */
        .clip-sidebar {
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: var(--radius-lg); overflow: hidden;
          display: flex; flex-direction: column;
        }
        .clip-sidebar-hd {
          padding: 14px 16px; border-bottom: 1px solid var(--border);
          font-size: 12px; font-weight: 600; color: var(--text3);
          text-transform: uppercase; letter-spacing: .8px;
        }
        .clip-list { overflow-y: auto; flex: 1; max-height: 440px; }
        .clip-list::-webkit-scrollbar { width: 4px; }
        .clip-list::-webkit-scrollbar-track { background: transparent; }
        .clip-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .clip-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 16px; cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background .15s;
        }
        .clip-row:hover { background: rgba(255,255,255,0.04); }
        .clip-row.on { background: rgba(124,58,237,0.12); border-left: 2px solid var(--purple); }
        .clip-num {
          width: 30px; height: 30px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
          background: var(--surface2); color: var(--text3);
        }
        .clip-row.on .clip-num { background: rgba(124,58,237,0.25); color: #c4a0ff; }
        .clip-info { flex: 1; min-width: 0; }
        .clip-time-txt { font-size: 13px; font-weight: 500; color: var(--text2); }
        .clip-row.on .clip-time-txt { color: var(--text); }
        .clip-size-txt { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .clip-play-icon { color: var(--text3); font-size: 12px; }
        .clip-row.on .clip-play-icon { color: #9d6ffd; }

        /* ERROR */
        .err-box {
          max-width: 680px; margin: 0 auto 60px;
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius); padding: 18px 20px;
        }
        .err-title { font-size: 14px; font-weight: 600; color: #f87171; margin-bottom: 8px; }
        .err-detail {
          font-family: monospace; font-size: 11px; color: rgba(255,255,255,0.35);
          white-space: pre-wrap; word-break: break-all;
          background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;
          max-height: 140px; overflow-y: auto;
        }

        /* DIVIDER */
        .section-divider {
          border: none; border-top: 1px solid var(--border);
          margin: 0 0 64px;
        }

        @media (max-width: 700px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .results-grid { grid-template-columns: 1fr; }
          .hero h1 { letter-spacing: -1px; }
        }
      `}</style>

      <div className="bg-glow" />

      <div className="page">
        {/* NAV */}
        <nav>
          <span className="nav-logo">KLIPORA</span>
          <div className="nav-links">
            <a href="#problema">Problema</a>
            <a href="#solucao">Solução</a>
            <a href="#precos">Preços</a>
            <a href="#faq">FAQ</a>
          </div>
          <button className="nav-btn" onClick={() => toolRef.current?.scrollIntoView({ behavior: "smooth" })}>
            Entrar na lista
          </button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            MVP em construção · acesso antecipado
          </div>
          <h1>
            1 vídeo longo.<br />
            <em>Infinitos clips virais.</em>
          </h1>
          <p className="hero-sub">
            O Klipora transforma qualquer vídeo do YouTube em{" "}
            <strong>clips prontos para TikTok, Reels e YouTube Shorts</strong> — automaticamente.
          </p>
          <div className="hero-actions">
            <button className="btn-grad" onClick={() => toolRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Gerar clips grátis
            </button>
            <button className="btn-ghost" onClick={() => toolRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Ver como funciona
            </button>
          </div>
        </section>

        {/* FEATURES STRIP */}
        <div className="features-strip">
          {[
            ["✂️", "Recorte automático"],
            ["🎬", "Múltiplos clips"],
            ["⚡", "Processamento rápido"],
            ["📱", "Pronto para TikTok"],
            ["🔗", "Direto do YouTube"],
          ].map(([icon, label]) => (
            <div key={label} className="feature-chip">
              <span className="feature-chip-icon">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        <hr className="section-divider" />

        {/* TOOL */}
        <div className="tool-wrap" ref={toolRef} id="tool">
          <div className="tool-card">
            <p className="tool-card-title">Gerar clips agora</p>
            <p className="tool-card-sub">Cole o link do YouTube, escolha a duração e gere todos os clips de uma vez.</p>

            <div className="input-wrap">
              <span className="input-icon">🔗</span>
              <input
                className="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
            </div>

            <div className="dur-label">
              <span>Duração de cada clip</span>
              <strong>{formatDuration(duration)}</strong>
            </div>
            <div className="dur-grid">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  className={`dur-btn${duration === d ? " on" : ""}`}
                  onClick={() => setDuration(d)}
                  disabled={loading}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading || !url.trim()}>
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

        {/* RESULTS */}
        {result?.success && result.clips && result.clips.length > 0 && (
          <div className="results-wrap" ref={resultsRef}>
            <div className="results-top">
              <p className="results-title">
                <span>✓ {result.totalClips} clips gerados</span>
              </p>
              <p className="results-meta">
                Vídeo: {Math.floor((result.totalSeconds ?? 0) / 60)}min · clips de {formatDuration(result.clipDuration ?? 30)}
              </p>
            </div>

            <div className="results-grid">
              {/* Player */}
              <div className="player-box">
                {activeClip && (
                  <>
                    <div className="player-top">
                      <span className="player-clip-name">Clip {activeClip.index}</span>
                      <span className="player-clip-time">{formatTime(activeClip.start)} → {formatTime(activeClip.end)}</span>
                    </div>
                    <video key={activeClip.clipUrl} controls autoPlay>
                      <source src={activeClip.clipUrl} type="video/mp4" />
                    </video>
                    <div className="player-bottom">
                      <span className="player-size">{activeClip.sizeKB} KB</span>
                      <a className="dl-btn" href={activeClip.clipUrl} target="_blank" rel="noopener noreferrer">
                        ↓ Baixar clip
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="clip-sidebar">
                <div className="clip-sidebar-hd">{result.totalClips} clips gerados</div>
                <div className="clip-list">
                  {result.clips.map((clip) => (
                    <div
                      key={clip.index}
                      className={`clip-row${activeClip?.index === clip.index ? " on" : ""}`}
                      onClick={() => setActiveClip(clip)}
                    >
                      <div className="clip-num">{clip.index}</div>
                      <div className="clip-info">
                        <div className="clip-time-txt">{formatTime(clip.start)} → {formatTime(clip.end)}</div>
                        <div className="clip-size-txt">{clip.sizeKB} KB</div>
                      </div>
                      <span className="clip-play-icon">▶</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {result && !result.success && (
          <div className="err-box">
            <p className="err-title">✗ {result.error}</p>
            {result.detail && <pre className="err-detail">{result.detail}</pre>}
          </div>
        )}
      </div>
    </>
  );
}