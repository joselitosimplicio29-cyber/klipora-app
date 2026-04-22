"use client";
import { useState, useEffect } from "react";
const P = { starter: 67, pro: 127, agency: 247 };
export default function Landing() {
  const [ann, setAnn] = useState(false);
  const disc = (n: number) => ann ? Math.round(n * 0.8) : n;
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".animate").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#07070B;color:#F5F7FF;font-family:Inter,system-ui,sans-serif;overflow-x:hidden}
        .bar{background:linear-gradient(90deg,#8B5CF6,#5EE6FF);padding:10px;text-align:center;font-size:13px;font-weight:700;color:#07070B;letter-spacing:0.5px}
        nav{display:flex;align-items:center;justify-content:space-between;padding:0 8%;height:80px;background:rgba(7,7,11,.75);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;z-index:100;box-shadow:0 4px 30px rgba(0,0,0,0.5)}
        .logo{font-size:24px;font-weight:900;letter-spacing:2px;background:linear-gradient(90deg,#C084FC,#5EE6FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 20px rgba(192,132,252,0.3)}
        .nav-links{display:flex;gap:32px;list-style:none}
        .nav-links a{color:#B8BED6;text-decoration:none;font-size:14px;font-weight:500;transition:all 180ms ease}
        .nav-links a:hover{color:#F5F7FF;text-shadow:0 0 12px rgba(255,255,255,0.4)}
        .btn-p{background:linear-gradient(135deg,#8B5CF6 0%,#A855F7 100%);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 180ms ease;box-shadow:0 8px 20px rgba(139,92,246,0.25),inset 0 1px 0 rgba(255,255,255,0.18)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,92,246,0.35),inset 0 1px 0 rgba(255,255,255,0.18);background:linear-gradient(135deg,#9F67FF 0%,#C084FC 100%)}
        .hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 5% 80px;background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(139,92,246,.25),transparent),radial-gradient(circle at top right,rgba(94,230,255,0.1),transparent 40%);position:relative}
        .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.35);color:#C084FC;font-size:13px;font-weight:600;padding:8px 20px;border-radius:100px;margin-bottom:32px;box-shadow:0 0 20px rgba(139,92,246,0.15)}
        h1{font-size:clamp(44px,7vw,88px);font-weight:900;letter-spacing:-3px;line-height:1.05;margin-bottom:24px;max-width:900px}
        .hl{background:linear-gradient(90deg,#F5F7FF 0%,#C084FC 50%,#5EE6FF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 30px rgba(192,132,252,0.3))}
        .sub{font-size:19px;color:#B8BED6;max-width:580px;line-height:1.7;margin:0 auto 48px;font-weight:400}
        .btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:80px}
        .btn-sec{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,.12);color:#F5F7FF;padding:16px 36px;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;transition:.3s;backdrop-filter:blur(10px)}
        .btn-sec:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);transform:translateY(-2px)}
        .btn-main{background:linear-gradient(135deg,#8B5CF6 0%,#6D5EF8 55%,#A855F7 100%);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:16px 40px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 30px rgba(139,92,246,.3),inset 0 1px 0 rgba(255,255,255,0.18);transition:all 180ms ease}
        .btn-main:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 14px 40px rgba(139,92,246,.4),inset 0 1px 0 rgba(255,255,255,0.18);background:linear-gradient(135deg,#9F67FF 0%,#7C6BFF 55%,#C084FC 100%)}
        .stats{display:flex;gap:64px;flex-wrap:wrap;justify-content:center;padding:32px 64px;background:linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.06);border-radius:24px;backdrop-filter:blur(20px)}
        .sn{font-size:42px;font-weight:900;background:linear-gradient(90deg,#F5F7FF,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sl{font-size:14px;color:#7E849B;margin-top:6px;font-weight:500;text-transform:uppercase;letter-spacing:1px}
        section{padding:100px 5%;max-width:1200px;margin:0 auto}
        .sec-badge{display:inline-block;background:rgba(94,230,255,.1);border:1px solid rgba(94,230,255,.25);color:#5EE6FF;font-size:13px;font-weight:600;padding:6px 16px;border-radius:100px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px}
        .sec-title{font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-1.5px;margin-bottom:16px}
        .sec-sub{color:#B8BED6;margin-bottom:64px;font-size:18px;line-height:1.6}
        .sources{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:0}
        .source-card{padding:32px 24px;border-radius:24px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));backdrop-filter:blur(10px);transition:all 300ms ease;box-shadow:0 10px 30px rgba(0,0,0,0.2)}
        .source-card:hover{transform:translateY(-5px);border-color:rgba(139,92,246,.3);box-shadow:0 20px 40px rgba(0,0,0,0.4),0 0 20px rgba(139,92,246,.1)}
        .source-card.main{border-color:rgba(139,92,246,.3);background:linear-gradient(180deg,rgba(139,92,246,.08),rgba(139,92,246,.02));box-shadow:0 10px 40px rgba(139,92,246,.1)}
        .src-icon{font-size:36px;margin-bottom:16px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4))}
        .src-title{font-weight:700;margin-bottom:8px;font-size:18px}
        .src-label{font-size:12px;margin-top:16px;padding:4px 12px;border-radius:100px;display:inline-block;font-weight:600}
        .src-main{background:rgba(139,92,246,.2);color:#C084FC;border:1px solid rgba(139,92,246,.4)}
        .src-good{background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3)}
        .src-beta{background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.3)}
        .feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
        .feat{padding:32px;border-radius:24px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));transition:all 300ms ease}
        .feat:hover{transform:translateY(-5px);border-color:rgba(94,230,255,.3);background:linear-gradient(180deg,rgba(94,230,255,.05),rgba(255,255,255,.01))}
        .feat-icon{font-size:36px;margin-bottom:20px;display:inline-block;padding:12px;background:rgba(255,255,255,.03);border-radius:16px;border:1px solid rgba(255,255,255,.08)}
        .feat h3{font-size:20px;font-weight:700;margin-bottom:12px}
        .feat p{font-size:15px;color:#B8BED6;line-height:1.7}
        .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
        .step{padding:40px 32px;border-radius:24px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));text-align:center;position:relative}
        .step::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);opacity:0.5}
        .step-num{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#5EE6FF);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;margin:0 auto 24px;box-shadow:0 10px 20px rgba(139,92,246,.3)}
        .step h3{font-weight:700;margin-bottom:12px;font-size:22px}
        .step p{font-size:15px;color:#B8BED6;line-height:1.7}
        .toggle-row{display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:60px;font-size:16px;font-weight:500}
        .tog{position:relative;width:52px;height:28px}
        .tog input{opacity:0;width:0;height:0;position:absolute}
        .ts{position:absolute;inset:0;background:rgba(255,255,255,.1);border-radius:100px;cursor:pointer;transition:.3s;border:1px solid rgba(255,255,255,.1)}
        .ts::before{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;bottom:3px;left:4px;transition:.3s;box-shadow:0 2px 5px rgba(0,0,0,.3)}
        .tog input:checked+.ts{background:linear-gradient(135deg,#8B5CF6,#C084FC);border-color:transparent}
        .tog input:checked+.ts::before{transform:translateX(22px)}
        .dpill{background:rgba(74,222,128,.15);color:#4ade80;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;border:1px solid rgba(74,222,128,.3)}
        .plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}
        .plan{padding:36px;border-radius:28px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));position:relative;display:flex;flex-direction:column}
        .plan.pop{border:1px solid rgba(139,92,246,.5);box-shadow:0 20px 60px rgba(139,92,246,.15);background:linear-gradient(180deg,rgba(139,92,246,.08),rgba(139,92,246,.02));transform:scale(1.02)}
        .pop-tag{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#8B5CF6,#C084FC);color:#fff;font-size:12px;font-weight:700;padding:6px 20px;border-radius:100px;white-space:nowrap;box-shadow:0 4px 12px rgba(139,92,246,.4)}
        .plan-name{font-size:14px;font-weight:700;color:#C084FC;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
        .plan-price{font-size:52px;font-weight:900;letter-spacing:-2px;margin-bottom:8px;line-height:1}
        .plan-price sub{font-size:16px;font-weight:500;color:#7E849B}
        .plan-limit{font-size:14px;color:#B8BED6;margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,.08)}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:14px;margin-bottom:36px;flex:1}
        .plan-feats li{font-size:14px;color:#F5F7FF;display:flex;gap:12px;align-items:flex-start}
        .plan-feats li::before{content:'✓';color:#5EE6FF;font-weight:700;flex-shrink:0}
        .plan-btn{width:100%;padding:16px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;border:none;transition:all 180ms ease}
        .pb-out{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.15);color:#fff}
        .pb-out:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.3)}
        .pb-grad{background:linear-gradient(135deg,#8B5CF6,#A855F7);color:#fff;box-shadow:0 8px 20px rgba(139,92,246,.3)}
        .pb-grad:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,92,246,.4)}
        .faq-wrap{max-width:800px;margin:0 auto}
        .faq-item{border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:8px;background:rgba(255,255,255,.02);border-radius:16px;padding:8px 24px}
        .faq-item:hover{background:rgba(255,255,255,.04)}
        .faq-btn{width:100%;background:none;border:none;color:#F5F7FF;font-size:16px;font-weight:600;padding:20px 0;text-align:left;cursor:pointer;display:flex;justify-content:space-between;gap:16px;align-items:center}
        .faq-icon{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;transition:.3s;color:#C084FC}
        .faq-btn:hover .faq-icon{background:rgba(139,92,246,.15);border-color:rgba(139,92,246,.3)}
        .faq-ans{max-height:0;overflow:hidden;transition:max-height .4s ease}
        .faq-ans.open{max-height:200px}
        .faq-ans p{font-size:15px;color:#B8BED6;line-height:1.8;padding-bottom:24px}
        footer{border-top:1px solid rgba(255,255,255,.06);padding:48px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;background:rgba(0,0,0,.2)}
        .fl{display:flex;gap:24px}
        .fl a{color:#7E849B;text-decoration:none;font-size:14px;font-weight:500;transition:.2s}
        .fl a:hover{color:#F5F7FF}
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate { opacity: 0; }
        .animate.visible { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media(max-width:768px){.nav-links,.nav-links+*{display:none}.stats{gap:32px;padding:24px}.plans,.feats,.steps,.sources{grid-template-columns:1fr}footer{flex-direction:column;text-align:center}h1{font-size:40px}}
      `}</style>

      <div className="bar">🚀 Klipora está em acesso antecipado — garanta o seu plano agora</div>

      <nav>
        <div className="logo">KLIPORA</div>
        <ul className="nav-links">
          <li><a href="#como">Como funciona</a></li>
          <li><a href="#precos">Preços</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <button className="btn-p" onClick={() => window.location.href = "/app"}>Começar grátis</button>
      </nav>

      <div className="hero animate">
        <div className="badge">⚡ Upload-First · IA de Edição · Legendas Profissionais</div>
        <h1>1 vídeo.<br /><span className="hl">Dezenas de clips prontos.</span></h1>
        <p className="sub">Suba o vídeo do PC, cole um link do Drive ou escaneie o QR com o celular. A IA corta, legenda e empacota tudo.</p>
        <div className="btns">
          <button className="btn-main" onClick={() => window.location.href = "/app"}>⚡ Gerar clips grátis</button>
          <button className="btn-sec" onClick={() => document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" })}>Ver planos</button>
        </div>
        <div className="stats">
          <div><div className="sn">12.847+</div><div className="sl">Clips gerados</div></div>
          <div><div className="sn">342+</div><div className="sl">Criadores ativos</div></div>
          <div><div className="sn">8.500+</div><div className="sl">Horas economizadas</div></div>
        </div>
      </div>

      <section className="animate" style={{ textAlign: "center" } as React.CSSProperties}>
        <div className="sec-badge">Entradas suportadas</div>
        <h2 className="sec-title">Seu vídeo entra de qualquer jeito</h2>
        <p className="sec-sub">Sem complicação. Sem depender de terceiros.</p>
        <div className="sources">
          {[
            { icon: "📁", title: "Upload direto", desc: "Arraste o arquivo MP4, MOV, MKV, AVI, WebM ou MP3 do seu PC.", badge: "Principal", cls: "src-main", card: "main" },
            { icon: "🔗", title: "Link direto", desc: "Cole um link do Google Drive, Dropbox ou qualquer CDN.", badge: "Recomendado", cls: "src-good", card: "" },
            { icon: "📱", title: "QR do Celular", desc: "Gera um QR no PC, escaneia com o celular e o vídeo vai direto ao projeto.", badge: "Diferencial ⭐", cls: "src-main", card: "main" },
            { icon: "🎙️", title: "RSS de Podcast", desc: "Cole o feed RSS do seu podcast e importe episódios diretamente.", badge: "Em breve", cls: "src-beta", card: "" },
          ].map((s, i) => (
            <div key={i} className={`source-card${s.card === "main" ? " main" : ""}`}>
              <div className="src-icon">{s.icon}</div>
              <div className="src-title">{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6, lineHeight: 1.6 }}>{s.desc}</div>
              <div className={`src-label ${s.cls}`}>{s.badge}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate" style={{ textAlign: "center" } as React.CSSProperties}>
        <div className="sec-badge">Features</div>
        <h2 className="sec-title">IA que trabalha por você</h2>
        <p className="sec-sub">Do vídeo bruto ao clip pronto para postar.</p>
        <div className="feats">
          {[
            { icon: "🤖", title: "AI Clipping", desc: "A IA analisa a transcrição e seleciona os melhores trechos automaticamente." },
            { icon: "🎤", title: "Legendas automáticas", desc: "Whisper AI gera VTT e SRT sincronizados. Vários estilos visuais: Minimalista, Hormozi, Neon, Bold." },
            { icon: "📱", title: "Crop 9:16", desc: "Enquadramento automático para TikTok, Reels e Shorts. Sem edição manual." },
            { icon: "📦", title: "Share Pack", desc: "Cada clip vem com legenda curta/longa, 3 hooks e 10 hashtags gerados por IA." },
            { icon: "📥", title: "Export em lote", desc: "Baixe todos os clips de uma vez com VTT e SRT inclusos." },
            { icon: "🗓️", title: "Agendamento", desc: "Publique ou agende direto para YouTube Shorts. Instagram/TikTok em breve." },
          ].map((f, i) => (
            <div key={i} className="feat">
              <div className="feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como" className="animate" style={{ textAlign: "center" } as React.CSSProperties}>
        <div className="sec-badge">Como funciona</div>
        <h2 className="sec-title">3 passos. Resultado imediato.</h2>
        <p className="sec-sub">Sem edição. Sem complicação.</p>
        <div className="steps">
          {[
            { n: "1", icon: "📤", t: "Envia o vídeo", d: "Upload do PC, link do Drive ou QR Code pelo celular. Suporta MP4, MOV, MKV e mais." },
            { n: "2", icon: "⚙️", t: "IA processa", d: "A IA corta nos melhores momentos, adiciona legenda e gera o copy para postar." },
            { n: "3", icon: "📥", t: "Baixa ou publica", d: "Clips prontos com legenda, VTT/SRT e Share Pack. Publique no YouTube ou baixe tudo." },
          ].map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{s.n}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precos" className="animate" style={{ textAlign: "center" } as React.CSSProperties}>
        <div className="sec-badge">Planos</div>
        <h2 className="sec-title">Simples e transparente</h2>
        <p className="sec-sub">Cancele quando quiser. Sem surpresas.</p>
        <div className="toggle-row">
          <span>Mensal</span>
          <label className="tog">
            <input type="checkbox" checked={ann} onChange={e => setAnn(e.target.checked)} />
            <div className="ts" />
          </label>
          <span>Anual</span>
          <span className="dpill">-20%</span>
        </div>
        <div className="plans">
          {[
            { name: "Free", price: "R$0", limit: "60 min/mês (1h)", feats: ["1 vídeo por mês", "AI Clipping básico", "Legenda automática", "Export 720p", "Marca d'água Klipora"], btn: "pb-out", cta: "Começar grátis", pop: false },
            { name: "Starter", price: `R$${disc(P.starter)}`, limit: "300 min/mês (5h)", feats: ["Tudo do Free", "Sem marca d'água", "Export 1080p", "Todos os estilos de legenda", "Share Pack completo"], btn: "pb-out", cta: "Assinar Starter", pop: false },
            { name: "Pro", price: `R$${disc(P.pro)}`, limit: "900 min/mês (15h)", feats: ["Tudo do Starter", "Bulk export", "Prioridade na fila", "Viral Score", "IA Copywriter completo"], btn: "pb-grad", cta: "Assinar Pro", pop: true },
            { name: "Agency", price: `R$${disc(P.agency)}`, limit: "2.400 min/mês (40h)", feats: ["Tudo do Pro", "Uso comercial", "Suporte WhatsApp", "Multi-contas", "Acesso antecipado a features"], btn: "pb-out", cta: "Assinar Agency", pop: false },
          ].map((p, i) => (
            <div key={i} className={`plan${p.pop ? " pop" : ""}`}>
              {p.pop && <div className="pop-tag">⭐ Mais popular</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}<sub>/mês</sub></div>
              <div className="plan-limit">{p.limit}</div>
              <ul className="plan-feats">{p.feats.map((f, j) => <li key={j}>{f}</li>)}</ul>
              <button className={`plan-btn ${p.btn}`} onClick={() => window.location.href = "/app"}>{p.cta}</button>
            </div>
          ))}
        </div>
        {ann && <p style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.35)" }}>*Preços no plano anual com 20% de desconto</p>}
      </section>

      <section id="faq" className="animate">
        <div style={{ textAlign: "center", marginBottom: 48 } as React.CSSProperties}>
          <div className="sec-badge">FAQ</div>
          <h2 className="sec-title">Perguntas frequentes</h2>
        </div>
        <div className="faq-wrap">
          {[
            { q: "Quais formatos de vídeo são suportados?", a: "MP4, MOV, MKV, AVI, WebM e MP3/M4A para podcasts. Upload direto do PC, link do Google Drive, Dropbox ou via QR Code pelo celular." },
            { q: "Como funciona o QR Code do celular?", a: "Clique em 'QR Celular' no app, escaneie o QR gerado com seu celular, selecione o vídeo da galeria e ele sobe direto para o projeto no PC — sem cabo, sem transferência manual." },
            { q: "Os clips ficam prontos para TikTok e Reels?", a: "Sim! Selecione formato 9:16 e o Klipora aplica crop automático. Você ainda pode escolher o estilo de legenda: Minimalista, Hormozi, Neon ou Bold." },
            { q: "O que é o Share Pack?", a: "É o pacote pronto para postar: legenda curta/média/longa gerada por IA, 3 hooks de impacto e 10 hashtags. Tudo copiável com 1 clique." },
            { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade e sem multa. Cancele a qualquer momento pelo painel." },
            { q: "Como funcionam os minutos do plano?", a: "São minutos de vídeo processado. 1 episódio de 60 min usa 60 minutos do seu saldo. O plano Free (60 min) cobre 1 episódio completo por mês." },
          ].map((f, i) => {
            const [open, setOpen] = useState(false);
            return (
              <div key={i} className="faq-item">
                <button className="faq-btn" onClick={() => setOpen(!open)}>
                  {f.q}<div className="faq-icon">{open ? "−" : "+"}</div>
                </button>
                <div className={`faq-ans${open ? " open" : ""}`}><p>{f.a}</p></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="animate" style={{ textAlign: "center", padding: "60px 5%" } as React.CSSProperties}>
        <div style={{ maxWidth: 540, margin: "0 auto", background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(192,38,211,.08))", border: "1px solid rgba(124,58,237,.3)", borderRadius: 28, padding: "48px 36px" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, letterSpacing: -1, marginBottom: 14 }}>Pronto para começar?</h2>
          <p style={{ color: "rgba(255,255,255,.5)", marginBottom: 28, lineHeight: 1.7 }}>Acesso gratuito. Sem cartão de crédito.</p>
          <button className="btn-main" style={{ padding: "16px 40px", fontSize: 16 }} onClick={() => window.location.href = "/app"}>⚡ Gerar meus primeiros clips</button>
        </div>
      </section>

      <footer>
        <div className="logo">KLIPORA</div>
        <div className="fl">
          <a href="/termos">Termos de uso</a>
          <a href="/privacidade">Privacidade</a>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>© 2026 Klipora. Todos os direitos reservados.</div>
      </footer>
    </>
  );
}