"use client";
import { useState, useEffect, useRef } from "react";

function useCountdown(targetDate: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    function update() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return time;
}

const TARGET_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export default function Landing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [vipNome, setVipNome] = useState("");
  const [vipEmail, setVipEmail] = useState("");
  const [vipLoading, setVipLoading] = useState(false);
  const [vipSuccess, setVipSuccess] = useState(false);
  const [vipError, setVipError] = useState("");
  const [vagas, setVagas] = useState(47);
  const [showFloating, setShowFloating] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const vipRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(TARGET_DATE);
  const typeWords = ["TikTok.", "Reels.", "Shorts.", "virais."];

  useEffect(() => {
    const iv = setInterval(() => setTypeIndex(i => (i + 1) % typeWords.length), 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    function onScroll() { setShowFloating(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prices = { starter: annual ? 54 : 67, pro: annual ? 102 : 127, agency: annual ? 198 : 247 };

  const faqs = [
    { q: "O Klipora funciona com qualquer vídeo do YouTube?", a: "Sim! Cole o link de qualquer vídeo público do YouTube e o Klipora baixa e corta automaticamente em clips." },
    { q: "Os clips saem prontos para TikTok e Reels?", a: "Nos planos Starter e Pro os clips saem no formato 9:16 com crop automático. No plano Free o formato é o original." },
    { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade e sem multa. Cancele a qualquer momento pelo painel." },
    { q: "Como funcionam os vídeos do mês?", a: "Cada vídeo processado conta como 1 uso, independente do número de clips gerados." },
    { q: "O plano Free tem limite de tempo?", a: "Não! O plano Free é para sempre com 3 vídeos por mês sem precisar de cartão de crédito." },
  ];

  async function handleVip() {
    setVipError("");
    if (!vipNome.trim() || !vipEmail.trim()) { setVipError("Preencha nome e email!"); return; }
    setVipLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: vipNome.trim(), email: vipEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) { setVipSuccess(true); setVagas(v => Math.max(0, v - 1)); }
      else setVipError(data.error || "Erro ao cadastrar");
    } catch { setVipError("Erro de rede. Tente novamente."); }
    finally { setVipLoading(false); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#0d0d1a;color:#fff;font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
        .urgency-bar{background:linear-gradient(90deg,#7c3aed,#c026d3,#7c3aed);background-size:200%;animation:bar-move 3s linear infinite;padding:10px 24px;text-align:center;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;cursor:pointer}
        @keyframes bar-move{0%{background-position:0%}100%{background-position:200%}}
        .urgency-dot{width:8px;height:8px;border-radius:50%;background:#fff;animation:blink 1s infinite;flex-shrink:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .urgency-pill{background:rgba(255,255,255,0.2);padding:3px 12px;border-radius:100px;font-size:12px}
        nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:68px;background:rgba(13,13,26,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
        .nav-logo{font-family:'Syne',sans-serif;font-weight:900;font-size:22px;letter-spacing:2px;background:linear-gradient(90deg,#b57bee,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .nav-links{display:flex;gap:32px;list-style:none}
        .nav-links a{color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;transition:color .2s}
        .nav-links a:hover{color:#fff}
        .nav-cta{background:linear-gradient(135deg,#7c3aed,#c026d3);border:none;color:#fff;padding:10px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
        .nav-cta:hover{opacity:.85;transform:translateY(-1px)}
        .glow{position:fixed;pointer-events:none;z-index:0;border-radius:50%;filter:blur(80px)}
        .hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 5% 60px;position:relative;z-index:1}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);color:#c4a0ff;font-size:12px;font-weight:600;padding:6px 16px;border-radius:100px;margin-bottom:28px;text-transform:uppercase;letter-spacing:.5px;animation:badge-pulse 2s infinite}
        @keyframes badge-pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 8px rgba(124,58,237,0)}}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#b57bee}
        .hero h1{font-family:'Syne',sans-serif;font-size:clamp(42px,6vw,80px);font-weight:900;line-height:1.0;letter-spacing:-3px;margin-bottom:20px;max-width:900px}
        .tw{background:linear-gradient(90deg,#9d6ffd,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block;min-height:1.1em}
        .hero-sub{font-size:18px;color:rgba(255,255,255,0.6);max-width:520px;line-height:1.8;margin:0 auto 40px}
        .hero-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:60px}
        .btn-primary{background:linear-gradient(135deg,#7c3aed,#c026d3);border:none;color:#fff;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 0 40px rgba(124,58,237,0.4)}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 60px rgba(124,58,237,0.6)}
        .btn-secondary{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:16px 36px;border-radius:12px;font-size:16px;cursor:pointer;transition:all .2s}
        .btn-secondary:hover{background:rgba(255,255,255,0.1);transform:translateY(-2px)}
        .hero-stats{display:flex;gap:48px;flex-wrap:wrap;justify-content:center}
        .stat-num{font-size:36px;font-weight:900;background:linear-gradient(90deg,#9d6ffd,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .stat-label{font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px}
        .phone{width:200px;height:360px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.12);border-radius:32px;overflow:hidden;padding:20px 12px;display:flex;flex-direction:column;gap:10px;animation:phone-glow 3s ease-in-out infinite;margin:0 auto 48px}
        @keyframes phone-glow{0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.3)}50%{box-shadow:0 0 60px rgba(192,38,211,0.5)}}
        .clip-card{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);border-radius:10px;padding:10px;display:flex;align-items:center;gap:8px}
        .clip-icon{width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#c026d3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .clip-meta{flex:1}
        .clip-title{font-size:11px;font-weight:600}
        .clip-bar{height:3px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:6px;overflow:hidden}
        .clip-bar-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#c026d3);border-radius:2px}
        section{position:relative;z-index:1;padding:80px 5%}
        .section-badge{display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);color:#c4a0ff;font-size:12px;font-weight:600;padding:5px 16px;border-radius:100px;margin-bottom:20px;text-transform:uppercase;letter-spacing:.5px}
        .section-title{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-1px;margin-bottom:12px;line-height:1.1}
        .section-sub{font-size:16px;color:rgba(255,255,255,0.5);margin-bottom:48px}
        .platforms{display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;margin-bottom:48px}
        .platform-pill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:10px 20px;border-radius:100px;font-size:14px;font-weight:600}
        .reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:1000px;margin:0 auto}
        .review{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px;transition:all .3s}
        .review:hover{transform:translateY(-4px);border-color:rgba(124,58,237,0.3)}
        .stars{color:#f59e0b;font-size:13px;letter-spacing:2px;margin-bottom:12px}
        .review-text{font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7;margin-bottom:16px}
        .reviewer{display:flex;align-items:center;gap:10px}
        .avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#c026d3);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
        .reviewer-name{font-size:14px;font-weight:600}
        .reviewer-role{font-size:12px;color:rgba(255,255,255,0.4)}
        .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:1000px;margin:0 auto 40px}
        .step{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:32px;text-align:center;transition:all .3s}
        .step:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-4px)}
        .step-num{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#c026d3);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;margin:0 auto 16px;box-shadow:0 0 30px rgba(124,58,237,0.4)}
        .step h3{font-size:18px;font-weight:700;margin-bottom:10px}
        .step p{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7}
        .toggle-wrap{display:inline-flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:6px 18px;border-radius:100px;margin-bottom:48px;font-size:14px;cursor:pointer}
        .toggle{position:relative;width:44px;height:24px;flex-shrink:0}
        .toggle input{opacity:0;width:0;height:0;position:absolute}
        .toggle-slider{position:absolute;inset:0;background:rgba(255,255,255,0.1);border-radius:100px;cursor:pointer;transition:.3s}
        .toggle-slider::before{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;bottom:3px;left:3px;transition:.3s}
        .toggle input:checked + .toggle-slider{background:linear-gradient(135deg,#7c3aed,#c026d3)}
        .toggle input:checked + .toggle-slider::before{transform:translateX(20px)}
        .discount-pill{background:rgba(124,58,237,0.2);color:#c4a0ff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px}
        .plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;max-width:1100px;margin:0 auto}
        .plan{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;position:relative;transition:all .3s}
        .plan:hover{transform:translateY(-6px);border-color:rgba(124,58,237,0.3)}
        .plan.popular{border:2px solid #7c3aed;box-shadow:0 0 50px rgba(124,58,237,0.2)}
        .popular-tag{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-size:12px;font-weight:700;padding:4px 18px;border-radius:100px;white-space:nowrap}
        .plan-name{font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
        .plan-price{font-size:42px;font-weight:900;letter-spacing:-2px;margin-bottom:4px}
        .plan-price sub{font-size:16px;font-weight:400;color:rgba(255,255,255,0.4)}
        .plan-limit{font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.07)}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
        .plan-features li{font-size:14px;color:rgba(255,255,255,0.65);display:flex;align-items:center;gap:8px}
        .plan-features li::before{content:'✓';color:#a78bfa;font-weight:700;flex-shrink:0}
        .plan-btn{width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
        .plan-btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.2);color:#fff}
        .plan-btn-outline:hover{background:rgba(255,255,255,0.08)}
        .plan-btn-grad{background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;box-shadow:0 0 20px rgba(124,58,237,0.3)}
        .plan-btn-grad:hover{opacity:.9;box-shadow:0 0 40px rgba(124,58,237,0.5)}
        .faq-wrap{max-width:760px;margin:0 auto}
        .faq-item{border-bottom:1px solid rgba(255,255,255,0.07)}
        .faq-btn{width:100%;background:none;border:none;color:#fff;font-size:16px;font-weight:600;padding:22px 0;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px}
        .faq-icon{width:28px;height:28px;border-radius:50%;background:rgba(124,58,237,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;font-size:16px}
        .faq-item.open .faq-icon{background:linear-gradient(135deg,#7c3aed,#c026d3);transform:rotate(45deg)}
        .faq-answer{max-height:0;overflow:hidden;transition:max-height .4s ease,padding .3s}
        .faq-item.open .faq-answer{max-height:200px;padding-bottom:20px}
        .faq-answer p{font-size:15px;color:rgba(255,255,255,0.55);line-height:1.8}
        .vip-card{max-width:620px;margin:0 auto;background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(192,38,211,0.08));border:1px solid rgba(124,58,237,0.3);border-radius:28px;padding:52px 44px;text-align:center;position:relative;overflow:hidden}
        .vip-card::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:400px;height:400px;background:radial-gradient(ellipse,rgba(124,58,237,0.15) 0%,transparent 70%);border-radius:50%;animation:vip-glow 4s ease-in-out infinite;pointer-events:none}
        @keyframes vip-glow{0%,100%{transform:translateX(-50%) scale(1);opacity:.6}50%{transform:translateX(-50%) scale(1.2);opacity:1}}
        .vip-badge{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-size:13px;font-weight:700;padding:7px 18px;border-radius:100px;margin-bottom:20px;animation:badge-pulse 2s infinite}
        .vip-title{font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-1px;margin-bottom:12px}
        .vip-sub{font-size:15px;color:rgba(255,255,255,0.55);margin-bottom:28px;line-height:1.7}
        .countdown-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;max-width:400px;margin-left:auto;margin-right:auto}
        .cd-block{background:rgba(0,0,0,0.4);border:1px solid rgba(124,58,237,0.3);border-radius:14px;padding:14px 8px}
        .cd-num{font-size:38px;font-weight:900;letter-spacing:-2px;background:linear-gradient(135deg,#9d6ffd,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block;line-height:1}
        .cd-label{font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-top:4px;display:block}
        .vagas-line{display:inline-flex;align-items:center;gap:8px;color:#f59e0b;font-size:14px;font-weight:700;margin-bottom:24px}
        .vagas-dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;animation:blink 1s infinite}
        .vip-form{display:flex;flex-direction:column;gap:12px;position:relative;z-index:1}
        .vip-input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:15px 18px;color:#fff;font-size:15px;outline:none;transition:border-color .2s;width:100%}
        .vip-input::placeholder{color:rgba(255,255,255,0.3)}
        .vip-input:focus{border-color:#7c3aed}
        .vip-btn{background:linear-gradient(135deg,#7c3aed,#c026d3);border:none;color:#fff;padding:17px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s;animation:btn-glow 2.5s ease-in-out infinite}
        @keyframes btn-glow{0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.4)}50%{box-shadow:0 0 60px rgba(192,38,211,0.7)}}
        .vip-btn:hover{transform:translateY(-2px)}
        .vip-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .vip-success{background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:17px;color:#4ade80;font-size:16px;font-weight:700}
        .vip-error{color:#f87171;font-size:13px;margin-top:4px}
        .vip-privacy{font-size:12px;color:rgba(255,255,255,0.25);margin-top:10px}
        footer{border-top:1px solid rgba(255,255,255,0.06);padding:40px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;position:relative;z-index:1}
        .footer-logo{font-family:'Syne',sans-serif;font-weight:900;font-size:20px;letter-spacing:2px;background:linear-gradient(90deg,#b57bee,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .footer-links{display:flex;gap:24px}
        .footer-links a{color:rgba(255,255,255,0.4);text-decoration:none;font-size:13px;transition:color .2s}
        .footer-links a:hover{color:#fff}
        .floating{position:fixed;bottom:24px;right:24px;z-index:200;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;border:none;padding:14px 22px;border-radius:100px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 32px rgba(124,58,237,0.5);transition:all .3s;animation:float-up 2s ease-in-out infinite}
        @keyframes float-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .floating.hidden{opacity:0;pointer-events:none;transform:translateY(20px)}
        @media(max-width:768px){.nav-links{display:none}.steps,.plans,.reviews{grid-template-columns:1fr}.vip-card{padding:32px 20px}.cd-num{font-size:28px}footer{flex-direction:column;text-align:center}}
      `}</style>

      <div className="glow" style={{width:600,height:600,background:"rgba(124,58,237,0.12)",top:-100,left:-200} as React.CSSProperties} />
      <div className="glow" style={{width:500,height:500,background:"rgba(192,38,211,0.08)",top:0,right:-150} as React.CSSProperties} />

      <div className="urgency-bar" onClick={() => vipRef.current?.scrollIntoView({behavior:"smooth"})}>
        <span className="urgency-dot" />
        🔥 Acesso antecipado encerrando em {countdown.days}d {String(countdown.hours).padStart(2,"0")}h {String(countdown.minutes).padStart(2,"0")}m {String(countdown.seconds).padStart(2,"0")}s
        <span className="urgency-pill">Apenas {vagas} vagas · Garantir →</span>
      </div>

      <nav>
        <div className="nav-logo">KLIPORA</div>
        <ul className="nav-links">
          <li><a href="#como-funciona">Como funciona</a></li>
          <li><a href="#precos">Preços</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <button className="nav-cta" onClick={() => vipRef.current?.scrollIntoView({behavior:"smooth"})}>Acesso antecipado</button>
      </nav>

      <section className="hero">
        <div className="hero-badge"><span className="badge-dot" /> MVP em construção · Acesso antecipado</div>
        <div className="phone">
          {[{w:"100%",t:"Clip 1 · 0:00→0:30"},{w:"70%",t:"Clip 2 · 0:30→1:00"},{w:"40%",t:"Clip 3 · gerando..."}].map((c,i) => (
            <div key={i} className="clip-card">
              <div className="clip-icon">🎬</div>
              <div className="clip-meta">
                <div className="clip-title">{c.t}</div>
                <div className="clip-bar"><div className="clip-bar-fill" style={{width:c.w}} /></div>
              </div>
            </div>
          ))}
        </div>
        <h1>
          <span>1 vídeo longo.</span>
          <span className="tw">Infinitos clips para {typeWords[typeIndex]}</span>
        </h1>
        <p className="hero-sub">Cole um link do YouTube ou faça upload e o <strong style={{color:"#fff"}}>Klipora</strong> gera clips prontos para TikTok, Reels e Shorts automaticamente.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => window.location.href="/app"}>⚡ Gerar clips grátis</button>
          <button className="btn-secondary" onClick={() => vipRef.current?.scrollIntoView({behavior:"smooth"})}>🚀 Acesso antecipado</button>
        </div>
        <div className="hero-stats">
          <div><div className="stat-num">12.847+</div><div className="stat-label">Clips gerados</div></div>
          <div><div className="stat-num">342+</div><div className="stat-label">Criadores ativos</div></div>
          <div><div className="stat-num">8.500+</div><div className="stat-label">Horas economizadas</div></div>
        </div>
      </section>

      <section style={{textAlign:"center"} as React.CSSProperties}>
        <div className="platforms">
          <div className="platform-pill">📱 TikTok</div>
          <div className="platform-pill">📸 Instagram Reels</div>
          <div className="platform-pill">▶️ YouTube Shorts</div>
        </div>
        <div className="reviews">
          {[
            {i:"MC",n:"Mariana Costa",r:"Criadora fitness",t:"Gastava 3h editando clips. Agora em 2 minutos tenho tudo pronto. O Klipora mudou minha rotina."},
            {i:"RP",n:"Rafael Pinheiro",r:"Youtuber de tecnologia",t:"Uso para cortar lives do meu canal. Os clips ficam perfeitos pro TikTok e meu alcance triplicou."},
            {i:"JS",n:"Juliana Santos",r:"Diretora de agência",t:"Gerenciamos 12 clientes. Com o Klipora entregamos clips para todos em metade do tempo."},
          ].map((rv,i) => (
            <div key={i} className="review">
              <div className="stars">★★★★★</div>
              <p className="review-text">"{rv.t}"</p>
              <div className="reviewer">
                <div className="avatar">{rv.i}</div>
                <div><div className="reviewer-name">{rv.n}</div><div className="reviewer-role">{rv.r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" style={{textAlign:"center"} as React.CSSProperties}>
        <div className="section-badge">Como funciona</div>
        <h2 className="section-title">3 passos. Resultado imediato.</h2>
        <p className="section-sub">Sem edição. Sem complicação.</p>
        <div className="steps">
          {[
            {n:"1",icon:"📤",title:"Sobe o vídeo",desc:"Faça upload do arquivo ou cole o link do YouTube. Suporta MP4, MOV, AVI, WebM e MKV."},
            {n:"2",icon:"⚙️",title:"Escolhe a duração",desc:"Selecione entre 15s, 30s, 1 minuto ou 2 minutos. O Klipora corta automaticamente."},
            {n:"3",icon:"📥",title:"Baixa todos os clips",desc:"Seus clips ficam prontos em segundos. Baixe um por um ou todos de uma vez."},
          ].map((s,i) => (
            <div key={i} className="step">
              <div className="step-num">{s.n}</div>
              <div style={{fontSize:32,marginBottom:16}}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precos" style={{textAlign:"center"} as React.CSSProperties}>
        <div className="section-badge">Planos</div>
        <h2 className="section-title">Simples e transparente</h2>
        <p className="section-sub">Cancele quando quiser. Sem surpresas.</p>
        <label className="toggle-wrap">
          <span>Mensal</span>
          <div className="toggle"><input type="checkbox" checked={annual} onChange={e => setAnnual(e.target.checked)} /><div className="toggle-slider" /></div>
          <span>Anual</span>
          <span className="discount-pill">-20%</span>
        </label>
        <div className="plans">
          {[
            {name:"Free",price:"R$0",limit:"3 vídeos/mês",features:["Clips básicos","Upload de arquivo","Download MP4"],btn:"plan-btn-outline",cta:"Começar grátis",pop:false},
            {name:"Starter",price:`R$${prices.starter}`,limit:"20 vídeos/mês",features:["Tudo do Free","Link do YouTube","Legendas automáticas","Crop 9:16"],btn:"plan-btn-outline",cta:"Entrar na lista",pop:false},
            {name:"Pro",price:`R$${prices.pro}`,limit:"60 vídeos/mês",features:["Tudo do Starter","Download em lote","Suporte prioritário","Processamento rápido"],btn:"plan-btn-grad",cta:"Entrar na lista",pop:true},
            {name:"Agency",price:`R$${prices.agency}`,limit:"200 vídeos/mês",features:["Tudo do Pro","Uso comercial","Suporte WhatsApp","Processamento prioritário"],btn:"plan-btn-outline",cta:"Entrar na lista",pop:false},
          ].map((p,i) => (
            <div key={i} className={`plan${p.pop?" popular":""}`}>
              {p.pop && <div className="popular-tag">⭐ Mais popular</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}<sub>/mês</sub></div>
              <div className="plan-limit">{p.limit}</div>
              <ul className="plan-features">{p.features.map((f,j) => <li key={j}>{f}</li>)}</ul>
              <button className={`plan-btn ${p.btn}`} onClick={() => p.name==="Free" ? window.location.href="/app" : vipRef.current?.scrollIntoView({behavior:"smooth"})}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq">
        <div style={{textAlign:"center",marginBottom:48} as React.CSSProperties}>
          <div className="section-badge">FAQ</div>
          <h2 className="section-title">Perguntas frequentes</h2>
        </div>
        <div className="faq-wrap">
          {faqs.map((f,i) => (
            <div key={i} className={`faq-item${openFaq===i?" open":""}`}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                {f.q}<div className="faq-icon">+</div>
              </button>
              <div className="faq-answer"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="vip" ref={vipRef}>
        <div className="vip-card">
          <div className="vip-badge">🚀 Acesso Antecipado</div>
          <h2 className="vip-title">Entre na lista VIP —<br />Acesso antecipado grátis</h2>
          <p className="vip-sub">Seja um dos primeiros a testar o Klipora e ganhe<br />acesso vitalício ao plano Free + 30 dias do Pro grátis.</p>
          <div className="countdown-grid">
            {[{n:countdown.days,l:"Dias"},{n:countdown.hours,l:"Horas"},{n:countdown.minutes,l:"Min"},{n:countdown.seconds,l:"Seg"}].map((c,i) => (
              <div key={i} className="cd-block">
                <span className="cd-num">{String(c.n).padStart(2,"0")}</span>
                <span className="cd-label">{c.l}</span>
              </div>
            ))}
          </div>
          <div className="vagas-line"><span className="vagas-dot" />🔥 Apenas {vagas} vagas restantes</div>
          {!vipSuccess ? (
            <div className="vip-form">
              <input className="vip-input" type="text" placeholder="Seu nome" value={vipNome} onChange={e => setVipNome(e.target.value)} />
              <input className="vip-input" type="email" placeholder="Seu melhor email" value={vipEmail} onChange={e => setVipEmail(e.target.value)} />
              {vipError && <p className="vip-error">⚠ {vipError}</p>}
              <button className="vip-btn" onClick={handleVip} disabled={vipLoading}>{vipLoading?"Enviando...":"🚀 Quero acesso antecipado"}</button>
              <p className="vip-privacy">Sem spam. Seus dados estão seguros.</p>
            </div>
          ) : (
            <div className="vip-success">✅ Na lista! Em breve você receberá um email.</div>
          )}
        </div>
      </section>

      <footer>
        <div className="footer-logo">KLIPORA</div>
        <div className="footer-links">
          <a href="/termos">Termos de uso</a>
          <a href="/privacidade">Privacidade</a>
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.3)"} as React.CSSProperties}>© 2026 Klipora. Todos os direitos reservados.</div>
      </footer>

      <button className={`floating${showFloating?"":" hidden"}`} onClick={() => vipRef.current?.scrollIntoView({behavior:"smooth"})}>
        🔥 {vagas} vagas restantes →
      </button>
    </>
  );
}