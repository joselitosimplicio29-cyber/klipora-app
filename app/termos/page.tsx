import Link from "next/link";

export const metadata = {
  title: "Termos de Uso - Klipora",
  description: "Termos de Uso do Klipora",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </Link>
          <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          Termos de Uso
        </h1>
        <p className="text-gray-400 mb-12">Última atualização: 18 de abril de 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o Klipora (&quot;Serviço&quot;), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deverá utilizar nosso serviço.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Descrição do Serviço</h2>
            <p>
              O Klipora é uma plataforma de inteligência artificial que transforma vídeos longos em clips curtos, posts para redes sociais, newsletters e outros conteúdos derivados. O serviço é oferecido em modalidade de assinatura mensal ou pagamento único (Lifetime Deal).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o Klipora, você deve criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">4. Uso Aceitável</h2>
            <p>
              Você concorda em utilizar o Klipora apenas para fins legais e de acordo com estes Termos. É proibido:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Fazer upload de conteúdo protegido por direitos autorais sem autorização</li>
              <li>Processar conteúdo que viole leis brasileiras</li>
              <li>Tentar realizar engenharia reversa ou hackear o sistema</li>
              <li>Revender o acesso sem autorização expressa</li>
              <li>Fazer uso abusivo que afete a disponibilidade do serviço</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">5. Propriedade Intelectual</h2>
            <p>
              Todo conteúdo gerado pelo Klipora a partir dos seus vídeos originais pertence a VOCÊ. O Klipora não reivindica direitos sobre o material processado. Porém, a tecnologia, o software e a marca Klipora são de propriedade exclusiva da TV Sertão Livre LTDA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">6. Pagamentos e Cancelamentos</h2>
            <p>
              Os planos são cobrados mensalmente de forma recorrente. Você pode cancelar a qualquer momento através do seu dashboard, sem multas ou taxas adicionais. O Lifetime Deal é um pagamento único e não reembolsável após 7 dias da compra.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">7. Garantia de Satisfação</h2>
            <p>
              Oferecemos 7 dias de garantia total. Caso não esteja satisfeito, entre em contato em até 7 dias após a compra e devolveremos 100% do valor pago, sem burocracia.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitação de Responsabilidade</h2>
            <p>
              O Klipora não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Conteúdo enviado pelo usuário que viole direitos de terceiros</li>
              <li>Perdas indiretas decorrentes do uso do serviço</li>
              <li>Indisponibilidade temporária por manutenção programada</li>
              <li>Uso inadequado do serviço pelos usuários</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">9. Alterações nos Termos</h2>
            <p>
              Reservamos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por email ou dashboard com 30 dias de antecedência. O uso continuado após alterações implica aceitação dos novos termos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contato</h2>
            <p>
              Dúvidas sobre estes Termos? Entre em contato:
            </p>
            <p className="mt-3">
              Email: <a href="mailto:contato@klipora.com.br" className="text-indigo-400 hover:text-indigo-300">contato@klipora.com.br</a><br />
              Empresa: TV Sertão Livre LTDA<br />
              CNPJ: 27.340.092/0001-05
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            KLIPORA
          </Link>
          <div>
            © 2026 Klipora. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition">Privacidade</Link>
            <a href="mailto:contato@klipora.com.br" className="hover:text-white transition">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}