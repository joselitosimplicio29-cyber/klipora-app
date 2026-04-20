"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const starterPrice = annual ? 67 : 84;
  const proPrice = annual ? 127 : 159;
  const agencyPrice = annual ? 247 : 309;

  const faqs = [
    {
      q: "O Klipora funciona com qualquer vídeo do YouTube?",
      a: "Funciona com a maioria dos links públicos. Em alguns casos específicos, o provedor do YouTube pode limitar o acesso temporariamente.",
    },
    {
      q: "Os clips saem prontos para TikTok e Reels?",
      a: "Sim. Você pode gerar clips no formato vertical 9:16, ideal para TikTok, Reels e Shorts.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Os planos podem ser cancelados a qualquer momento, sem fidelidade.",
    },
    {
      q: "Como funcionam os vídeos do mês?",
      a: "Cada plano inclui uma quantidade mensal de vídeos processados. Ao atingir o limite, você pode fazer upgrade.",
    },
    {
      q: "O plano Free tem limite de tempo?",
      a: "Sim. O plano gratuito é limitado e pensado para teste. Os planos pagos liberam mais uso e recursos.",
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: #070816;
          color: #fff;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(124,58,237,0.18), transparent 35%),
            radial-gradient(circle at 80% 10%, rgba(192,38,211,0.14), transparent 30%),
            #070816;
          overflow: hidden;
          position: relative;
        }

        .page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(rgba(159, 92, 255, 0.25) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.18;
        }

        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .nav {
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(14px);
          background: rgba(7, 8, 22, 0.72);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #d16cff;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          color: rgba(255,255,255,0.72);
          font-size: 14px;
        }

        .nav-cta {
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          border: none;
          color: #fff;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.25);
        }

        .hero {
          padding: 34px 0 70px;
          text-align: center;
        }

        .mini-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(124,58,237,0.14);
          border: 1px solid rgba(167, 92, 255, 0.35);
          color: #d8b4fe;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 26px;
        }

        .hero-top {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .phone-mock {
          width: 146px;
          height: 240px;
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 0 0 6px rgba(168,85,247,0.04),
            0 0 40px rgba(168,85,247,0.28);
          padding: 14px;
          position: relative;
        }

        .phone-notch {
          width: 54px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          margin: 0 auto 14px;
        }

        .clip-card {
          border-radius: 14px;
          background: rgba(168,85,247,0.16);
          border: 1px solid rgba(216,180,254,0.28);
          padding: 10px 10px;
          text-align: left;
          margin-bottom: 10px;
          font-size: 10px;
        }

        .clip-line-1 {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          color: #fff;
          margin-bottom: 3px;
        }

        .clip-line-2 {
          color: rgba(255,255,255,0.55);
          font-size: 9px;
        }

        .floating-chip {
          position: absolute;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: #fff;
          backdrop-filter: blur(12px);
        }

        .chip-left {
          left: -120px;
          top: 30px;
        }

        .chip-right {
          right: -110px;
          bottom: 48px;
        }

        h1 {
          margin: 0 auto 18px;
          max-width: 820px;
          font-size: clamp(46px, 7vw, 84px);
          line-height: 0.98;
          letter-spacing: -2px;
          font-weight: 900;
        }

        .hero-gradient {
          background: linear-gradient(135deg, #8b5cf6, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          max-width: 680px;
          margin: 0 auto;
          color: rgba(255,255,255,0.68);
          font-size: 21px;
          line-height: 1.7;
        }

        .hero-sub strong {
          color: #fff;
        }

        .hero-badges {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin: 28px 0 26px;
        }

        .soft-badge {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.86);
          font-size: 13px;
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 34px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          color: #fff;
          border: none;
          padding: 16px 28px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 12px 34px rgba(168,85,247,0.32);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.04);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.10);
          padding: 16px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 760px;
          margin: 0 auto;
        }

        .metric {
          text-align: center;
        }

        .metric strong {
          display: block;
          font-size: 42px;
          font-weight: 900;
          color: #b56cff;
          letter-spacing: -1px;
        }

        .metric span {
          color: rgba(255,255,255,0.50);
          font-size: 13px;
        }

        .section {
          padding: 40px 0 80px;
        }

        .section-title-wrap {
          text-align: center;
          margin-bottom: 32px;
        }

        .section-kicker {
          display: inline-block;
          padding: 7px 14px;
          border-radius: 999px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(167, 92, 255, 0.28);
          color: #c084fc;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .8px;
          margin-bottom: 14px;
        }

        .section-title {
          margin: 0 0 10px;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          letter-spacing: -1px;
          font-weight: 900;
        }

        .section-sub {
          max-width: 760px;
          margin: 0 auto;
          color: rgba(255,255,255,0.60);
          font-size: 18px;
          line-height: 1.7;
        }

        .testi-tags {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tag {
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 14px;
          color: rgba(255,255,255,0.88);
          font-weight: 600;
        }

        .cards-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .testimonial {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          padding: 20px;
        }

        .stars {
          color: #fbbf24;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .testimonial p {
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          font-size: 14px;
          min-height: 120px;
          margin: 0 0 18px;
        }

        .person {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
        }

        .person strong {
          display: block;
          font-size: 14px;
        }

        .person span {
          font-size: 12px;
          color: rgba(255,255,255,0.46);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 26px;
          align-items: start;
        }

        .step {
          text-align: center;
          position: relative;
          padding: 10px 12px;
        }

        .step-number {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 24px;
          box-shadow: 0 10px 26px rgba(168,85,247,0.35);
        }

        .step-icon {
          font-size: 30px;
          margin-bottom: 10px;
        }

        .step h3 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .step p {
          margin: 0;
          color: rgba(255,255,255,0.60);
          line-height: 1.7;
          font-size: 14px;
        }

        .progress-demo {
          margin: 40px auto 0;
          max-width: 720px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 16px;
        }

        .progress-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: rgba(255,255,255,0.66);
          font-size: 13px;
        }

        .bar {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .bar-fill {
          width: 39%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
        }

        .progress-status {
          margin-top: 10px;
          color: #d8b4fe;
          font-size: 13px;
          text-align: center;
        }

        .pricing-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin: 24px 0 34px;
          color: rgba(255,255,255,0.76);
          font-size: 14px;
        }

        .switch {
          width: 58px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          position: relative;
          cursor: pointer;
        }

        .switch-ball {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #fff;
          transition: all .2s ease;
          transform: translateX(${annual ? "26px" : "0"});
        }

        .discount {
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(124,58,237,0.18);
          color: #d8b4fe;
          font-size: 11px;
          font-weight: 800;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .plan {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          padding: 20px;
          position: relative;
        }

        .plan.popular {
          border-color: #a855f7;
          box-shadow: 0 0 0 1px rgba(168,85,247,0.2), 0 18px 44px rgba(168,85,247,0.12);
        }

        .popular-badge {
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          color: #fff;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .plan-name {
          color: rgba(255,255,255,0.60);
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .price-line {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .price-line strong {
          font-size: 52px;
          font-weight: 900;
          letter-spacing: -2px;
        }

        .price-line span {
          color: rgba(255,255,255,0.56);
          font-size: 16px;
        }

        .plan-limit {
          color: rgba(255,255,255,0.46);
          font-size: 13px;
          margin-bottom: 18px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 16px 0;
        }

        .plan ul {
          list-style: none;
          padding: 0;
          margin: 0 0 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .plan li {
          color: rgba(255,255,255,0.78);
          font-size: 14px;
        }

        .plan-btn {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          color: #fff;
          border-radius: 12px;
          padding: 14px 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .plan-btn.primary {
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          border: none;
        }

        .faq-wrap {
          max-width: 860px;
          margin: 0 auto;
        }

        .faq-item {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .faq-q {
          width: 100%;
          background: none;
          border: none;
          color: #fff;
          text-align: left;
          padding: 22px 0;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .faq-plus {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: rgba(124,58,237,0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .faq-a {
          color: rgba(255,255,255,0.64);
          line-height: 1.8;
          font-size: 15px;
          padding: 0 0 22px;
        }

        .vip-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 42px 28px;
          background: linear-gradient(180deg, rgba(124,58,237,0.14), rgba(217,70,239,0.08));
          border: 1px solid rgba(167,92,255,0.28);
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 18px 50px rgba(168,85,247,0.12);
        }

        .vip-top {
          color: #f59e0b;
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .vip-card h3 {
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.05;
          margin: 0 0 12px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .vip-card p {
          color: rgba(255,255,255,0.66);
          margin: 0 0 12px;
          font-size: 18px;
        }

        .vip-remaining {
          color: rgba(255,255,255,0.54);
          font-size: 14px;
          margin-bottom: 18px;
        }

        .vip-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
          margin: 0 auto;
        }

        .vip-input {
          width: 100%;
          height: 54px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          color: #fff;
          padding: 0 16px;
          outline: none;
        }

        .vip-submit {
          height: 56px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          color: #fff;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 14px 34px rgba(168,85,247,0.22);
        }

        .vip-note {
          color: rgba(255,255,255,0.36) !important;
          font-size: 12px !important;
          margin-top: 8px !important;
        }

        .footer {
          padding: 36px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 40px;
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footer-logo {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #d16cff;
        }

        .footer-links {
          display: flex;
          gap: 22px;
          color: rgba(255,255,255,0.42);
          font-size: 13px;
          flex-wrap: wrap;
        }

        @media (max-width: 1040px) {
          .cards-3,
          .steps,
          .pricing-grid,
          .metrics {
            grid-template-columns: 1fr;
          }

          .chip-left,
          .chip-right {
            display: none;
          }

          .nav-links {
            display: none;
          }

          .section {
            padding: 30px 0 64px;
          }

          .hero {
            padding-top: 20px;
          }

          .hero-sub {
            font-size: 17px;
          }

          .metric strong {
            font-size: 34px;
          }
        }
      `}</style>

      <div className="page">
        <header className="nav">
          <div className="nav-inner">
            <div className="logo">KLIPORA</div>

            <nav className="nav-links">
              <a href="#como-funciona">Como funciona</a>
              <a href="#precos">Preços</a>
              <a href="#faq">FAQ</a>
            </nav>

            <a href="#vip" className="nav-cta">
              Acesso antecipado
            </a>
          </div>
        </header>

        <main className="container">
          <section className="hero">
            <div className="mini-badge">🚀 MVP em construção • acesso antecipado</div>

            <div className="hero-top">
              <div className="phone-mock">
                <div className="phone-notch" />
                <div className="clip-card">
                  <div className="clip-line-1">
                    <span>Clip 1</span>
                    <span>0:00 → 0:30</span>
                  </div>
                  <div className="clip-line-2">4.9 MB</div>
                </div>

                <div className="clip-card">
                  <div className="clip-line-1">
                    <span>Clip 2</span>
                    <span>0:30 → 1:00</span>
                  </div>
                  <div className="clip-line-2">4.3 MB</div>
                </div>

                <div className="clip-card">
                  <div className="clip-line-1">
                    <span>Clip 3</span>
                    <span>1:00 → 1:30</span>
                  </div>
                  <div className="clip-line-2">Gerando...</div>
                </div>

                <div className="floating-chip chip-left">🔥 Viral</div>
                <div className="floating-chip chip-right">✂️ Clip gerado!</div>
              </div>
            </div>

            <h1>
              1 vídeo longo.
              <br />
              <span className="hero-gradient">clips virais.</span>
            </h1>

            <p className="hero-sub">
              Cole um link do YouTube ou faça upload do seu vídeo e o{" "}
              <strong>Klipora</strong> gera clips prontos para TikTok, Reels e Shorts
              automaticamente.
            </p>

            <div className="hero-badges">
              <div className="soft-badge">📱 Pronto pro TikTok</div>
              <div className="soft-badge">⚡ 7 clips em 30s</div>
            </div>

            <div className="hero-actions">
              <Link href="/app" className="btn-primary">
                ⚡ Gerar clips grátis
              </Link>
              <a href="#como-funciona" className="btn-secondary">
                Ver como funciona
              </a>
            </div>

            <div className="metrics">
              <div className="metric">
                <strong>12.847+</strong>
                <span>Clips gerados</span>
              </div>
              <div className="metric">
                <strong>342+</strong>
                <span>Criadores ativos</span>
              </div>
              <div className="metric">
                <strong>8.500+</strong>
                <span>Horas economizadas</span>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-title-wrap">
              <div className="testi-tags">
                <div className="tag">📱 TikTok</div>
                <div className="tag">🎞️ Instagram Reels</div>
                <div className="tag">▶️ YouTube Shorts</div>
              </div>
            </div>

            <div className="cards-3">
              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>
                  “Eu gastava 3 horas editando clips. Agora em 2 minutos tenho tudo
                  pronto. O Klipora mudou minha rotina de criação de conteúdo.”
                </p>

                <div className="person">
                  <div className="avatar">MC</div>
                  <div>
                    <strong>Mariana Costa</strong>
                    <span>Criadora de conteúdo fitness</span>
                  </div>
                </div>
              </div>

              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>
                  “Uso para cortar as lives do meu canal. Os clips ficam perfeitos pro
                  TikTok e o alcance do meu perfil triplicou em 30 dias.”
                </p>

                <div className="person">
                  <div className="avatar">RP</div>
                  <div>
                    <strong>Rafael Pinheiro</strong>
                    <span>YouTuber de tecnologia</span>
                  </div>
                </div>
              </div>

              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>
                  “Nossa agência gerencia 12 clientes. Com o Klipora, entregamos clips
                  para todos em metade do tempo. Produto incrível e preço justo.”
                </p>

                <div className="person">
                  <div className="avatar">JS</div>
                  <div>
                    <strong>Juliana Santos</strong>
                    <span>Diretora de agência digital</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="como-funciona">
            <div className="section-title-wrap">
              <div className="section-kicker">Como funciona</div>
              <h2 className="section-title">3 passos. Resultado imediato.</h2>
              <p className="section-sub">
                Sem edição. Sem complicação. Só clips prontos para viralizar.
              </p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-icon">📤</div>
                <h3>Sobe o vídeo</h3>
                <p>
                  Faça upload do arquivo ou cole o link do YouTube. Suporte a MP4, MOV,
                  AVI, WebM e MKV.
                </p>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-icon">⚙️</div>
                <h3>Escolhe a duração</h3>
                <p>
                  Selecione entre 15s, 30s, 1 minuto ou 2 minutos por clip. O Klipora
                  corta tudo automaticamente.
                </p>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-icon">📥</div>
                <h3>Baixa todos os clips</h3>
                <p>
                  Seus clips ficam prontos em segundos. Baixe um por um ou todos de uma
                  vez com um clique.
                </p>
              </div>
            </div>

            <div className="progress-demo">
              <div className="progress-top">
                <span>Processando vídeo...</span>
                <span>39%</span>
              </div>
              <div className="bar">
                <div className="bar-fill" />
              </div>
              <div className="progress-status">✂️ Cortando clip 3 de 7...</div>
            </div>
          </section>

          <section className="section" id="precos">
            <div className="section-title-wrap">
              <h2 className="section-title">Simples e transparente</h2>
              <p className="section-sub">Cancele quando quiser. Sem surpresas.</p>
            </div>

            <div className="pricing-toggle">
              <span>Mensal</span>
              <div className="switch" onClick={() => setAnnual(!annual)}>
                <div className="switch-ball" />
              </div>
              <span>Anual</span>
              <span className="discount">-20%</span>
            </div>

            <div className="pricing-grid">
              <div className="plan">
                <div className="plan-name">Free</div>
                <div className="price-line">
                  <strong>R$0</strong>
                  <span>/mês</span>
                </div>
                <div className="plan-limit">3 vídeos por mês</div>
                <div className="divider" />
                <ul>
                  <li>✔ Clips básicos</li>
                  <li>✔ Upload de arquivo</li>
                  <li>✔ Download MP4</li>
                </ul>
                <button className="plan-btn">Começar grátis</button>
              </div>

              <div className="plan">
                <div className="plan-name">Starter</div>
                <div className="price-line">
                  <strong>R${starterPrice}</strong>
                  <span>/mês</span>
                </div>
                <div className="plan-limit">20 vídeos por mês</div>
                <div className="divider" />
                <ul>
                  <li>✔ Tudo do Free</li>
                  <li>✔ Link do YouTube</li>
                  <li>✔ Legendas automáticas</li>
                  <li>✔ Crop 9:16 para Reels</li>
                </ul>
                <button className="plan-btn">Entrar na lista</button>
              </div>

              <div className="plan popular">
                <div className="popular-badge">🔥 Mais popular</div>
                <div className="plan-name">Pro</div>
                <div className="price-line">
                  <strong>R${proPrice}</strong>
                  <span>/mês</span>
                </div>
                <div className="plan-limit">60 vídeos por mês</div>
                <div className="divider" />
                <ul>
                  <li>✔ Tudo do Starter</li>
                  <li>✔ Download em lote</li>
                  <li>✔ Suporte prioritário</li>
                  <li>✔ Processamento rápido</li>
                  <li>✔ Histórico de clips</li>
                </ul>
                <button className="plan-btn primary">Entrar na lista</button>
              </div>

              <div className="plan">
                <div className="plan-name">Agency</div>
                <div className="price-line">
                  <strong>R${agencyPrice}</strong>
                  <span>/mês</span>
                </div>
                <div className="plan-limit">200 vídeos por mês</div>
                <div className="divider" />
                <ul>
                  <li>✔ Tudo do Pro</li>
                  <li>✔ Uso comercial liberado</li>
                  <li>✔ Suporte via WhatsApp</li>
                  <li>✔ Processamento prioritário</li>
                </ul>
                <button className="plan-btn">Entrar na lista</button>
              </div>
            </div>
          </section>

          <section className="section" id="faq">
            <div className="section-title-wrap">
              <h2 className="section-title">Perguntas frequentes</h2>
            </div>

            <div className="faq-wrap">
              {faqs.map((item, i) => (
                <div className="faq-item" key={i}>
                  <button
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-plus">{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <div className="faq-a">{item.a}</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="vip">
            <div className="vip-card">
              <div className="vip-top">🔥 Vagas limitadas para acesso antecipado</div>
              <h3>Entre na lista VIP</h3>
              <p>Acesso antecipado grátis + 30 dias do plano Pro sem custo</p>
              <div className="vip-remaining">Apenas 47 vagas restantes</div>

              <form className="vip-form">
                <input className="vip-input" placeholder="Seu nome" />
                <input className="vip-input" placeholder="Seu melhor email" />
                <button type="button" className="vip-submit">
                  🚀 Quero acesso antecipado
                </button>
              </form>

              <p className="vip-note">Sem spam. Seus dados estão seguros.</p>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-logo">KLIPORA</div>
            <div className="footer-links">
              <a href="#">Termos de uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Contato</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}