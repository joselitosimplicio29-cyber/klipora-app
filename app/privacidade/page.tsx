import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade - Klipora",
  description: "Política de Privacidade do Klipora",
};

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="text-gray-400 mb-12">Última atualização: 18 de abril de 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Compromisso com a Privacidade</h2>
            <p>
              O Klipora leva a sério a privacidade dos nossos usuários. Esta Política descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Dados que Coletamos</h2>
            <p className="mb-3">Coletamos apenas o necessário para entregar o serviço:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Dados de cadastro:</strong> nome, email, telefone</li>
              <li><strong className="text-white">Dados de pagamento:</strong> processados pelo Asaas (PCI-compliant), não armazenamos cartão</li>
              <li><strong className="text-white">Vídeos enviados:</strong> armazenados apenas durante o processamento e por até 30 dias</li>
              <li><strong className="text-white">Dados de uso:</strong> quantos vídeos processou, quando acessou o serviço</li>
              <li><strong className="text-white">Dados técnicos:</strong> endereço IP, navegador, sistema operacional</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Como Usamos Seus Dados</h2>
            <p className="mb-3">Seus dados são usados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Processar os vídeos que você enviar</li>
              <li>Processar pagamentos da sua assinatura</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Enviar notificações quando seus clips ficam prontos</li>
              <li>Cumprir obrigações legais e fiscais</li>
              <li>Melhorar o produto com análises agregadas</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">4. Com Quem Compartilhamos</h2>
            <p className="mb-3">Compartilhamos dados APENAS com parceiros essenciais ao funcionamento:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Supabase:</strong> armazenamento de banco de dados e autenticação</li>
              <li><strong className="text-white">Anthropic (Claude):</strong> processamento de IA do conteúdo</li>
              <li><strong className="text-white">Groq:</strong> transcrição de áudio</li>
              <li><strong className="text-white">Vercel:</strong> hospedagem do site</li>
              <li><strong className="text-white">Backblaze:</strong> armazenamento de clips gerados</li>
              <li><strong className="text-white">Resend:</strong> envio de emails transacionais</li>
              <li><strong className="text-white">Asaas:</strong> processamento de pagamentos</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white">NUNCA vendemos seus dados a terceiros.</strong>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="mb-3">Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Acessar seus dados pessoais armazenados</li>
              <li>Corrigir dados incorretos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Portabilidade dos seus dados</li>
              <li>Saber com quem compartilhamos seus dados</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer direito, envie email para: <a href="mailto:contato@klipora.com.br" className="text-indigo-400 hover:text-indigo-300">contato@klipora.com.br</a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">6. Retenção de Dados</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Vídeos originais:</strong> excluídos 7 dias após processamento</li>
              <li><strong className="text-white">Clips gerados:</strong> mantidos por 30 dias</li>
              <li><strong className="text-white">Dados de cadastro:</strong> mantidos enquanto a conta estiver ativa</li>
              <li><strong className="text-white">Dados fiscais:</strong> mantidos por 5 anos (obrigação legal)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia em repouso (banco de dados)</li>
              <li>Autenticação segura com JWT</li>
              <li>Backups automáticos diários</li>
              <li>Monitoramento 24/7</li>
              <li>Acesso restrito apenas a pessoal autorizado</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para funcionamento do serviço (autenticação, sessão) e cookies analíticos para melhorar a experiência. Você pode desativar cookies no seu navegador, mas isso pode afetar o funcionamento.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">9. Menores de Idade</h2>
            <p>
              O Klipora não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. Caso descubramos, excluiremos os dados imediatamente.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas por email com 30 dias de antecedência.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">11. Encarregado de Dados (DPO)</h2>
            <p>
              Em cumprimento à LGPD, temos um responsável por questões de privacidade:
            </p>
            <p className="mt-3">
              <strong className="text-white">Nome:</strong> Joselito<br />
              <strong className="text-white">Email:</strong> <a href="mailto:contato@klipora.com.br" className="text-indigo-400 hover:text-indigo-300">contato@klipora.com.br</a><br />
              <strong className="text-white">Empresa:</strong> TV Sertão Livre LTDA<br />
              <strong className="text-white">CNPJ:</strong> 27.340.092/0001-05
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