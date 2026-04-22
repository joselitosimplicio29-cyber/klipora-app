"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Clip {
  index: number; clipUrl: string; clipFilename: string;
  start: number; end: number; sizeKB: number;
  subtitle?: string; captions_url?: string; srt_url?: string;
  copy?: { legendas: { curta: string; media: string; longa: string }; hooks: string[]; hashtags: string[] };
}

const DURATIONS = [15, 30, 60, 120];
const STYLES = [
  { id: "none", label: "Nenhuma", preview: { color: "#888", bg: "transparent", border: "1px dashed #555" } },
  { id: "minimalista", label: "Minimalista", preview: { color: "#fff", bg: "transparent", border: "none", textShadow: "0 1px 4px #000" } },
  { id: "hormozi", label: "Hormozi", preview: { color: "#ffff00", bg: "transparent", border: "none", fontWeight: 900, textShadow: "0 0 8px #000, 0 0 2px #000" } },
  { id: "neon", label: "Neon", preview: { color: "#00ffff", bg: "transparent", border: "none", textShadow: "0 0 8px #ff00ff" } },
  { id: "bold", label: "Bold", preview: { color: "#fff", bg: "rgba(0,0,0,0.7)", border: "none" } },
];

function fmt(s: number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
function fmtKB(kb: number) { return kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`; }
function fmtD(s: number) { return s < 60 ? `${s}s` : `${s/60}min`; }

export default function AppPage() {
  const [tab, setTab] = useState<"upload"|"link"|"qr">("upload");
  const [file, setFile] = useState<File|null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [duration, setDuration] = useState(30);
  const [format, setFormat] = useState("original");
  const [subtitleStyle, setSubtitleStyle] = useState("none");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(-1);
  const [result, setResult] = useState<{success?:boolean;error?:string;detail?:string;clips?:Clip[];totalClips?:number;clipDuration?:number;totalSeconds?:number}|null>(null);
  const [activeClip, setActiveClip] = useState<Clip|null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [qrToken, setQrToken] = useState<string|null>(null);
  const [qrUrl, setQrUrl] = useState<string|null>(null);
  const [qrStatus, setQrStatus] = useState<"idle"|"waiting"|"uploading"|"done">("idle");
  const [qrVideoPath, setQrVideoPath] = useState<string|null>(null);
  const [copyToast, setCopyToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout|null>(null);

  const stopPoll = useCallback(() => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => () => stopPoll(), [stopPoll]);

  async function generateQr() {
    setQrStatus("waiting"); setQrToken(null); setQrUrl(null); setQrVideoPath(null);
    const res = await fetch("/api/mobile-upload/create", { method: "POST" });
    const { token, uploadUrl } = await res.json();
    setQrToken(token); setQrUrl(uploadUrl);
    pollRef.current = setInterval(async () => {
      const s = await fetch(`/api/mobile-upload/status/${token}`).then(r => r.json());
      if (s.status === "uploading") setQrStatus("uploading");
      if (s.status === "done") {
        stopPoll(); setQrStatus("done"); setQrVideoPath(s.videoPath);
      }
    }, 2000);
  }

  async function handleSubmit() {
    if (loading) return;
    setLoading(true); setResult(null); setActiveClip(null);
    let pi = 0; setProgress(0);
    const iv = setInterval(() => { pi=Math.min(pi+1, 3); setProgress(pi); }, 6000);
    try {
      let res: Response;
      if (tab === "upload") {
        const form = new FormData();
        form.append("video", file!);
        form.append("duration", String(duration));
        form.append("format", format);
        form.append("subtitleStyle", subtitleStyle);
        res = await fetch("/api/process-video", { method: "POST", body: form });
      } else {
        let body: Record<string, unknown> = { duration, format, subtitleStyle };
        if (tab === "link") {
          // primeiro baixa o link, depois processa
          const dlRes = await fetch("/api/download-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: linkUrl }),
          });
          const dlData = await dlRes.json() as { ok?: boolean; videoPath?: string; error?: string };
          if (!dlData.ok) { setResult({ error: dlData.error || "Falha ao baixar link" }); return; }
          body.preuploadedPath = dlData.videoPath;
        } else {
          body.preuploadedPath = qrVideoPath;
        }
        res = await fetch("/api/process-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      setResult(data);
      if (data.success && data.clips?.length) setActiveClip(data.clips[0]);
    } catch (e) {
      setResult({ error: "Erro de rede", detail: String(e) });
    } finally {
      clearInterval(iv); setLoading(false); setProgress(-1);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopyToast(`${label} copiado!`);
    setTimeout(() => setCopyToast(""), 2000);
  }

  const canSubmit = tab === "upload" ? !!file : tab === "link" ? linkUrl.startsWith("http") : qrStatus === "done";

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:#0d0d1a;color:#fff;font-family:Inter,system-ui,sans-serif}
        .page{min-height:100vh;background:radial-gradient(ellipse 60% 40% at 20% 0%,rgba(124,58,237,.18) 0%,transparent 60%),radial-gradient(ellipse 50% 35% at 80% 10%,rgba(192,38,211,.12) 0%,transparent 55%),#0d0d1a;padding:40px 20px 80px}
        .wrap{max-width:1200px;margin:0 auto}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
        .logo{font-size:26px;font-weight:900;letter-spacing:2px;background:linear-gradient(90deg,#b57bee,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .grid{display:grid;grid-template-columns:420px 1fr;gap:20px;align-items:start}
        .card,.results{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:24px}
        h1{margin:0 0 6px;font-size:26px}
        .sub{color:rgba(255,255,255,.5);font-size:14px;margin-bottom:20px}
        .tabs{display:flex;gap:24px;margin-bottom:24px;border-bottom:1px solid rgba(255,255,255,.1)}
        .tab{background:transparent;border:none;color:rgba(255,255,255,.5);padding:0 4px 12px;cursor:pointer;font-weight:600;font-size:14px;position:relative;transition:.3s}
        .tab:hover{color:#fff}
        .tab.on{color:#fff}
        .tab.on::after{content:'';position:absolute;bottom:-1px;left:0;width:100%;height:2px;background:#c026d3;box-shadow:0 0 10px #c026d3}
        .label{display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.5);margin:16px 0 8px}
        .label strong{color:#d38bff}
        .btn-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .btn-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .chip{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);border-radius:10px;padding:10px 6px;cursor:pointer;font-weight:600;font-size:13px}
        .chip.on{background:rgba(124,58,237,.2);border-color:#7c3aed;color:#fff}
        .submit{width:100%;margin-top:20px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-size:16px;font-weight:700;padding:14px;border:none;border-radius:12px;cursor:pointer}
        .submit:disabled{opacity:.4;cursor:not-allowed}
        .drop-zone{border:2px dashed rgba(124,58,237,.4);border-radius:14px;padding:30px 20px;text-align:center;cursor:pointer;background:rgba(124,58,237,.05)}
        .drop-zone.drag{border-color:#7c3aed;background:rgba(124,58,237,.12)}
        .file-box{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:12px;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.3);margin-top:16px}
        input[type=url],input[type=text]{width:100%;margin-top:12px;padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;font-size:15px;outline:none}
        .qr-box{text-align:center;padding:20px 0}
        .qr-img{border-radius:12px;border:2px solid rgba(255,255,255,.15)}
        .err{margin-top:16px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);border-radius:12px;padding:14px}
        .err-title{color:#f87171;font-weight:700;margin-bottom:8px}
        .err-detail{font-family:monospace;font-size:11px;color:rgba(255,255,255,.5);white-space:pre-wrap;word-break:break-word;max-height:200px;overflow:auto}
        .fallback{margin-top:16px;background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.25);border-radius:12px;padding:16px}
        .player{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin-bottom:16px}
        .player-top,.player-bottom{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;font-size:13px}
        .player-top{border-bottom:1px solid rgba(255,255,255,.06)}
        .player-bottom{border-top:1px solid rgba(255,255,255,.06);flex-wrap:wrap;gap:8px}
        video{width:100%;display:block;background:#000;max-height:380px}
        .share-pack{background:rgba(124,58,237,.06);border-top:1px solid rgba(124,58,237,.15);padding:14px}
        .share-title{font-size:11px;font-weight:700;color:#c4a0ff;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
        .share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .share-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 6px;font-size:12px;font-weight:600;cursor:pointer;color:#fff;text-align:center}
        .share-btn:hover{background:rgba(124,58,237,.2);border-color:#7c3aed}
        .dl{text-decoration:none;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:700}
        .clip-list{display:flex;flex-direction:column;gap:8px}
        .clip-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);cursor:pointer}
        .clip-item.on{background:rgba(124,58,237,.14);border-color:#7c3aed}
        .style-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px}
        .style-card{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);border-radius:10px;padding:10px 6px;cursor:pointer;text-align:center}
        .style-card.on{border-color:#7c3aed;background:rgba(124,58,237,.15)}
        .style-preview{font-size:11px;font-weight:700;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;margin-bottom:6px}
        .style-name{font-size:10px;color:rgba(255,255,255,.5)}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(124,58,237,.9);color:#fff;padding:10px 20px;border-radius:100px;font-size:14px;font-weight:600;z-index:999;pointer-events:none;animation:fadeup .3s ease}
        @keyframes fadeup{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @media(max-width:900px){.grid{grid-template-columns:1fr}.style-grid{grid-template-columns:repeat(3,1fr)}.share-grid{grid-template-columns:1fr 1fr}}
      `}</style>
      {copyToast && <div className="toast">{copyToast}</div>}
      <div className="page"><div className="wrap">
        <div className="topbar">
          <div className="logo">KLIPORA</div>
          <a href="/" style={{color:"#fff",textDecoration:"none",border:"1px solid rgba(255,255,255,.14)",padding:"10px 16px",borderRadius:10,background:"rgba(255,255,255,.04)",fontSize:14}}>← Voltar</a>
        </div>
        <div className="grid">
          <div className="card">
            <h1>Gerar clips</h1>
            <p className="sub">Suba o vídeo, cole o link ou escaneie o QR com seu celular.</p>
            <div className="tabs">
              {[["upload","📁 Upload PC"],["link","🔗 Link Direto"],["qr","📱 QR Celular"]].map(([id,label])=>(
                <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id as "upload"|"link"|"qr")} disabled={loading}>{label}</button>
              ))}
            </div>

            <input ref={fileRef} type="file" accept="video/*,audio/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){setFile(f);setResult(null);}}} />

            {tab==="upload" && (!file ? (
              <div className={`drop-zone${isDragging?" drag":""}`} onClick={()=>fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)}
                onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files?.[0];if(f){setFile(f);setResult(null);}}}>
                <div style={{fontSize:36}}>🎬</div>
                <div style={{fontWeight:600,margin:"10px 0 6px"}}>Arraste o vídeo ou clique para selecionar</div>
                <div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>MP4 · MOV · MKV · AVI · WebM · MP3</div>
              </div>
            ) : (
              <div className="file-box">
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{file.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{fmtKB(Math.round(file.size/1024))}</div>
                </div>
                <button className="chip" onClick={()=>setFile(null)}>Trocar</button>
              </div>
            ))}

            {tab==="link" && (
              <>
                <input type="url" placeholder="https://drive.google.com/... ou link direto de vídeo" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} />
                <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:8}}>✅ Google Drive · Dropbox · Links diretos MP4</div>
              </>
            )}

            {tab==="qr" && (
              <div className="qr-box">
                {qrStatus==="idle" && (
                  <button className="chip" style={{width:"100%",padding:14,fontSize:15}} onClick={generateQr}>📱 Gerar QR Code</button>
                )}
                {(qrStatus==="waiting"||qrStatus==="uploading") && qrUrl && (
                  <>
                    <p style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:12}}>Escaneie com o celular:</p>
                    <img className="qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} width={200} height={200} alt="QR Code" />
                    <p style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:12}}>{qrStatus==="waiting"?"⏳ Aguardando envio...":"⬆️ Enviando vídeo..."}</p>
                    <button className="chip" style={{marginTop:8}} onClick={()=>{stopPoll();setQrStatus("idle");}}>Cancelar</button>
                  </>
                )}
                {qrStatus==="done" && (
                  <div style={{color:"#4ade80",fontWeight:700,fontSize:15}}>✅ Vídeo recebido! Clique em Gerar clips.</div>
                )}
              </div>
            )}

            <div className="label"><span>Formato</span><strong>{format==="9:16"?"9:16 Vertical":"Original"}</strong></div>
            <div className="btn-grid-2">
              {[["original","📺 Original"],["9:16","📱 9:16"]].map(([v,l])=>(
                <button key={v} className={`chip${format===v?" on":""}`} onClick={()=>setFormat(v)} disabled={loading}>{l}</button>
              ))}
            </div>

            <div className="label"><span>Duração do clip</span><strong>{fmtD(duration)}</strong></div>
            <div className="btn-grid-4">
              {DURATIONS.map(d=>(
                <button key={d} className={`chip${duration===d?" on":""}`} onClick={()=>setDuration(d)} disabled={loading}>{fmtD(d)}</button>
              ))}
            </div>

            <div className="label"><span>Estilo de legenda</span><strong>{STYLES.find(s=>s.id===subtitleStyle)?.label}</strong></div>
            <div className="style-grid">
              {STYLES.map(s=>(
                <div key={s.id} className={`style-card${subtitleStyle===s.id?" on":""}`} onClick={()=>setSubtitleStyle(s.id)}>
                  <div className="style-preview" style={s.preview as React.CSSProperties}>Abc</div>
                  <div className="style-name">{s.label}</div>
                </div>
              ))}
            </div>

            {loading && progress >= 0 && (
              <div style={{display:"flex",justifyContent:"space-between",margin:"20px 0",background:"rgba(0,0,0,.3)",padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.05)"}}>
                {[{i:"🔍",t:"Analisar"},{i:"✂️",t:"Cortar"},{i:"📝",t:"Legendar"},{i:"📦",t:"Finalizar"}].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:i<progress?"#4ade80":i===progress?"#c4a0ff":"rgba(255,255,255,.3)",fontWeight:600}}>
                    {i<progress?"✅":i===progress?"⏳":s.i} <span className="prog-text">{s.t}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="submit" onClick={handleSubmit} disabled={loading||!canSubmit}>
              {loading ? "Processando..." : "⚡ Gerar clips"}
            </button>

            {result && !result.success && (
              <div className="err">
                <div className="err-title">✗ {result.error}</div>
                {result.detail && <div className="err-detail">{result.detail}</div>}
                <div className="fallback" style={{marginTop:12}}>
                  <div style={{fontWeight:700,marginBottom:8,fontSize:13}}>💡 Alternativas:</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.8}}>
                    📁 Faça upload do arquivo diretamente<br/>
                    🔗 Use um link do Google Drive ou Dropbox<br/>
                    📱 Escaneie o QR com o celular
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="results">
            <h2 style={{margin:"0 0 6px"}}>Resultados</h2>
            <div style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:16}}>
              {result?.success ? `${result.totalClips} clips · ${fmtD(result.clipDuration??30)} cada · ${result.totalSeconds}s total` : "Seus clips aparecem aqui."}
            </div>

            {result?.success && activeClip ? (
              <>
                <div className="player">
                  <div className="player-top">
                    <span style={{fontWeight:700}}>Clip {activeClip.index}</span>
                    <span style={{color:"rgba(255,255,255,.5)"}}>{fmt(activeClip.start)} → {fmt(activeClip.end)}</span>
                  </div>
                  <video key={activeClip.clipUrl} controls autoPlay crossOrigin="anonymous">
                    <source src={`/api/dl?url=${encodeURIComponent(activeClip.clipUrl)}`} type="video/mp4" />
                    {activeClip.captions_url && <track kind="subtitles" src={activeClip.captions_url} srcLang="pt" label="Português" default />}
                  </video>
                  <div className="player-bottom">
                    <span style={{color:"rgba(255,255,255,.45)",fontSize:13}}>{fmtKB(activeClip.sizeKB)}</span>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {activeClip.captions_url && <a href={activeClip.captions_url} download style={{color:"#c4a0ff",fontSize:12,padding:"6px 10px",border:"1px solid rgba(124,58,237,.4)",borderRadius:6,textDecoration:"none"}}>📥 VTT</a>}
                      {activeClip.srt_url && <a href={activeClip.srt_url} download style={{color:"#c4a0ff",fontSize:12,padding:"6px 10px",border:"1px solid rgba(124,58,237,.4)",borderRadius:6,textDecoration:"none"}}>📥 SRT</a>}
                      <a className="dl" href={`/api/dl?url=${encodeURIComponent(activeClip.clipUrl)}&filename=${encodeURIComponent(activeClip.clipFilename)}&dl=1`} download={activeClip.clipFilename}>⬇ Baixar</a>
                    </div>
                  </div>

                  {activeClip.copy && (activeClip.copy.legendas?.curta || activeClip.copy.hooks?.length > 0) && (
                    <div className="share-pack">
                      <div className="share-title">📦 Share Pack — Copy pronta para postar</div>
                      <div className="share-grid">
                        {activeClip.copy.legendas?.curta && <button className="share-btn" onClick={()=>copy(activeClip.copy!.legendas.curta,"Legenda curta")}>📋 Legenda curta</button>}
                        {activeClip.copy.legendas?.media && <button className="share-btn" onClick={()=>copy(activeClip.copy!.legendas.media,"Legenda média")}>📋 Legenda média</button>}
                        {activeClip.copy.legendas?.longa && <button className="share-btn" onClick={()=>copy(activeClip.copy!.legendas.longa,"Legenda longa")}>📋 Legenda longa</button>}
                        {activeClip.copy.hooks?.[0] && <button className="share-btn" onClick={()=>copy(activeClip.copy!.hooks.join("\n\n"),"Hooks")}>🪝 Hooks (3)</button>}
                        {activeClip.copy.hashtags?.length > 0 && <button className="share-btn" onClick={()=>copy(activeClip.copy!.hashtags.join(" "),"Hashtags")}>#️⃣ Hashtags</button>}
                        {activeClip.subtitle && <button className="share-btn" onClick={()=>copy(activeClip.subtitle!,"Transcrição")}>🎤 Transcrição</button>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="clip-list">
                  {result.clips?.map(clip=>(
                    <div key={clip.index} className={`clip-item${activeClip.index===clip.index?" on":""}`} onClick={()=>setActiveClip(clip)}>
                      <div>
                        <div style={{fontWeight:600}}>{fmt(clip.start)} → {fmt(clip.end)}</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{fmtKB(clip.sizeKB)}</div>
                      </div>
                      <span>▶</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{color:"rgba(255,255,255,.4)",textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:48,marginBottom:16}}>🎬</div>
                <div>Envie um vídeo para gerar seus clips.</div>
              </div>
            )}
          </div>
        </div>
      </div></div>
    </>
  );
}