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

    setStep("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao processar sua inscrição");
        setStep("landing");
        return;
      }

      setTimeout(() => setStep("results"), 2000);
    } catch {
      setError("Erro ao conectar. Tente novamente.");
      setStep("landing");
    }
  }

  if (step === "loading") return <LoadingScreen />;
  if (step === "results") return <ResultsScreen onRestart={() => setStep("landing")} />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#problema" className="hover:text-white transition">Problema</a>
            <a href="#solucao" className="hover:text-white transition">Solução</a>
            <a href="#precos" className="hover:text-white transition">Preços</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>
          <a href="#cta" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            Entrar na lista
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            🔥 Lançamento: 50 vagas com 70% OFF
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transforme 1 vídeo em
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              20 conteúdos virais
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            A IA que vira sua live em <strong>clips, posts e newsletter</strong>.
            Em português, prontos pra publicar em 10 minutos.
          </p>

          <form id="cta" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-indigo-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-semibold transition shadow-lg shadow-indigo-500/30"
            >
              Entrar na lista VIP →
            </button>
          </form>

          {error && (
            <p className="text-sm text-red-400 mt-4">⚠️ {error}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>✅</span> Teste grátis com 1 vídeo
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Cancele quando quiser
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="px-6 py-20 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Você está perdendo audiência e dinheiro
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Reconhece algum desses problemas?
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3">6+ horas por semana perdidas</h3>
              <p className="text-gray-400">
                Editando manualmente, cortando clips, escrevendo posts. Horas que poderiam ser vendendo.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-3">R$ 2.000 a R$ 4.000/mês</h3>
              <p className="text-gray-400">
                Entre editor freelance, social media e ferramentas gringas em dólar. Custo que come sua margem.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-5xl mb-4">📉</div>
              <h3 className="text-xl font-bold mb-3">Seu melhor conteúdo morre</h3>
              <p className="text-gray-400">
                Lives, podcasts e webinars incríveis que nunca viram clips virais. Dinheiro deixado na mesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Como funciona
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            3 passos simples. 10 minutos. Pronto pra publicar.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-500/20 h-full">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-xl font-bold mb-3">Cole seu vídeo</h3>
                <p className="text-gray-400">
                  Link do YouTube ou upload de MP4. Aceita até 2 horas de duração.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-500/20 h-full">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-3">IA processa em 10 min</h3>
                <p className="text-gray-400">
                  Transcreve, analisa os melhores momentos, corta, legenda e gera todos os textos.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-950/50 to-red-950/50 border border-pink-500/20 h-full">
                <div className="text-4xl mb-4">📥</div>
                <h3 className="text-xl font-bold mb-3">Baixe tudo pronto</h3>
                <p className="text-gray-400">
                  Receba por dashboard, email e WhatsApp. 20 conteúdos prontos pra postar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ RECEBE */}
      <section className="px-6 py-20 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Por 1 vídeo, você recebe tudo isso
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Pacote completo de conteúdo multi-plataforma
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🎬", titulo: "10 clips verticais 9:16", desc: "TikTok, Reels e Shorts" },
              { icon: "📐", titulo: "10 clips quadrados 1:1", desc: "LinkedIn, Facebook e IG Feed" },
              { icon: "💬", titulo: "Legendas queimadas", desc: "Todos os clips com legenda automática" },
              { icon: "📝", titulo: "5 posts LinkedIn", desc: "200 palavras cada, prontos pra postar" },
              { icon: "🧵", titulo: "1 thread Twitter/X", desc: "8 tweets interligados com hook" },
              { icon: "📧", titulo: "1 newsletter HTML", desc: "Pronta pra Mailchimp ou Substack" },
              { icon: "🎯", titulo: "1 roteiro do próximo vídeo", desc: "Baseado no que mais engajou" },
              { icon: "📊", titulo: "Análise de potencial viral", desc: "Ranking dos 10 clips por chance de viralizar" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
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

      {/* PREÇOS */}
      <section id="precos" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Escolha seu plano
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Cancele quando quiser. Sem fidelidade.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* STARTER */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Pra começar</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$127</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 4 vídeos/mês (até 30 min)</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 5 clips por vídeo</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 3 posts LinkedIn</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Suporte por email</li>
              </ul>
            </div>

            {/* PRO - DESTAQUE */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-pink-900/80 border-2 border-pink-500 transform md:scale-105 shadow-2xl shadow-pink-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full text-xs font-bold">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-300 text-sm mb-6">Pra quem leva a sério</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$297</span>
                <span className="text-gray-300">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 20 vídeos/mês (até 60 min)</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 10 clips por vídeo</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 5 posts + thread + newsletter</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Roteiro próximo vídeo</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Legendas animadas</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Suporte WhatsApp</li>
              </ul>
            </div>

            {/* AGENCY */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <p className="text-gray-400 text-sm mb-6">Pra agências e times</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$697</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 60 vídeos/mês (até 120 min)</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Tudo do Pro +</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> White-label</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> API access</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 3 idiomas (PT/EN/ES)</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Suporte prioritário</li>
              </ul>
            </div>
          </div>

          {/* LIFETIME DEAL */}
          <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 border-2 border-yellow-500/50 text-center">
            <div className="inline-block px-4 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold mb-4">
              🔥 OFERTA DE LANÇAMENTO · APENAS 50 VAGAS
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Lifetime Deal — Pague uma vez, use pra sempre
            </h3>
            <div className="mb-6">
              <span className="text-6xl font-bold text-yellow-400">R$1.497</span>
              <p className="text-gray-400 mt-2">Equivalente ao Pro por 5 meses · Uso vitalício</p>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              20 vídeos/mês para sempre. Sem reajuste. Todos os recursos do Pro. Entra na lista VIP agora pra garantir sua vaga.
            </p>
            <a href="#cta" className="inline-block px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition">
              Quero garantir minha vaga →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 bg-black/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Tudo que você precisa saber
          </p>

          <div className="space-y-4">
            {[
              { q: "Funciona em português?", a: "Sim! Klipora é feito 100% pra português brasileiro. Entende gírias, jargão e contexto cultural. Os concorrentes gringos (Opus, Submagic) são em inglês e têm qualidade ruim em PT." },
              { q: "Quanto tempo leva o processamento?", a: "Em média 8 a 10 minutos por vídeo, dependendo da duração. Você recebe notificação por dashboard, email e WhatsApp quando terminar." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancela com 1 clique no dashboard. Se for no Lifetime, é pago uma vez só e é seu pra sempre." },
              { q: "E se eu não gostar?", a: "7 dias de garantia total. Se não gostar, devolvemos 100% do dinheiro. Sem perguntas, sem burocracia." },
              { q: "Aceita vídeo do YouTube?", a: "Sim! Basta colar o link. Também aceita upload direto de arquivo MP4." },
              { q: "Tem limite de tamanho?", a: "Depende do plano. Starter: até 30min. Pro: até 60min. Agency: até 2 horas por vídeo." },
              { q: "Como recebo os clips prontos?", a: "Por 3 canais: dashboard do Klipora, email com link pra baixar, e notificação no WhatsApp. Você escolhe qual usar." },
              { q: "Vai ter plano grátis?", a: "Ao entrar na lista VIP agora, você ganha 1 vídeo grátis completo pra testar. É mais que suficiente pra você sentir o valor real." },
            ].map((item, i) => (
              <details key={i} className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer">
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

      {/* CTA FINAL */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto pra parar de perder tempo editando?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Entre na lista VIP agora e ganhe acesso antecipado + 1 vídeo grátis pra testar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-indigo-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-semibold transition shadow-lg shadow-indigo-500/30"
            >
              Quero acesso VIP →
            </button>
          </form>

          {error && (
            <p className="text-sm text-red-400 mt-4">⚠️ {error}</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </div>
          <div>
            © 2026 Klipora. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Termos</a>
            <a href="#" className="hover:text-white transition">Privacidade</a>
            <a href="mailto:contato@klipora.com.br" className="hover:text-white transition">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}