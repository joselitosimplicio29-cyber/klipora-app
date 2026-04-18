"use client";

export default function LoadingScreen() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-indigo-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-indigo-500" />

        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Processando seu vídeo...
        </h1>

        <p className="mb-8 text-lg text-gray-300">
          Nossa IA está analisando o conteúdo e gerando cortes virais.
        </p>

        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse bg-gradient-to-r from-indigo-500 to-pink-500" />
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-400">
          <p>✓ Analisando áudio e cenas</p>
          <p>✓ Detectando picos de engajamento</p>
          <p>✓ Gerando cortes virais</p>
        </div>
      </div>
    </main>
  );
}