"use client";

import { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import ResultsScreen from "./components/ResultsScreen";

export default function Home() {
  const [step, setStep] = useState<"landing" | "loading" | "results">("landing");
  const [email, setEmail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [videoMessage, setVideoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoSubmitting, setIsVideoSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao processar sua inscrição");
        setIsSubmitting(false);
        return;
      }

      setSuccess("✅ Tudo certo! Te mandamos um email de confirmação.");
      setIsSubmitting(false);

      setTimeout(() => {
        setStep("loading");
        setTimeout(() => setStep("results"), 2000);
      }, 1500);
    } catch {
      setError("Erro ao conectar. Tente novamente.");
      setIsSubmitting(false);
    }
  }

  async function handleVideoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVideoMessage("");

    if (!videoUrl.trim()) {
      setVideoMessage("⚠️ Cole um link do YouTube para testar.");
      return;
    }

    setIsVideoSubmitting(true);

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVideoMessage(`⚠️ ${data.error || "Erro ao enviar vídeo."}`);
        setIsVideoSubmitting(false);
        return;
      }

      setVideoMessage("✅ Vídeo enviado para processamento com sucesso!");
      setVideoUrl("");
      setIsVideoSubmitting(false);
    } catch {
      setVideoMessage("⚠️ Erro ao conectar com a API de vídeo.");
      setIsVideoSubmitting(false);
    }
  }

  if (step === "loading") return <LoadingScreen />;
  if (step === "results")
    return (
      <ResultsScreen
        onRestart={() => {
          setStep("landing");
          setEmail("");
          setSuccess("");
        }}
      />
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#problema" className="hover:text-white transition">
              Problema
            </a>
            <a href="#solucao" className="hover:text-white transition">
              Solução
            </a>
            <a href="#precos" className="hover:text-white transition">
              Preços
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQ
            </a>
          </nav>

          <a
            href="#cta"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
          >
            Entrar na lista
          </a>
        </div>
      </header>

      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            MVP em construção · acesso antecipado
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Pronto pra parar de perder tempo
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              editando? 🚀
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            O Klipora vai transformar 1 vídeo longo em <strong>clips, posts e newsletter</strong>.
            Estamos liberando acesso antecipado para os primeiros usuários.
          </p>

          <form
            id="cta"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-indigo-400 transition disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-semibold transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Entrar na lista VIP →"}
            </button>
          </form>

          {error && (
            <div className="mt-4 inline-block px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-sm text-green-300">
              {success}
            </div>
          )}

          <div className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
            <h2 className="text-2xl font-bold mb-3 text-center">Teste o envio de vídeo</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Cole um link do YouTube para validar a entrada do MVP.
            </p>

            <form onSubmit={handleVideoSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Cole o link do YouTube aqui"
                className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-green-400 transition disabled:opacity-50"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isVideoSubmitting}
              />

              <button
                type="submit"
                disabled={isVideoSubmitting}
                className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVideoSubmitting ? "Enviando vídeo..." : "Enviar vídeo"}
              </button>
            </form>

            {videoMessage && (
              <div
                className={`mt-4 inline-block px-4 py-2 rounded-lg text-sm ${
                  videoMessage.startsWith("✅")
                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                    : "bg-red-500/20 border border-red-500/50 text-red-300"
                }`}
              >
                {videoMessage}
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>✅</span> Lista VIP funcionando
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Teste de vídeo do MVP
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Primeiros usuários antecipados
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="px-6 py-20 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Você está perdendo audiência e tempo
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Reconhece algum desses problemas?
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3">Horas perdidas editando</h3>
              <p className="text-gray-400">
                Cortar clips, criar posts e adaptar formatos manualmente vira um gargalo.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-3">Ferramentas e freelancers custam caro</h3>
              <p className="text-gray-400">
                Montar operação de conteúdo custa dinheiro e ainda toma energia do negócio.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-5xl mb-4">📉</div>
              <h3 className="text-xl font-bold mb-3">Seu melhor conteúdo morre longo</h3>
              <p className="text-gray-400">
                Lives, aulas e podcasts bons demais ficam sem distribuição porque ninguém repurposa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="solucao" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Como o Klipora vai funcionar
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Simples, rápido e focado em conteúdo útil.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-500/20 h-full">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-xl font-bold mb-3">Cole o link do vídeo</h3>
                <p className="text-gray-400">
                  YouTube primeiro. Depois vamos adicionar upload de MP4.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-500/20 h-full">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-3">Processamento automático</h3>
                <p className="text-gray-400">
                  O sistema vai detectar trechos úteis e preparar entregáveis prontos.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-950/50 to-red-950/50 border border-pink-500/20 h-full">
                <div className="text-4xl mb-4">📥</div>
                <h3 className="text-xl font-bold mb-3">Receba o resultado</h3>
                <p className="text-gray-400">
                  Clips, posts e materiais derivados para distribuir melhor seu conteúdo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            O que queremos entregar no MVP
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Começando simples, mas útil de verdade
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🎬", titulo: "Clips curtos", desc: "Trechos reaproveitáveis do vídeo original" },
              { icon: "📝", titulo: "Posts derivados", desc: "Textos prontos para publicar" },
              { icon: "📧", titulo: "Newsletter", desc: "Resumo reaproveitado em formato de email" },
              { icon: "📊", titulo: "Base para distribuição", desc: "Menos tempo editando, mais tempo publicando" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{item.titulo}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Planos planejados
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Referência inicial de monetização
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Pra começar</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$127</span>
                <span className="text-gray-400">/mês</span>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-pink-900/80 border-2 border-pink-500 transform md:scale-105 shadow-2xl shadow-pink-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full text-xs font-bold">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-300 text-sm mb-6">Pra quem publica com frequência</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$297</span>
                <span className="text-gray-300">/mês</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <p className="text-gray-400 text-sm mb-6">Pra equipes</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$697</span>
                <span className="text-gray-400">/mês</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-20 bg-black/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            O que já sabemos até aqui
          </p>

          <div className="space-y-4">
            {[
              {
                q: "Já está funcionando completo?",
                a: "Ainda não. O MVP está em construção e estamos validando a entrada de vídeo e a base do fluxo.",
              },
              {
                q: "Já posso entrar na lista?",
                a: "Sim. A lista serve para acesso antecipado e primeiros testes assim que o MVP estiver pronto.",
              },
              {
                q: "Vai funcionar em português?",
                a: "Sim. O foco do Klipora é o mercado brasileiro e conteúdo em português.",
              },
              {
                q: "Vai aceitar YouTube e upload?",
                a: "Sim. O plano é começar por YouTube e depois adicionar upload de MP4.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold list-none">
                  {item.q}
                  <span className="text-xl group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </div>
          <div>© 2026 Klipora. Todos os direitos reservados.</div>
          <div className="flex gap-6">
            <a href="/termos" className="hover:text-white transition">
              Termos
            </a>
            <a href="/privacidade" className="hover:text-white transition">
              Privacidade
            </a>
            <a href="mailto:contato@klipora.com.br" className="hover:text-white transition">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}