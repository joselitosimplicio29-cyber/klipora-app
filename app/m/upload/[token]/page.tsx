"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function MobileUploadPage() {
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setProgress(10);

    const form = new FormData();
    form.append("video", file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
      };

      await new Promise<void>((resolve, reject) => {
        xhr.open("POST", `/api/mobile-upload/upload/${token}`);
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error(`HTTP ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Erro de rede"));
        xhr.send(form);
      });

      setProgress(100);
      setStatus("done");
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, background: "linear-gradient(90deg,#b57bee,#e040fb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 32 }}>
        KLIPORA
      </div>

      {status === "idle" && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, textAlign: "center", width: "100%", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Enviar vídeo</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Selecione o vídeo da galeria do celular.<br />Ele será enviado direto para o projeto.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg,#7c3aed,#c026d3)", border: "none", borderRadius: 14, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
          >
            🎬 Selecionar vídeo
          </button>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 16 }}>
            Suporta MP4, MOV, MKV, AVI e WebM
          </p>
        </div>
      )}

      {status === "uploading" && (
        <div style={{ textAlign: "center", width: "100%", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⬆️</div>
          <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Enviando... {progress}%</h2>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#7c3aed,#c026d3)", borderRadius: 100, transition: "width 0.3s" }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 16 }}>Não feche essa página</p>
        </div>
      )}

      {status === "done" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Vídeo enviado!</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
            Volte para o computador para<br />continuar o processamento.
          </p>
        </div>
      )}

      {status === "error" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ marginBottom: 8 }}>Erro no envio</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>{error}</p>
          <button onClick={() => setStatus("idle")} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", cursor: "pointer" }}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
