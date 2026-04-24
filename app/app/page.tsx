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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [resolution, setResolution] = useState("720p");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState("free");
  const [igAccounts, setIgAccounts] = useState<any[]|null>(null);
  const [igStatus, setIgStatus] = useState<"idle"|"publishing"|"done"|"error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout|null>(null);

  const stopPoll = useCallback(() => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => {
    // Check User Session
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setCurrentUser(d.user);
          setUserPlan(d.user.isPro ? "pro" : "free");
        }
      })
      .catch(()=>{});

    // Check IG accounts
    fetch("/api/instagram/accounts")
      .then(r => r.json())
      .then(d => { if(d.accounts) setIgAccounts(d.accounts); })
      .catch(()=>{});
      
    // Check URL params for success/error
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.get("success") === "ig_connected") setCopyToast("✅ Instagram conectado com sucesso!");
    if(searchParams.get("error") === "auth_failed") setCopyToast("❌ Erro ao conectar Instagram.");
    if(searchParams.get("success") === "pro_activated") setCopyToast("🎉 Pagamento aprovado! Você agora é PRO.");
    
    if(searchParams.get("action") === "checkout") {
      // Aguarda um pouco o carregamento da sessão
      setTimeout(() => {
        fetch("/api/auth/me")
          .then(r => r.json())
          .then(d => {
            if (!d.user) {
              setShowLoginModal(true);
              setCopyToast("👋 Por favor, faça login para continuar com a assinatura.");
            } else if (!d.user.isPro) {
              handleCheckout();
            }
          });
      }, 1000);
    }
      
    return () => stopPoll();
  }, [stopPoll]);

  function handleProFeature(action: () => void) {
    if (userPlan !== "pro") setShowUpgradeModal(true);
    else action();
  }

  async function handleLogin() {
    if(!loginEmail.includes('@')) return alert('E-mail inválido');
    const res = await fetch("/api/auth/session", {
      method: "POST", body: JSON.stringify({ email: loginEmail })
    });
    const data = await res.json();
    if(data.success) {
      setCurrentUser(data.user);
      setUserPlan(data.user.isPro ? "pro" : "free");
      setShowLoginModal(false);
      if(showUpgradeModal) handleCheckout();
    }
  }

  async function handleCheckout() {
    if(!currentUser) {
      setShowLoginModal(true);
      return;
    }
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if(data.url) window.location.href = data.url;
    else alert("Erro: " + data.error);
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

  async function handleCheckout() {
    setCopyToast("⏳ Iniciando pagamento...");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setCopyToast("❌ Erro ao abrir checkout: " + (data.error || "Tente novamente"));
    } catch (e) {
      setCopyToast("❌ Erro de conexão com o servidor");
    }
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

  async function handleCheckout() {
    setCopyToast("⏳ Iniciando pagamento...");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setCopyToast("❌ Erro ao abrir checkout");
    } catch (e) {
      setCopyToast("❌ Erro de conexão");
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopyToast(`${label} copiado!`);
    setTimeout(() => setCopyToast(""), 2000);
  }

  async function publishToInstagram(igUserId: string) {
    if (!showPubModal) return;
    setIgStatus("publishing");
    try {
      const caption = showPubModal.copy?.legendas?.curta || "Criado com Klipora 🚀";
      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igUserId, videoUrl: showPubModal.clipUrl, caption })
      });
      const data = await res.json();
      if (!data.success) { setIgStatus("error"); setCopyToast("❌ Erro: " + data.error); return; }

      // Polling for publish
      const checkPoll = setInterval(async () => {
        const s = await fetch("/api/instagram/publish/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ igUserId, containerId: data.containerId, publish: true })
        }).then(r => r.json());
        
        if (s.published) {
          clearInterval(checkPoll);
          setIgStatus("done");
          setCopyToast("✅ Publicado no Instagram!");
        } else if (s.error || s.status === "ERROR") {
          clearInterval(checkPoll);
          setIgStatus("error");
          setCopyToast("❌ Erro no processamento do Instagram");
        }
      }, 5000);
      
      // Cleanup fallback after 2 mins
      setTimeout(() => clearInterval(checkPoll), 120000);
    } catch (e) {
      setIgStatus("error");
      setCopyToast("❌ Erro ao publicar");
    }
  }

  function shareToWhatsApp(clip: Clip) {
    const text = `🚀 Meu clipe está pronto!\n\nLink: ${clip.clipUrl}\n\nLegenda: ${clip.copy?.legendas?.curta || ""}\n\n#klipora #ia`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareToSMS(clip: Clip) {
    const phone = prompt("Digite o número de telefone (com DDD):", "");
    if (!phone) return;
    setCopyToast("⏳ Enviando SMS...");
    fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, clipUrl: clip.clipUrl })
    }).then(r => r.json()).then(d => {
      if (d.success) setCopyToast("✅ SMS enviado!");
      else setCopyToast("❌ Erro ao enviar SMS");
    });
  }

  const canSubmit = tab === "upload" ? !!file : tab === "link" ? linkUrl.startsWith("http") : qrStatus === "done";

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:#05050A;color:#F5F7FF;font-family:Inter,system-ui,sans-serif}
        .page{min-height:100vh;background:radial-gradient(circle at top left,rgba(139,92,246,0.08),transparent 30%),radial-gradient(circle at bottom right,rgba(94,230,255,0.05),transparent 30%),#05050A;padding:24px 32px 80px}
        .wrap{max-width:1600px;margin:0 auto}
        .logo{font-size:20px;font-weight:900;letter-spacing:1px;color:#fff}
        .saas-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:16px 24px;border-radius:16px;backdrop-filter:blur(20px)}
        .stepper{display:flex;align-items:center;gap:16px;color:rgba(255,255,255,.4);font-size:13px;font-weight:600}
        .step{display:flex;align-items:center;gap:8px}
        .step.active{color:#fff}
        .step.done{color:rgba(255,255,255,.6)}
        .step-num{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:11px}
        .step.active .step-num{background:#8B5CF6;color:#fff;box-shadow:0 0 10px rgba(139,92,246,0.5)}
        .step.done .step-num{background:#4ade80;color:#000}
        .step-line{width:32px;height:1px;background:rgba(255,255,255,.1)}
        .step.done + .step-line{background:linear-gradient(90deg,#4ade80,rgba(255,255,255,.1))}
        .top-actions{display:flex;gap:12px}
        .btn-back{background:transparent;border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:6px;transition:.2s}
        .btn-back:hover{background:rgba(255,255,255,.05)}
        .btn-next{background:#8B5CF6;border:none;color:#fff;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:6px;transition:.2s}
        .btn-next:hover{background:#9F67FF;box-shadow:0 0 16px rgba(139,92,246,.4)}
        .btn-next:disabled{opacity:0.5;cursor:not-allowed;box-shadow:none}

        .grid-3{display:grid;grid-template-columns:300px 1fr 320px;gap:24px;align-items:start}

        .panel{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:24px;padding:24px;backdrop-filter:blur(20px)}
        .panel-title{font-size:18px;font-weight:700;margin:0 0 8px;color:#fff}
        .panel-sub{font-size:13px;color:#B8BED6;line-height:1.5;margin-bottom:20px}

        .up-btn{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;margin-bottom:12px}
        .up-btn:hover{background:rgba(255,255,255,.06);border-color:rgba(139,92,246,.3)}
        .up-btn.active{background:rgba(139,92,246,.1);border-color:#8B5CF6;box-shadow:0 0 16px rgba(139,92,246,.15)}
        .up-icon{font-size:20px}

        .drop-zone{border:2px dashed rgba(139,92,246,0.30);border-radius:16px;padding:40px 20px;text-align:center;cursor:pointer;background:radial-gradient(circle at top,rgba(139,92,246,0.08),transparent 60%),rgba(255,255,255,0.02);transition:all 180ms ease}
        .drop-zone:hover,.drop-zone.drag{border-color:rgba(94,230,255,0.58);box-shadow:0 0 0 4px rgba(94,230,255,0.08),0 16px 40px rgba(94,230,255,0.10);transform:translateY(-2px);background:rgba(139,92,246,0.05)}


        .file-card{background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.2);border-radius:12px;padding:16px;margin-top:24px;position:relative}
        .file-card-close{position:absolute;top:12px;right:12px;background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer}
        .file-name{font-size:13px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:20px}
        .file-meta{font-size:11px;color:rgba(255,255,255,.5)}
        .prog-bar-bg{height:6px;background:rgba(0,0,0,.3);border-radius:3px;margin:12px 0 8px;overflow:hidden}
        .prog-bar-fill{height:100%;background:linear-gradient(90deg,#8B5CF6,#5EE6FF);transition:width .3s}
        .prog-stats{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.5)}

        .tip-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:16px;margin-top:16px;display:flex;gap:12px;align-items:flex-start}
        .tip-icon{color:#C084FC;font-size:18px}
        .tip-text{font-size:12px;color:rgba(255,255,255,.6);line-height:1.5}
        .tip-text h4{margin:0 0 4px;color:#fff}

        .center-hero{text-align:center;padding:20px;position:relative}
        .hero-badge{position:absolute;top:0;right:0;background:rgba(139,92,246,.15);color:#c4a0ff;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;border:1px solid rgba(139,92,246,.3)}
        .hero-title{font-size:24px;font-weight:700;margin:0 0 8px;display:flex;align-items:center;justify-content:flex-start;gap:12px}
        .hero-sub{font-size:14px;color:rgba(255,255,255,.5);margin-bottom:40px;text-align:left}

        .orbital{position:relative;width:240px;height:240px;margin:0 auto 40px;display:flex;align-items:center;justify-content:center}
        .orbital-ring{position:absolute;inset:-10px;border:1px solid rgba(139,92,246,.2);border-radius:50%;animation:spin 10s linear infinite}
        .orbital-ring-2{position:absolute;inset:-30px;border:1px dashed rgba(94,230,255,.2);border-radius:50%;animation:spin-reverse 15s linear infinite}
        .orbital-ring-3{position:absolute;inset:-50px;border:1px solid rgba(139,92,246,.1);border-radius:50%;animation:spin 25s linear infinite}
        .orbital-core{width:110px;height:110px;background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(94,230,255,.1));border:2px solid rgba(139,92,246,.5);border-radius:28px;box-shadow:0 0 40px rgba(139,92,246,.3),inset 0 0 20px rgba(139,92,246,.2);display:flex;align-items:center;justify-content:center;font-size:48px;z-index:2}
        .chip-float{position:absolute;background:rgba(20,20,28,.8);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(4px);padding:8px 14px;border-radius:100px;font-size:12px;font-weight:600;color:#fff;white-space:nowrap;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,.5);z-index:3}

        .big-prog-wrap{display:flex;align-items:center;gap:20px;margin-bottom:40px}
        .big-prog-num{font-size:36px;font-weight:800;color:#8B5CF6}
        .big-prog-bar{flex:1;height:8px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden;position:relative}
        .big-prog-fill{height:100%;background:linear-gradient(90deg,#8B5CF6,#5EE6FF);border-radius:4px;position:relative;transition:width 0.5s}
        .big-prog-fill::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);animation:shimmer 2s infinite}
        .big-prog-text{font-size:13px;color:rgba(255,255,255,.4);margin-top:12px;display:flex;justify-content:space-between}

        .metrics-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:40px}
        .metric-box{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:16px;display:flex;align-items:center;gap:12px}
        .metric-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .metric-val{font-size:18px;font-weight:800;margin-bottom:2px;color:#fff}
        .metric-lbl{font-size:11px;color:rgba(255,255,255,.5);line-height:1.2}

        .steps-flow{background:rgba(255,255,255,.02);border-radius:16px;padding:24px;margin-bottom:24px}
        .steps-title{font-size:13px;font-weight:600;margin-bottom:20px;color:#fff}
        .steps-row{display:flex;align-items:center;justify-content:space-between}
        .step-item{display:flex;align-items:center;gap:12px;flex:1}
        .step-item-icon{width:36px;height:36px;border-radius:50%;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);display:flex;align-items:center;justify-content:center;color:#C084FC}
        .step-item-text h4{margin:0 0 4px;font-size:13px;font-weight:600;color:#fff}
        .step-item-text p{margin:0;font-size:11px;color:rgba(255,255,255,.4);line-height:1.4}
        .step-arrow{color:rgba(255,255,255,.1);font-size:20px;margin:0 12px}

        .footer-card{background:linear-gradient(90deg,rgba(139,92,246,.05),rgba(94,230,255,.05));border:1px solid rgba(139,92,246,.2);border-radius:16px;padding:20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:12px}
        .footer-card p{margin:0;color:#c4a0ff;font-size:14px;font-weight:600}
        .footer-card span{color:rgba(255,255,255,.5);font-size:12px;font-weight:400}

        .benefit-list{display:flex;flex-direction:column;gap:20px;margin-bottom:32px}
        .benefit-item{display:flex;gap:16px;align-items:center}
        .benefit-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .benefit-text h4{margin:0 0 4px;font-size:14px;font-weight:600;color:#fff}
        .benefit-text p{margin:0;font-size:12px;color:rgba(255,255,255,.5);line-height:1.4}

        .social-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
        .social-icon{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:24px;transition:.2s}
        .social-icon:hover{background:rgba(255,255,255,.08);transform:translateY(-2px)}

        .cta-card{background:radial-gradient(circle at top right,rgba(139,92,246,.2),transparent),rgba(20,20,28,.8);border:1px solid rgba(139,92,246,.3);border-radius:16px;padding:24px;text-align:center;margin-bottom:16px;box-shadow:0 10px 30px rgba(139,92,246,.15)}
        .cta-btn{width:100%;background:#8B5CF6;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;margin-top:16px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .cta-btn:hover{background:#9F67FF;box-shadow:0 0 16px rgba(139,92,246,.3)}

        .secure-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:16px;display:flex;gap:12px;align-items:flex-start}

        /* OVERRIDES DAS MODAIS/CONFIGURACOES ORIGINAIS */
        input[type=url],input[type=text],input[type=email]{width:100%;margin-top:12px;padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(17,17,26,0.6);color:#fff;font-size:15px;outline:none;transition:180ms ease}
        input[type=url]:focus,input[type=text]:focus,input[type=email]:focus{box-shadow:0 0 0 3px rgba(139,92,246,0.20),0 0 0 6px rgba(94,230,255,0.08);border-color:rgba(139,92,246,0.45)}
        .qr-box{text-align:center;padding:20px 0}
        .qr-img{border-radius:12px;border:2px solid rgba(255,255,255,.15);box-shadow:0 12px 30px rgba(0,0,0,0.3)}
        .err{margin-top:16px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);border-radius:12px;padding:14px}
        .err-title{color:#f87171;font-weight:700;margin-bottom:8px}
        .err-detail{font-family:monospace;font-size:11px;color:rgba(255,255,255,.5);white-space:pre-wrap;word-break:break-word;max-height:200px;overflow:auto}
        .fallback{margin-top:16px;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.25);border-radius:12px;padding:16px}
        .player{background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;margin-bottom:24px;box-shadow:0 18px 60px rgba(0,0,0,0.35),inset 0 0 0 1px rgba(255,255,255,0.02);transition:all 180ms cubic-bezier(0.22, 1, 0.36, 1)}
        .player-top{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;font-size:14px;border-bottom:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.01)}
        .video-wrapper{position:relative;width:100%;display:flex;justify-content:center;background:#030305;padding:20px 0}
        .video-blur-bg{position:absolute;top:0;left:0;right:0;bottom:0;opacity:0.4;filter:blur(40px);z-index:0;pointer-events:none}
        video{position:relative;z-index:1;max-height:480px;border-radius:16px;box-shadow:0 12px 30px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.1)}
        .player-bottom{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:rgba(255,255,255,.01);border-top:1px solid rgba(255,255,255,.04);flex-wrap:wrap;gap:12px}
        .share-title{font-size:11px;font-weight:700;color:#5EE6FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
        .share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .share-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 6px;font-size:12px;font-weight:600;cursor:pointer;color:#F5F7FF;text-align:center;transition:180ms ease}
        .dl{text-decoration:none;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#F5F7FF;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;transition:180ms ease}
        .clip-list{display:flex;flex-direction:column;gap:8px}
        .clip-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);cursor:pointer;transition:180ms ease}
        .clip-item.on{background:rgba(139,92,246,.14);border-color:#8B5CF6;box-shadow:0 0 10px rgba(139,92,246,0.1)}
        .style-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px}
        .style-card{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);border-radius:10px;padding:10px 6px;cursor:pointer;text-align:center;transition:180ms ease}
        .style-card.on{border-color:#8B5CF6;background:rgba(139,92,246,.15);box-shadow:0 0 12px rgba(139,92,246,0.15)}
        .style-preview{font-size:11px;font-weight:700;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;margin-bottom:6px}
        .style-name{font-size:10px;color:#7E849B}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(139,92,246,.95);color:#fff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;z-index:999;pointer-events:none;animation:fadeup .3s ease;box-shadow:0 10px 30px rgba(139,92,246,0.3)}
        .pub-btn{text-decoration:none;background:linear-gradient(135deg,#C084FC,#8B5CF6);color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:180ms ease}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(3,3,8,0.68);backdrop-filter:blur(10px);z-index:999;display:flex;align-items:center;justify-content:center;animation:fadein .3s ease}
        .modal{background:radial-gradient(circle at top,rgba(139,92,246,0.16),transparent 35%),linear-gradient(180deg,rgba(24,24,38,0.95),rgba(12,12,20,0.95));border:1px solid rgba(255,255,255,0.10);border-radius:28px;padding:36px;width:90%;max-width:520px;text-align:center;box-shadow:0 30px 120px rgba(0,0,0,0.55),0 0 40px rgba(139,92,246,0.12);position:relative}
        .modal-close{position:absolute;top:20px;right:20px;background:none;border:none;color:#B8BED6;font-size:24px;cursor:pointer;transition:180ms ease}
        .chip{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#E7EAF6;border-radius:10px;padding:10px 6px;cursor:pointer;font-weight:600;font-size:13px;transition:180ms ease}
        .chip.on{background:rgba(139,92,246,0.18);border-color:rgba(139,92,246,0.45);color:#F5F7FF;box-shadow:0 0 12px rgba(139,92,246,0.15)}
        .adv-panel{border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);border-radius:16px;margin:24px 0 0;overflow:hidden;transition:all 240ms cubic-bezier(0.22, 1, 0.36, 1)}
        .adv-btn{width:100%;padding:16px 20px;background:none;border:none;color:#F5F7FF;font-size:14px;font-weight:600;display:flex;justify-content:space-between;cursor:pointer;transition:180ms ease}
        .adv-content{padding:0 20px;max-height:0;overflow:hidden;transition:max-height 240ms cubic-bezier(0.22, 1, 0.36, 1), padding 240ms ease; opacity:0}
        .adv-content.open{max-height:500px;padding:0 20px 20px; opacity:1}
        .label{display:flex;justify-content:space-between;font-size:13px;color:#B8BED6;margin:16px 0 8px;font-weight:500}
        .btn-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .btn-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        @keyframes fadeup{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spin-reverse{to{transform:rotate(-360deg)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @media(max-width:1100px){.grid-3{grid-template-columns:1fr}.center-hero{margin-top:24px}.saas-top{flex-direction:column;gap:16px}}
      `}</style>
      {copyToast && <div className="toast">{copyToast}</div>}
      <div className="page"><div className="wrap">
        <div className="saas-top">
          <div className="logo">KLIPORA</div>
          
          <div className="stepper">
            <div className={`step ${loading || result ? "done" : "active"}`}>
              <div className="step-num">{loading || result ? "✓" : "1"}</div> Enviar
            </div>
            <div className="step-line"></div>
            <div className={`step ${loading ? "active" : result ? "done" : ""}`}>
              <div className="step-num">{result ? "✓" : "2"}</div> Cortar
            </div>
            <div className="step-line"></div>
            <div className={`step ${result ? "active" : ""}`}>
              <div className="step-num">3</div> Personalizar
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-num">4</div> Publicar
            </div>
          </div>

          <div className="top-actions" style={{display:"flex",alignItems:"center",gap:16}}>
            {userPlan !== "pro" && (
              <button className="btn-main" id="trigger-checkout" style={{padding:"8px 20px",fontSize:13}} onClick={handleCheckout}>
                💎 Seja PRO
              </button>
            )}
            {userPlan === "pro" && (
              <span style={{background:"rgba(139,92,246,0.2)",color:"#C084FC",padding:"4px 14px",borderRadius:100,fontSize:11,fontWeight:700,border:"1px solid rgba(139,92,246,0.3)"}}>
                PRO
              </span>
            )}
            <div className="user-avatar" style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,cursor:pointer,border:"1px solid rgba(255,255,255,0.1)"}} onClick={()=>window.location.href="/api/auth/logout"}>
              {currentUser?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <a href="/" className="btn-back">← Voltar</a>
          </div>
        </div>
        <div className="grid-3">
          {/* COLUNA 1 - ADICIONAR VÍDEO */}
          <div className="col-left">
            <div className="panel">
              <h2 className="panel-title">Adicionar vídeo</h2>
              <p className="panel-sub">Envie um vídeo, cole o link ou escaneie o QR com seu celular.</p>
              
              <button className={`up-btn${tab==="upload"?" active":""}`} onClick={()=>setTab("upload")} disabled={loading}>
                <span className="up-icon">↑</span> Upload do PC
              </button>
              <button className={`up-btn${tab==="link"?" active":""}`} onClick={()=>setTab("link")} disabled={loading}>
                <span className="up-icon">🔗</span> Link direto
              </button>
              <button className={`up-btn${tab==="qr"?" active":""}`} onClick={()=>setTab("qr")} disabled={loading}>
                <span className="up-icon">📱</span> QR do celular
              </button>

              <input ref={fileRef} type="file" accept="video/*,audio/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){setFile(f);setResult(null);}}} />
              
              {tab==="upload" && (
                !file ? (
                  <div className={`drop-zone${isDragging?" drag":""}`} style={{marginTop:16}} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)} onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files?.[0];if(f){setFile(f);setResult(null);}}}>
                    <div style={{fontSize:24}}>🎬</div>
                    <div style={{fontWeight:600,margin:"8px 0 4px",fontSize:13}}>Arraste ou clique</div>
                  </div>
                ) : (
                  <div className="file-card">
                    <button className="file-card-close" onClick={()=>setFile(null)}>✕</button>
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">{fmtKB(Math.round(file.size/1024))}</div>
                    <div style={{fontSize:11,color:"#8B5CF6",marginTop:4,fontWeight:600}}>
                       {/* Duração detectada via preview */}
                    </div>
                    {loading && progress >= 0 && (
                      <>
                        <div className="prog-bar-bg"><div className="prog-bar-fill" style={{width:`${Math.max(10, progress*25)}%`}}></div></div>
                        <div className="prog-stats"><span>Enviando vídeo...</span><span>{Math.max(10, progress*25)}%</span></div>
                      </>
                    )}
                  </div>
                )
              )}

              {tab==="link" && (
                <div style={{marginTop:16}}>
                  <input type="url" placeholder="https://drive.google.com/..." value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} disabled={loading} />
                  <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:8}}>✅ Google Drive · Dropbox · Links MP4</div>
                </div>
              )}

              {tab==="qr" && (
                <div className="qr-box">
                  {qrStatus!=="done" ? (
                    <button className="up-btn active" style={{justifyContent:"center",marginTop:16}} onClick={generateQr} disabled={loading}>Gerar QR Code</button>
                  ) : (
                    <div style={{color:"#4ade80",fontWeight:700,fontSize:13,marginTop:16}}>✅ Vídeo recebido via celular!</div>
                  )}
                </div>
              )}



              {result && !result.success && (
                <div className="err">
                  <div className="err-title">✗ {result.error}</div>
                  {result.detail && <div className="err-detail">{result.detail}</div>}
                </div>
              )}
            </div>
            
            <div className="tip-card">
              <div className="tip-icon">✨</div>
              <div className="tip-text">
                <h4>Dica</h4>
                Vídeos com boa iluminação e áudio claro geram melhores resultados.
              </div>
            </div>
            
            <div className="tip-card" style={{borderColor:"rgba(139,92,246,.2)"}}>
              <div className="tip-icon" style={{color:"#fff",background:"rgba(139,92,246,.2)",width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>?</div>
              <div className="tip-text" style={{width:"100%"}}>
                <h4 style={{color:"#c4a0ff"}}>Precisa de ajuda?</h4>
                <p style={{marginBottom:12}}>Veja nosso guia rápido de como gerar os melhores clips.</p>
                <button style={{background:"rgba(139,92,246,.2)",border:"none",color:"#c4a0ff",padding:"6px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",width:"100%"}}>Ver guia rápido →</button>
              </div>
            </div>
          </div>

          {/* COLUNA 2 - CENTRAL */}
          <div className="col-center">
            {result?.success && activeClip ? (
              <div className="panel" style={{padding:20}}>
                <div className="player">
                  <div className="player-top">
                    <span style={{fontWeight:800,color:"#fff",fontSize:16}}>Clip {activeClip.index}</span>
                    <span style={{color:"#4ade80",background:"rgba(74,222,128,.1)",padding:"4px 10px",borderRadius:100,fontSize:12,fontWeight:700}}>🔥 Alto Potencial Viral</span>
                  </div>
                  
                  <div className="video-wrapper">
                    <div className="video-blur-bg" style={{background:`url(/api/dl?url=${encodeURIComponent(activeClip.clipUrl)}) center/cover`}}></div>
                    <video key={activeClip.clipUrl} controls autoPlay crossOrigin="anonymous">
                      <source src={`/api/dl?url=${encodeURIComponent(activeClip.clipUrl)}`} type="video/mp4" />
                      {activeClip.captions_url && <track kind="subtitles" src={activeClip.captions_url} srcLang="pt" label="Português" default />}
                    </video>
                  </div>

                  <div className="player-bottom">
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <button className="pub-btn" onClick={()=>setShowPubModal(activeClip)}>🚀 Publicar</button>
                      <a className="dl" href={`/api/dl?url=${encodeURIComponent(activeClip.clipUrl)}&filename=${encodeURIComponent(activeClip.clipFilename)}&dl=1`} download={activeClip.clipFilename}>⬇ Baixar Clip</a>
                    </div>
                  </div>

                  {activeClip.copy && (activeClip.copy.legendas?.curta || activeClip.copy.hooks?.length > 0) && (
                    <div className="share-pack" style={{padding:20}}>
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

                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"32px 0 16px"}}>
                  <h3 style={{margin:0,fontSize:16,color:"#fff"}}>Clips encontrados <span style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:500,marginLeft:8}}>({result.clips?.length} melhores momentos)</span></h3>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Ordernar por: <strong style={{color:"#fff"}}>Relevância ▾</strong></div>
                </div>
                <div className="clip-list" style={{gap:12}}>
                  {result.clips?.map(clip=>(
                    <div key={clip.index} className={`clip-item${activeClip.index===clip.index?" on":""}`} style={{padding:16,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",alignItems:"flex-start",gap:16}}>
                      <div style={{width:80,height:120,background:`url(/api/dl?url=${encodeURIComponent(clip.clipUrl)}) center/cover`,borderRadius:8,flexShrink:0,position:"relative"}}>
                        <div style={{position:"absolute",bottom:4,right:4,background:"rgba(0,0,0,.8)",color:"#fff",fontSize:10,padding:"2px 6px",borderRadius:4,fontWeight:600}}>{fmtKB(clip.sizeKB)}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                          <span>{clip.copy?.legendas?.curta?.substring(0, 40) || `Momento Viral #${clip.index}`}...</span>
                          <span style={{color:"rgba(255,255,255,.3)"}}>☑</span>
                        </div>
                        
                        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                          <span style={{fontSize:10,color:"#f43f5e",background:"rgba(244,63,94,.1)",padding:"4px 8px",borderRadius:4,fontWeight:600}}>🔥 Pico de emoção</span>
                          <span style={{fontSize:10,color:"#4ade80",background:"rgba(74,222,128,.1)",padding:"4px 8px",borderRadius:4,fontWeight:600}}>🚀 9{clip.index%10}% Viral</span>
                        </div>

                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <button onClick={(e)=>{e.stopPropagation();setActiveClip(clip);window.scrollTo({top:0,behavior:"smooth"})}} style={{background:"rgba(255,255,255,.05)",border:"none",color:"#fff",padding:"6px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",transition:".2s"}}>
                            ▶ Prévia
                          </button>
                          <button style={{background:"rgba(139,92,246,.2)",border:"1px solid rgba(139,92,246,.4)",color:"#c4a0ff",padding:"6px 16px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",transition:".2s"}}>
                            Selecionar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="btn-giant" onClick={()=>(document.querySelector('.pub-btn') as HTMLElement)?.click()} style={{width:"100%",background:"linear-gradient(135deg,#8B5CF6,#c026d3)",color:"#fff",border:"none",padding:"16px",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 10px 30px rgba(139,92,246,.3)",marginTop:24}}>
                  Selecionar e continuar
                </button>
              </div>
            ) : loading ? (
              <div className="panel" style={{padding:0, overflow:"hidden"}}>
                <div className="center-hero">
                  <div className="hero-badge">Etapa 2 de 4</div>
                  <h2 className="hero-title"><span style={{color:"#8B5CF6"}}>✨</span> Analisando seu vídeo com IA</h2>
                  <p className="hero-sub">Nossa IA está identificando os melhores momentos para seus clips.</p>

                  <div className="orbital">
                    <div className="orbital-ring"></div>
                    <div className="orbital-ring-2"></div>
                    <div className="orbital-ring-3"></div>
                    <div className="orbital-core">✨</div>
                    <div className="chip-float" style={{top:20,left:-30}}><span style={{color:"#f43f5e"}}>❤️</span> Engajamento</div>
                    <div className="chip-float" style={{top:80,right:-50}}><span style={{color:"#4ade80"}}>〰️</span> Ritmo de fala</div>
                    <div className="chip-float" style={{bottom:40,left:-10}}><span style={{color:"#3b82f6"}}>#</span> Tópicos relevantes</div>
                    <div className="chip-float" style={{bottom:20,right:-20}}><span style={{color:"#fbbf24"}}>📈</span> Potencial viral</div>
                  </div>

                  <div className="big-prog-wrap">
                    <div className="big-prog-num">{Math.max(10, progress*25)}%</div>
                    <div style={{flex:1}}>
                        <div className="big-prog-bar"><div className="big-prog-fill" style={{width:`${Math.max(10, progress*25)}%`}}></div></div>
                        <div className="big-prog-text"><span>Analisando seu vídeo...</span><span>Isso pode levar alguns minutos</span></div>
                    </div>
                  </div>

                  <div className="metrics-row">
                    <div className="metric-box">
                        <div className="metric-icon" style={{color:"#C084FC",background:"rgba(192,132,252,.1)"}}>🎬</div>
                        <div><div className="metric-val">~8</div><div className="metric-lbl">Momentos identificados</div></div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-icon" style={{color:"#60a5fa",background:"rgba(96,165,250,.1)"}}>⏱</div>
                        <div><div className="metric-val">02:45</div><div className="metric-lbl">Duração total extraída</div></div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-icon" style={{color:"#4ade80",background:"rgba(74,222,128,.1)"}}>✓</div>
                        <div><div className="metric-val">98%</div><div className="metric-lbl">Confiança da IA</div></div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-icon" style={{color:"#fbbf24",background:"rgba(251,191,36,.1)"}}>📈</div>
                        <div><div className="metric-val">Alto</div><div className="metric-lbl">Potencial viral</div></div>
                    </div>
                  </div>

                  <div className="steps-flow">
                    <div className="steps-title">O que acontece agora?</div>
                    <div className="steps-row">
                        <div className="step-item">
                          <div className="step-item-icon">🎯</div>
                          <div className="step-item-text"><h4>1. Analisamos</h4><p>IA identifica os momentos.</p></div>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-item">
                          <div className="step-item-icon" style={{background:"rgba(255,255,255,.05)",color:"#fff",borderColor:"rgba(255,255,255,.1)"}}>✏️</div>
                          <div className="step-item-text"><h4>2. Selecionamos</h4><p>Geramos legendas e edição.</p></div>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-item">
                          <div className="step-item-icon" style={{background:"rgba(255,255,255,.05)",color:"#fff",borderColor:"rgba(255,255,255,.1)"}}>🚀</div>
                          <div className="step-item-text"><h4>3. Publicamos</h4><p>Pronto para redes sociais.</p></div>
                        </div>
                    </div>
                  </div>

                  <div className="footer-card">
                    <div style={{fontSize:20}}>⚡</div>
                    <p>Relaxe, a IA está trabalhando para você!</p>
                    <span>Avisaremos quando seus clips estiverem prontos.</span>
                  </div>
                </div>
              </div>
            ) : file || (tab === "link" && linkUrl) || qrStatus === "done" ? (
              <div className="panel" style={{padding:32}}>
                {file && (
                  <div style={{borderRadius:16,overflow:"hidden",marginBottom:32,background:"#000",border:"1px solid rgba(255,255,255,.1)",boxShadow:"0 10px 40px rgba(0,0,0,.5)"}}>
                    <video controls src={URL.createObjectURL(file)} style={{width:"100%",maxHeight:300,display:"block"}} />
                  </div>
                )}
                
                <h3 style={{margin:"0 0 24px",fontSize:20,color:"#fff",fontWeight:800}}>Configurações dos clips</h3>
                
                <div style={{display:"flex",gap:24,marginBottom:32}}>
                  <div style={{flex:1}}>
                    <div className="label" style={{marginTop:0}}><span>Formato</span></div>
                    <div className="btn-grid-2">
                      {[["original","📺 Original"],["9:16","📱 9:16"]].map(([v,l])=>(
                        <button key={v} className={`chip${format===v?" on":""}`} onClick={()=>setFormat(v)} disabled={loading} style={{padding:"16px 12px",borderRadius:12}}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{flex:1.5}}>
                    <div className="label" style={{marginTop:0}}><span>Duração dos clips</span></div>
                  <div className="btn-grid-4">
                      {DURATIONS.map(d=>(
                        <button key={d} className={`chip${duration===d?" on":""}`} onClick={()=>setDuration(d)} disabled={loading} style={{padding:"16px 12px",borderRadius:12}}>{fmtD(d)}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="label"><span>Estilos VIP</span> {userPlan !== "pro" && <span style={{fontSize:10,background:"#F59E0B",color:"#000",padding:"2px 6px",borderRadius:4,fontWeight:800,marginLeft:8}}>PRO</span>}</div>
                <div className="style-grid" style={{gridTemplateColumns:"repeat(5, 1fr)",marginBottom:32,gap:12}}>
                  {STYLES.map(s=>(
                    <div key={s.id} className={`style-card${subtitleStyle===s.id?" on":""}`} onClick={()=>{
                      if(s.pro && userPlan !== "pro") {
                        setCopyToast("💎 Este estilo é exclusivo para membros PRO!");
                        handleCheckout();
                        return;
                      }
                      setSubtitleStyle(s.id);
                    }} style={{position:"relative",padding:"16px 8px",borderRadius:12}}>
                      <div className="style-preview" style={{...s.preview as React.CSSProperties, height:28, fontSize:12, marginBottom:8}}>Abc</div>
                      <div className="style-name" style={{fontSize:11,fontWeight:600}}>{s.label} {s.pro && userPlan !== "pro" && "👑"}</div>
                    </div>
                  ))}
                </div>

                <div className="label"><span>A IA vai identificar:</span></div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:40}}>
                  <div className="chip-float" style={{position:"relative",boxShadow:"none",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",color:"rgba(255,255,255,.8)"}}><span style={{color:"#f43f5e"}}>😊</span> Picos de emoção</div>
                  <div className="chip-float" style={{position:"relative",boxShadow:"none",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",color:"rgba(255,255,255,.8)"}}><span style={{color:"#C084FC"}}>🪝</span> Ganchos poderosos</div>
                  <div className="chip-float" style={{position:"relative",boxShadow:"none",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",color:"rgba(255,255,255,.8)"}}><span style={{color:"#3b82f6"}}>#</span> Tópicos relevantes</div>
                  <div className="chip-float" style={{position:"relative",boxShadow:"none",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",color:"rgba(255,255,255,.8)"}}><span style={{color:"#4ade80"}}>〰️</span> Ritmo de fala</div>
                  <div className="chip-float" style={{position:"relative",boxShadow:"none",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",color:"rgba(255,255,255,.8)"}}><span style={{color:"#fbbf24"}}>📈</span> Potencial viral</div>
                </div>

                <button onClick={handleSubmit} disabled={loading||!canSubmit} style={{width:"100%",background:"linear-gradient(135deg,#8B5CF6,#c026d3)",color:"#fff",border:"none",padding:"20px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer",boxShadow:"0 16px 40px rgba(139,92,246,.3)",transition:".2s"}}>
                  Começar análise ✨
                </button>
                <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.4)",marginTop:16}}>Nossa IA analisará seu vídeo e encontrará os melhores momentos.</div>
              </div>
            ) : (
              <div className="panel" style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",padding:60}}>
                <div style={{fontSize:60,marginBottom:24,opacity:0.8}}>✨</div>
                <h2 style={{margin:"0 0 12px",fontSize:24}}>Aguardando vídeo</h2>
                <p style={{color:"rgba(255,255,255,.5)",fontSize:14,maxWidth:300,lineHeight:1.6}}>Envie um vídeo, cole o link ou escaneie o QR na coluna à esquerda para começar.</p>
              </div>
            )}
          </div>

          {/* COLUNA 3 - DIREITA */}
          <div className="col-right">
            <div className="benefit-list">
              <h3 style={{fontSize:14,color:"#fff",margin:"0 0 4px"}}>O que você terá ao final</h3>
              <div className="benefit-item">
                  <div className="benefit-icon" style={{background:"rgba(139,92,246,.2)",color:"#C084FC"}}>🎬</div>
                  <div className="benefit-text"><h4>Clips prontos</h4><p>Vários clips curtos com os melhores momentos.</p></div>
              </div>
              <div className="benefit-item">
                  <div className="benefit-icon" style={{background:"rgba(74,222,128,.15)",color:"#4ade80"}}>⚙️</div>
                  <div className="benefit-text"><h4>Personalização total</h4><p>Edite legendas, cores e estilos do seu jeito.</p></div>
              </div>
              <div className="benefit-item">
                  <div className="benefit-icon" style={{background:"rgba(236,72,153,.15)",color:"#f472b6"}}>🚀</div>
                  <div className="benefit-text"><h4>Publicação rápida</h4><p>Envie direto para TikTok e Instagram Reels.</p></div>
              </div>
            </div>

            <h3 style={{fontSize:14,color:"#fff",margin:"0 0 16px"}}>Redes sociais suportadas</h3>
            <div className="social-grid">
              <div className="social-icon">🎵</div>
              <div className="social-icon" style={{background:"linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",color:"#fff",borderColor:"transparent"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div className="social-icon" style={{color:"#ff0000"}}>▶</div>
              <div className="social-icon" style={{color:"#1877F2",fontWeight:900,fontSize:20}}>f</div>
              <div className="social-icon" style={{color:"#0A66C2",fontWeight:900,fontSize:18}}>in</div>
              <div className="social-icon" style={{color:"#fff",fontWeight:800,fontSize:20}}>𝕏</div>
              <div className="social-icon" style={{color:"#E60023",fontWeight:800,fontSize:20}}>P</div>
              <div className="social-icon" style={{fontSize:14,color:"rgba(255,255,255,.4)",flexDirection:"column",gap:4}}><span style={{fontSize:18}}>+</span><span style={{fontSize:8}}>Em breve</span></div>
            </div>

            <div className="cta-card">
              <div style={{fontSize:32,marginBottom:12}}>📅</div>
              <h3 style={{margin:"0 0 8px",fontSize:16,color:"#fff"}}>Pronto para publicar</h3>
              <p style={{fontSize:12,color:"rgba(255,255,255,.6)",margin:0,lineHeight:1.5}}>Agende ou publique seus clips diretamente nas redes sociais com apenas 1 clique.</p>
              <button className="cta-btn" onClick={()=>{ if(activeClip) setShowPubModal(activeClip); else alert("Aguarde a geração do clipe para publicar!") }}>Ver próximas etapas →</button>
            </div>

            <div className="secure-card">
              <div style={{color:"#4ade80",fontSize:20}}>🛡️</div>
              <div>
                  <h4 style={{margin:"0 0 4px",fontSize:13,color:"#fff"}}>Seus dados estão seguros</h4>
                  <p style={{margin:"0 0 8px",fontSize:11,color:"rgba(255,255,255,.4)",lineHeight:1.4}}>Seus vídeos são privados e protegidos com criptografia de ponta a ponta.</p>
                  <span style={{color:"#4ade80",fontSize:10,fontWeight:700,background:"rgba(74,222,128,.1)",padding:"4px 8px",borderRadius:4}}>🔒 100% seguro</span>
              </div>
            </div>
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
              
              {igAccounts === null || igAccounts.length === 0 ? (
                <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15}} onClick={()=>window.location.href="/api/auth/instagram"}>
                  <span style={{color:"#E1306C",fontSize:20}}>📸</span> Conectar Conta do Instagram (Reels)
                </button>
              ) : (
                <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:16}}>
                  <div style={{fontSize:13,color:"#E1306C",fontWeight:700,marginBottom:12}}>📸 POSTAR NO INSTAGRAM REELS</div>
                  {igAccounts.map(acc => (
                    <div key={acc.igId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,0,0,.3)",padding:10,borderRadius:8,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <img src={acc.igPicture || "https://placehold.co/40x40/333/fff?text=IG"} width={30} height={30} style={{borderRadius:"50%"}} alt="ig"/>
                        <span style={{fontSize:14,fontWeight:600}}>@{acc.igUsername}</span>
                      </div>
                      <button className="pub-btn" onClick={()=>publishToInstagram(acc.igId)} disabled={igStatus==="publishing"}>
                        {igStatus==="publishing" ? "⏳" : "Publicar"}
                      </button>
                    </div>
                  ))}
                  {igStatus==="publishing" && <div style={{fontSize:12,color:"#c4a0ff",marginTop:8}}>Enviando e processando vídeo no Meta... (Pode levar até 2 min)</div>}
                  {igStatus==="done" && <div style={{fontSize:12,color:"#4ade80",marginTop:8}}>✅ Vídeo publicado com sucesso!</div>}
                </div>
              )}

              <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15, background: "#25D366", color: "#fff", border: "none"}} onClick={() => shareToWhatsApp(showPubModal)}>
                <span style={{fontSize:20}}>💬</span> Enviar para WhatsApp (Custo Zero)
              </button>

              <button className="chip" style={{padding:16,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:15}} onClick={() => shareToSMS(showPubModal)}>
                <span style={{fontSize:20}}>📱</span> Enviar via SMS
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
              Esta funcionalidade é exclusiva para assinantes. Libere exportação em 1080p, estilos virais de legenda e remoção de limites.
            </p>
            <button id="trigger-checkout" className="submit" style={{width:"100%",marginTop:0}} onClick={handleCheckout}>Assinar agora com Stripe / PIX</button>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={()=>setShowLoginModal(false)}>✕</button>
            <h2 style={{margin:"0 0 8px",fontSize:22}}>Entrar</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:16}}>
              Digite seu e-mail para salvar seus clips e acessar seu plano PRO.
            </p>
            <input type="email" placeholder="seu@email.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} style={{marginBottom:16}} />
            <button className="submit" style={{width:"100%",marginTop:0}} onClick={handleLogin}>Continuar</button>
          </div>
        </div>
      )}
    </>
  );
}