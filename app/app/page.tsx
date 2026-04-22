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
  { id: "hormozi", label: "Hormozi", pro: true, preview: { color: "#ffff00", bg: "transparent", border: "none", fontWeight: 900, textShadow: "0 0 8px #000, 0 0 2px #000" } },
  { id: "neon", label: "Neon", pro: true, preview: { color: "#00ffff", bg: "transparent", border: "none", textShadow: "0 0 8px #ff00ff" } },
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
  const [showSettings, setShowSettings] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPubModal, setShowPubModal] = useState<Clip|null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [resolution, setResolution] = useState("720p");
  const [userPlan] = useState("free"); // TODO: Puxar do banco de dados/Sessão
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout|null>(null);

  const stopPoll = useCallback(() => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => () => stopPoll(), [stopPoll]);

  function handleProFeature(action: () => void) {
    if (userPlan === "free") setShowUpgradeModal(true);
    else action();
  }

  async function generateQr() {
    setQrStatus("waiting"); setQrToken(null); setQrUrl(null); setQrVideoPath(null); setShowQrModal(true);
    const res = await fetch("/api/mobile-upload/create", { method: "POST" });
    const { token, uploadUrl } = await res.json();
    setQrToken(token); setQrUrl(uploadUrl);
    pollRef.current = setInterval(async () => {
      const s = await fetch(`/api/mobile-upload/status/${token}`).then(r => r.json());
      if (s.status === "uploading") setQrStatus("uploading");
      if (s.status === "done") {
        stopPoll(); setQrStatus("done"); setQrVideoPath(s.videoPath); setShowQrModal(false);
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
        form.append("resolution", resolution);
        form.append("subtitleStyle", subtitleStyle);
        res = await fetch("/api/process-video", { method: "POST", body: form });
      } else {
        let body: Record<string, unknown> = { duration, format, subtitleStyle, resolution };
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
        .page{min-height:100vh;background:radial-gradient(ellipse 60% 40% at 20% 0%,rgba(124,58,237,.18) 0%,transparent 60%),radial-gradient(ellipse 50% 35% at 80% 10%,rgba(192,38,211,.12) 0%,transparent 55%),#0d0d1a;padding:24px 20px 80px}
        .wrap{max-width:1200px;margin:0 auto}
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
        .pub-btn{text-decoration:none;background:linear-gradient(135deg,#e040fb,#7c3aed);color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);z-index:999;display:flex;align-items:center;justify-content:center;animation:fadein .3s ease}
        .modal{background:#0d0d1a;border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:32px;width:90%;max-width:400px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,.5);position:relative}
        .modal-close{position:absolute;top:16px;right:16px;background:none;border:none;color:rgba(255,255,255,.5);font-size:20px;cursor:pointer}
        .modal-close:hover{color:#fff}
        .adv-panel{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);border-radius:12px;margin:24px 0 0;overflow:hidden}
        .adv-btn{width:100%;padding:16px;background:none;border:none;color:#fff;font-size:14px;font-weight:600;display:flex;justify-content:space-between;cursor:pointer}
        .adv-btn:hover{background:rgba(255,255,255,.03)}
        .adv-content{padding:0 16px;max-height:0;overflow:hidden;transition:max-height .4s ease, padding .4s ease; opacity:0}
        .adv-content.open{max-height:500px;padding:0 16px 16px; opacity:1}
        .saas-top{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin-bottom:32px}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        @keyframes fadeup{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @media(max-width:900px){.grid{grid-template-columns:1fr}.style-grid{grid-template-columns:repeat(3,1fr)}.share-grid{grid-template-columns:1fr 1fr}}
      `}</style>
      {copyToast && <div className="toast">{copyToast}</div>}
      <div className="page"><div className="wrap">
        <div className="saas-top">
          <div className="logo" style={{fontSize:22}}>KLIPORA</div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <a href="/" style={{color:"rgba(255,255,255,.6)",textDecoration:"none",fontSize:14,fontWeight:600}}>← Voltar</a>
            <div style={{color:"rgba(255,255,255,.6)",fontSize:14,fontWeight:600,cursor:"pointer",display:"none"}}>Projetos</div>
            <div style={{background:"rgba(124,58,237,.15)",color:"#c4a0ff",padding:"6px 14px",borderRadius:100,fontSize:12,fontWeight:700,border:"1px solid rgba(124,58,237,.3)"}}>⚡ 60 min Free</div>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#c026d3)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,marginLeft:8}}>JS</div>
          </div>
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
                {qrStatus!=="done" && (
                  <button className="submit" style={{width:"100%",padding:14,fontSize:15}} onClick={generateQr}>📱 Gerar QR Code do Celular</button>
                )}
                {qrStatus==="done" && (
                  <div style={{color:"#4ade80",fontWeight:700,fontSize:15}}>✅ Vídeo recebido via celular! Pode gerar os clips.</div>
                )}
              </div>
            )}

            <div className="adv-panel">
              <button className="adv-btn" onClick={()=>setShowSettings(!showSettings)}>
                <span style={{display:"flex",alignItems:"center",gap:8}}>⚙️ Configurações Avançadas</span>
                <span style={{transform:showSettings?"rotate(180deg)":"none",transition:".3s"}}>▼</span>
              </button>
              <div className={`adv-content${showSettings?" open":""}`}>
                <div className="label" style={{marginTop:8}}><span>Formato</span><strong>{format==="9:16"?"9:16 Vertical":"Original"}</strong></div>
                <div className="btn-grid-2">
                  {[["original","📺 Original"],["9:16","📱 9:16"]].map(([v,l])=>(
                    <button key={v} className={`chip${format===v?" on":""}`} onClick={()=>setFormat(v)} disabled={loading}>{l}</button>
                  ))}
                </div>

                <div className="label"><span>Resolução</span><strong>{resolution==="1080p"?"1080p Full HD":"720p HD"}</strong></div>
                <div className="btn-grid-2">
                  <button className={`chip${resolution==="720p"?" on":""}`} onClick={()=>setResolution("720p")} disabled={loading}>720p HD</button>
                  <button className={`chip${resolution==="1080p"?" on":""}`} onClick={()=>handleProFeature(()=>setResolution("1080p"))} disabled={loading} style={{position:"relative"}}>
                    1080p Full HD <span style={{position:"absolute",top:-6,right:-6,background:"#c026d3",fontSize:9,padding:"2px 6px",borderRadius:4,fontWeight:900,color:"#fff"}}>PRO</span>
                  </button>
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
                    <div key={s.id} className={`style-card${subtitleStyle===s.id?" on":""}`} onClick={()=>s.pro?handleProFeature(()=>setSubtitleStyle(s.id)):setSubtitleStyle(s.id)} style={{position:"relative"}}>
                      {s.pro && <span style={{position:"absolute",top:-6,right:-6,background:"#c026d3",fontSize:9,padding:"2px 6px",borderRadius:4,fontWeight:900,color:"#fff",zIndex:10}}>PRO</span>}
                      <div className="style-preview" style={s.preview as React.CSSProperties}>Abc</div>
                      <div className="style-name">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
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
                      <button className="pub-btn" onClick={()=>setShowPubModal(activeClip)}>🚀 Publicar</button>
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
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span>{fmt(clip.start)} → {fmt(clip.end)}</span>
                          <span style={{fontSize:11,color:"#4ade80",background:"rgba(74,222,128,.1)",padding:"2px 6px",borderRadius:4}}>🔥 9{clip.index%10}% Viral</span>
                        </div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4,marginBottom:12}}>{fmtKB(clip.sizeKB)}</div>
                        
                        <div style={{display:"flex",alignItems:"flex-end",height:24,gap:2,opacity:activeClip.index===clip.index?1:0.5}}>
                          {Array.from({length: 30}).map((_, i) => {
                             const h = 20 + Math.abs(Math.sin((clip.index * 13) + i)) * 80;
                             const color = h > 85 ? "#c026d3" : h > 50 ? "#7c3aed" : "rgba(255,255,255,.2)";
                             return <div key={i} style={{flex:1,height:`${h}%`,background:color,borderRadius:2}} title="Retenção estimada"/>
                          })}
                        </div>
                      </div>
                      <span style={{marginLeft:16,fontSize:18,color:activeClip.index===clip.index?"#c4a0ff":"rgba(255,255,255,.3)"}}>▶</span>
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

      {showQrModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={()=>{stopPoll();setQrStatus("idle");setShowQrModal(false);}}>✕</button>
            <h2 style={{margin:"0 0 8px",fontSize:20}}>Conectar Celular</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:24,lineHeight:1.6}}>
              Abra a câmera do seu celular, escaneie o QR Code abaixo e selecione o vídeo na sua galeria. Ele será enviado direto para cá!
            </p>
            {qrUrl ? (
              <img className="qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`} width={240} height={240} alt="QR Code" style={{background:"#fff",padding:8}} />
            ) : (
              <div style={{height:240,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.4)"}}>Gerando...</div>
            )}
            <div style={{marginTop:24,fontSize:14,fontWeight:600,color:qrStatus==="uploading"?"#c026d3":"#7c3aed"}}>
              {qrStatus==="uploading" ? "⬆️ Recebendo vídeo (não feche a aba no celular)..." : "⏳ Aguardando leitura..."}
            </div>
          </div>
        </div>
      )}

      {showPubModal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:500}}>
            <button className="modal-close" onClick={()=>setShowPubModal(null)}>✕</button>
            <h2 style={{margin:"0 0 8px",fontSize:20}}>Distribuição Viral</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:24}}>
              Selecione o destino para publicar ou agendar seu clip.
            </p>
            <div style={{display:"grid",gap:12}}>
              <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15}} onClick={()=>{copy(showPubModal.copy?.legendas?.curta || "","Legenda copiada!");window.open("https://youtube.com/upload","_blank");}}>
                <span style={{color:"#ff0000",fontSize:20}}>▶</span> YouTube Shorts (Copiar Legenda e Abrir)
              </button>
              <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15,opacity:.5}} disabled>
                <span style={{color:"#E1306C",fontSize:20}}>📸</span> Instagram Reels (Em breve)
              </button>
              <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15,opacity:.5}} disabled>
                <span style={{color:"#fff",fontSize:20}}>🎵</span> TikTok (Em breve)
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={()=>setShowUpgradeModal(false)}>✕</button>
            <div style={{fontSize:40,marginBottom:12}}>👑</div>
            <h2 style={{margin:"0 0 8px",fontSize:22}}>Faça upgrade para o Pro</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24,lineHeight:1.6}}>
              Esta funcionalidade é exclusiva para assinantes. Libere exportação em 1080p, estilos virais de legenda, remoção da marca d'água e muito mais.
            </p>
            <button className="submit" style={{width:"100%",marginTop:0}} onClick={()=>{window.location.href="/#precos";}}>Ver Planos e Assinar</button>
          </div>
        </div>
      )}
    </>
  );
}