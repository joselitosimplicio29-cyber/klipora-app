"use client";

type ResultsScreenProps = {
  onRestart: () => void;
};

export default function ResultsScreen({ onRestart }: ResultsScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-black to-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-5xl text-center">
        <h1 className="mb-3 text-4xl font-bold">🎉 Seus clips estão prontos!</h1>

        <p className="mb-10 text-gray-300">
          Geramos automaticamente alguns cortes otimizados para viralizar.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:scale-[1.02]"
            >
              <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-black/40 text-gray-300">
                ▶ Clip {item}
              </div>

              <div className="mb-3 text-sm text-gray-400">
                Duração: {10 + item * 5}s
              </div>

              <button className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 py-2 font-semibold transition hover:opacity-90">
                Baixar Clip
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="mt-8 text-sm text-gray-400 transition hover:text-white"
        >
          Gerar novos clips
        </button>
      </div>
    </main>
  );
}