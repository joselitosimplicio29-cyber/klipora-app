"use client";

import Link from "next/link";
import { useState, ChangeEvent } from "react";

export default function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // --- LÓGICA DE UPLOAD (SUPER AGENTE) ---
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return alert("Selecione um vídeo primeiro!");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    try {
      const response = await fetch("/api/process-video", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success) {
        setVideoUrl(data.url);
        alert("Upload concluído com sucesso!");
      }
    } catch (error) {
      alert("Erro na conexão.");
    } finally {
      setUploading(false);
    }
  };

  const starterPrice = annual ? 67 : 84;
  const proPrice = annual ? 127 : 159;
  const agencyPrice = annual ? 247 : 309;

  const faqs = [
    { q: "O Klipora funciona com qualquer vídeo do YouTube?", a: "Funciona com a maioria dos links públicos." },
    { q: "Os clips saem prontos para TikTok e Reels?", a: "Sim. Você pode gerar clips no formato vertical 9:16." },
    { q: "Posso cancelar quando quiser?", a: "Sim. Os planos podem ser cancelados a qualquer momento." },
    { q: "Como funcionam os vídeos do mês?", a: "Cada plano inclui uma quantidade mensal." },
    { q: "O plano Free tem limite de tempo?", a: "Sim. O plano gratuito é limitado e pensado para teste." },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #070816; color: #fff; }
        a { color: inherit; text-decoration: none; }
        .page { min-height: 100vh; background: radial-gradient(circle at 20% 0%, rgba(124,58,237,0.18), transparent 35%), radial-gradient(circle at 80% 10%, rgba(192,38,211,0.14), transparent 30%), #070816; overflow: hidden; position: relative; }
        .page::before { content: ""; position: fixed; inset: 0; pointer-events: none; background-image: radial-gradient(rgba(159, 92, 255, 0.25) 1px, transparent 1px); background-size: 32px 32px; opacity: 0.18; }
        .container { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 1; }
        .nav { height: 78px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 30; backdrop-filter: blur(14px); background: rgba(7, 8, 22, 0.72); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-inner { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #d16cff; }
        .nav-cta { background: linear-gradient(135deg, #7c3aed, #d946ef); border: none; color: #fff; padding: 12px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; }
        .hero { padding: 34px 0 70px; text-align: center; }
        .mini-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: rgba(124,58,237,0.14); border: 1px solid rgba(167, 92, 255, 0.35); color: #d8b4fe; font-size: 12px; font-weight: 700; margin-bottom: 26px; }
        .phone-mock { width: 146px; height: 240px; border-radius: 26px; background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)); border: 1px solid rgba(255,255,255,0.10); box-shadow: 0 0 40px rgba(168,85,247,0.28); padding: 14px; position: relative; margin: 0 auto 20px; }
        .floating-chip { position: absolute; padding: 6px 12px; border-radius: 999px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); color: #fff; backdrop-filter: blur(12px); }
        .chip-left { left: -120px; top: 30px; } .chip-right { right: -110px; bottom: 48px; }
        h1 { font-size: clamp(46px, 7vw, 84px); line-height: 0.98; font-weight: 900; margin-bottom: 18px; letter-spacing: -2px; }
        .hero-gradient { background: linear-gradient(135deg, #8b5cf6, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #d946ef); border: none; color: #fff; padding: 16px 28px; border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 12px 34px rgba(168,85,247,0.32); }
        .pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .plan { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; padding: 20px; }
        .plan.popular { border-color: #a855f7; box-shadow: 0 18px 44px rgba(168,85,247,0.12); }
        .faq-q { width: 100%; background: none; border: none; color: #fff; text-align: left; padding: 22px 0; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); }
      `}} />

      <div className="page">
        <header className="nav">
          <div className="nav-inner">
            <div className="logo">KLIPORA</div>
            <button className="nav-cta">Acesso antecipado</button>
          </div>
        </header>

        <main className="container">
          <section className="hero">
            <div className="mini-badge">🚀 MVP em construção • acesso antecipado</div>
            <div className="phone-mock">
              <div style={{ width: '54px', height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', margin: '0 auto 14px' }}></div>
              <div style={{ background: 'rgba(168,85,247,0.16)', borderRadius: '10px', height: '40px', marginBottom: '10px' }}></div>
              <div style={{ background: 'rgba(168,85,247,0.16)', borderRadius: '10px', height: '40px' }}></div>
              <div className="floating-chip chip-left">🔥 Viral</div>
              <div className="floating-chip chip-right">✂️ Clip gerado!</div>
            </div>

            <h1>1 vídeo longo.<br /><span className="hero-gradient">clips virais.</span></h1>
            
            {/* INPUT DE UPLOAD INTEGRADO SEM QUEBRAR O DESIGN */}
            <div style={{ maxWidth: '500px', margin: '30px auto', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input type="file" onChange={handleFileChange} style={{ marginBottom: '15px', width: '100%' }} />
              <button onClick={handleUpload} disabled={uploading} className="btn-primary" style={{ width: '100%' }}>
                {uploading ? "SUBINDO..." : "⚡ GERAR CLIPS GRÁTIS"}
              </button>
              {videoUrl && <p style={{ marginTop: '10px', color: '#4ade80' }}>✅ Link: <a href={videoUrl} target="_blank" style={{ color: '#fff' }}>Ver vídeo</a></p>}
            </div>
          </section>

          {/* SESSÃO DE PREÇOS ORIGINAL */}
          <section id="precos" style={{ padding: '80px 0' }}>
            <h2 style={{ textAlign: 'center', fontSize: '48px', marginBottom: '40px' }}>Preços</h2>
            <div className="pricing-grid">
              <div className="plan"><h3>Free</h3><p>R$0</p></div>
              <div className="plan"><h3>Starter</h3><p>R${starterPrice}</p></div>
              <div className="plan popular"><h3>Pro</h3><p>R${proPrice}</p></div>
              <div className="plan"><h3>Agency</h3><p>R${agencyPrice}</p></div>
            </div>
          </section>
          
          {/* FAQ ORIGINAL */}
          <section style={{ padding: '80px 0' }}>
            <h2 style={{ textAlign: 'center' }}>FAQ</h2>
            {faqs.map((f, i) => (
              <button key={i} className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q} <span>{openFaq === i ? "−" : "+"}</span>
              </button>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}