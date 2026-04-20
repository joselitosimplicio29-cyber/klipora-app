"use client";

import Link from "next/link";

export default function Landing() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: #0b0b17;
          color: #fff;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 0%, rgba(124,58,237,0.25), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(192,38,211,0.2), transparent 40%),
            #0b0b17;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        /* NAV */
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 80px;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #d38bff;
        }

        .nav-btn {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          text-decoration: none;
          color: white;
        }

        /* HERO */
        .hero {
          text-align: center;
          margin-bottom: 100px;
        }

        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(124,58,237,0.2);
          border: 1px solid #7c3aed;
          font-size: 12px;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 48px;
          line-height: 1.2;
          margin-bottom: 20px;
        }

        .highlight {
          background: linear-gradient(90deg, #7c3aed, #c026d3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sub {
          color: rgba(255,255,255,0.6);
          max-width: 600px;
          margin: 0 auto 30px;
          font-size: 16px;
        }

        .cta {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #c026d3);
          border: none;
          padding: 14px 22px;
          border-radius: 12px;
          font-weight: 600;
          color: white;
          text-decoration: none;
        }

        .btn-secondary {
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 22px;
          border-radius: 12px;
          text-decoration: none;
          color: white;
        }

        /* FEATURES */
        .features {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
          margin-bottom: 100px;
        }

        .feature {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
        }

        .feature h3 {
          margin-bottom: 10px;
        }

        .feature p {
          color: rgba(255,255,255,0.6);
          font-size: 14px;
        }

        /* FINAL CTA */
        .final {
          text-align: center;
          padding: 60px;
          border-radius: 20px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.3);
        }

        @media(max-width: 900px){
          .features {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 34px;
          }
        }
      `}</style>

      <div className="page">
        <div className="container">

          {/* NAV */}
          <div className="nav">
            <div className="logo">KLIPORA</div>
            <Link href="/app" className="nav-btn">
              Entrar
            </Link>
          </div>

          {/* HERO */}
          <div className="hero">
            <div className="badge">🚀 Ferramenta de Clips Automáticos</div>

            <h1>
              Transforme vídeos em <br />
              <span className="highlight">clips virais automaticamente</span>
            </h1>

            <p className="sub">
              Cole um link do YouTube ou envie um vídeo e gere cortes prontos para TikTok,
              Reels e Shorts em segundos.
            </p>

            <div className="cta">
              <Link href="/app" className="btn-primary">
                ⚡ Gerar clips agora
              </Link>

              <a href="#features" className="btn-secondary">
                Ver como funciona
              </a>
            </div>
          </div>

          {/* FEATURES */}
          <div id="features" className="features">

            <div className="feature">
              <h3>⚡ Automático</h3>
              <p>
                Gere múltiplos clips automaticamente sem precisar editar manualmente.
              </p>
            </div>

            <div className="feature">
              <h3>📱 Formato 9:16</h3>
              <p>
                Pronto para TikTok, Reels e Shorts com corte automático vertical.
              </p>
            </div>

            <div className="feature">
              <h3>🎬 Upload ou YouTube</h3>
              <p>
                Use vídeos do seu computador ou direto do YouTube com um clique.
              </p>
            </div>

          </div>

          {/* FINAL CTA */}
          <div className="final">
            <h2 style={{marginBottom:20}}>
              Comece agora grátis
            </h2>

            <Link href="/app" className="btn-primary">
              🚀 Testar grátis
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}