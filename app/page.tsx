"use client";
import { useState } from "react";
const P = { starter: 67, pro: 127, agency: 247 };
export default function Landing() {
  const [ann, setAnn] = useState(false);
  const disc = (n: number) => ann ? Math.round(n * 0.8) : n;
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#08080f;color:#fff;font-family:Inter,system-ui,sans-serif}
        .bar{background:linear-gradient(90deg,#7c3aed,#c026d3);padding:10px;text-align:center;font-size:13px;font-weight:600}
        nav{display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:64px;background:rgba(8,8,15,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;z-index:100}
        .logo{font-size:22px;font-weight:900;letter-spacing:2px;background:linear-gradient(90deg,#b57bee,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .nav-links{display:flex;gap:28px;list-style:none}
        .nav-links a{color:rgba(255,255,255,.5);text-decoration:none;font-size:14px}
        .nav-links a:hover{color:#fff}
        .btn-p{background:linear-gradient(135deg,#7c3aed,#c026d3);border:none;color:#fff;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}
        .hero{min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 5% 60px;background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(124,58,237,.15),transparent)}
        .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);color:#c4a0ff;font-size:12px;font-weight:600;padding:6px 16px;border-radius:100px;margin-bottom:28px}
        h1{font-size:clamp(40px,6vw,80px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;max-width:800px}
        .hl{background:linear-gradient(90deg,#9d6ffd,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sub{font-size:18px;color:rgba(255,255,255,.55);max-width:500px;line-height:1.8;margin:0 auto 40px}
        .btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:60px}
        .btn-sec{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);color:#fff;padding:14px 32px;border-radius:12px;font-size:15px;cursor:pointer}
        .btn-main{background:linear-gradient(135deg,#7c3aed,#c026d3);border:none;color:#fff;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 0 40px rgba(124,58,237,.4)}
        .stats{display:flex;gap:48px;flex-wrap:wrap;justify-content:center}
        .sn{font-size:36px;font-weight:900;background:linear-gradient(90deg,#9d6ffd,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sl{font-size:13px;color:rgba(255,255,255,.35);margin-top:4px}
        section{padding:80px 5%;max-width:1100px;margin:0 auto}
        .sec-badge{display:inline-block;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.3);color:#c4a0ff;font-size:12px;font-weight:600;padding:5px 14px;border-radius:100px;margin-bottom:16px}
        .sec-title{font-size:clamp(28px,4vw,46px);font-weight:900;letter-spacing:-1.5px;margin-bottom:12px}
        .sec-sub{color:rgba(255,255,255,.45);margin-bottom:48px;font-size:16px}
        .sources{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:0}
        .source-card{padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
        .source-card.main{border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.08)}
        .src-icon{font-size:28px;margin-bottom:12px}
        .src-title{font-weight:700;margin-bottom:4px}
        .src-label{font-size:12px;margin-top:8px;padding:3px 10px;border-radius:100px;display:inline-block}
        .src-main{background:rgba(124,58,237,.2);color:#c4a0ff}
        .src-good{background:rgba(34,197,94,.15);color:#4ade80}
        .src-beta{background:rgba(245,158,11,.12);color:#fbbf24}
        .feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
        .feat{padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03)}
        .feat-icon{font-size:32px;margin-bottom:14px}
        .feat h3{font-size:18px;font-weight:700;margin-bottom:8px}
        .feat p{font-size:14px;color:rgba(255,255,255,.5);line-height:1.7}
        .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
        .step{padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);text-align:center}
        .step-num{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#c026d3);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;margin:0 auto 16px}
        .step h3{font-weight:700;margin-bottom:8px}
        .step p{font-size:14px;color:rgba(255,255,255,.5);line-height:1.7}
        .toggle-row{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:40px;font-size:14px}
        .tog{position:relative;width:44px;height:24px}
        .tog input{opacity:0;width:0;height:0;position:absolute}
        .ts{position:absolute;inset:0;background:rgba(255,255,255,.1);border-radius:100px;cursor:pointer;transition:.3s}
        .ts::before{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;bottom:3px;left:3px;transition:.3s}
        .tog input:checked+.ts{background:linear-gradient(135deg,#7c3aed,#c026d3)}
        .tog input:checked+.ts::before{transform:translateX(20px)}
        .dpill{background:rgba(124,58,237,.2);color:#c4a0ff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px}
        .plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
        .plan{padding:28px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);position:relative}
        .plan.pop{border:2px solid #7c3aed;box-shadow:0 0 50px rgba(124,58,237,.2)}
        .pop-tag{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-size:12px;font-weight:700;padding:4px 18px;border-radius:100px;white-space:nowrap}
        .plan-name{font-size:12px;font-weight:600;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
        .plan-price{font-size:44px;font-weight:900;letter-spacing:-2px;margin-bottom:4px}
        .plan-price sub{font-size:15px;font-weight:400;color:rgba(255,255,255,.35)}
        .plan-limit{font-size:13px;color:rgba(255,255,255,.4);margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.06)}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
        .plan-feats li{font-size:13px;color:rgba(255,255,255,.6);display:flex;gap:8px}
        .plan-feats li::before{content:'✓';color:#a78bfa;font-weight:700;flex-shrink:0}
        .plan-btn{width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none}
        .pb-out{background:transparent;border:1px solid rgba(255,255,255,.2);color:#fff}
        .pb-grad{background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff}
        .faq-wrap{max-width:720px;margin:0 auto}
        .faq-item{border-bottom:1px solid rgba(255,255,255,.07)}
        .faq-btn{width:100%;background:none;border:none;color:#fff;font-size:15px;font-weight:600;padding:20px 0;text-align:left;cursor:pointer;display:flex;justify-content:space-between;gap:12px}
        .faq-icon{width:26px;height:26px;border-radius:50%;background:rgba(124,58,237,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;transition:.3s}
        .faq-ans{max-height:0;overflow:hidden;transition:max-height .4s ease}
        .faq-ans.open{max-height:160px}
        .faq-ans p{font-size:14px;color:rgba(255,255,255,.5);line-height:1.8;padding-bottom:18px}
        footer{border-top:1px solid rgba(255,255,255,.06);padding:36px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
        .fl{display:flex;gap:20px}
        .fl a{color:rgba(255,255,255,.35);text-decoration:none;font-size:13px}
        @media(max-width:768px){.nav-links,.nav-links+*{display:none}.stats{gap:28px}.plans,.feats,.steps,.sources{grid-template-columns:1fr}footer{flex-direction:column;text-align:center}}
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

      <div className="hero">
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

      <section style={{ textAlign: "center" } as React.CSSProperties}>
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

      <section style={{ textAlign: "center" } as React.CSSProperties}>
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

      <section id="como" style={{ textAlign: "center" } as React.CSSProperties}>
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

      <section id="precos" style={{ textAlign: "center" } as React.CSSProperties}>
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

      <section id="faq">
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

      <section style={{ textAlign: "center", padding: "60px 5%" } as React.CSSProperties}>
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