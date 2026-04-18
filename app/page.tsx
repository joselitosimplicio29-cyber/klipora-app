"use client";

import { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import ResultsScreen from "./components/ResultsScreen";

export default function Home() {
  const [step, setStep] = useState<"landing" | "loading" | "results">("landing");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) return;

    // Muda pra tela de loading
    setStep("loading");

    try {
      // Salva o email no Supabase via API
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      // Se deu erro, volta pra tela inicial
      if (!response.ok) {
        setError(data.error || "Erro ao processar sua inscrição");
        setStep("landing");
        return;
      }

      // Aguarda um pouco pra mostrar o loading bonito
      setTimeout(() => {
        setStep("results");
      }, 2000);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar. Tente novamente.");
      setStep("landing");
    }
  }

  if (step === "loading") {
    return <LoadingScreen />;
  }

  if (step === "results") {
    return <ResultsScreen onRestart={() => setStep("landing")} />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-white px-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Transforme seus vídeos em clips virais
        </h1>

        <p className="text-gray-300 mb-8">
          Cole o link ou envie seu vídeo e receba cortes prontos para TikTok, Reels e Shorts.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            placeholder="Seu melhor email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Gerar
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-400 mt-4">
            ⚠️ {error}
          </p>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Sem spam. Acesso antecipado para os primeiros usuários.
        </p>
      </div>
    </main>
  );
}