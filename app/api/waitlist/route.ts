// API do Waitlist — salva email no Supabase + envia email de boas-vindas
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { Resend } from 'resend';

// Inicializa o Resend com a API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Pega os dados enviados pelo formulário
    const body = await request.json();
    const { email, name, phone } = body;

    // Valida se o email foi enviado
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Salva no Supabase (tabela waitlist)
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase().trim(),
          name: name || null,
          phone: phone || null,
          source: 'landing',
        },
      ])
      .select()
      .single();

    // Se email já existe, retorna mensagem amigável
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: true, message: 'Você já está na lista!' },
        { status: 200 }
      );
    }

    if (error) {
      console.error('Erro ao salvar:', error);
      return NextResponse.json(
        { error: 'Erro ao processar sua inscrição' },
        { status: 500 }
      );
    }

    // Envia email de boas-vindas
    try {
      await resend.emails.send({
        from: 'Klipora <onboarding@resend.dev>',
        to: email,
        subject: '🎬 Você está na lista VIP do Klipora!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%); padding: 40px; border-radius: 12px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">KLIPORA</h1>
              <p style="color: white; margin: 10px 0 0; font-size: 18px;">Bem-vindo à lista VIP! 🎉</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #0F172A; font-size: 24px;">Olá!</h2>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Você acabou de entrar na <strong>lista VIP do Klipora</strong> — o SaaS brasileiro 
                que transforma seus vídeos longos em 20 conteúdos prontos pra publicar em apenas 
                10 minutos.
              </p>
              
              <h3 style="color: #0F172A; margin-top: 30px;">O que você vai receber:</h3>
              <ul style="color: #334155; line-height: 2;">
                <li>🎬 <strong>10 clips verticais 9:16</strong> (TikTok, Reels, Shorts)</li>
                <li>📐 <strong>10 clips quadrados 1:1</strong> (LinkedIn, Facebook, IG)</li>
                <li>📝 <strong>5 posts LinkedIn</strong> prontos pra postar</li>
                <li>🧵 <strong>1 thread Twitter</strong> com 8 tweets</li>
                <li>📧 <strong>1 newsletter</strong> HTML completa</li>
                <li>🎯 <strong>1 roteiro</strong> do próximo vídeo</li>
              </ul>
              
              <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #0F172A; margin: 0; font-size: 16px;">
                  <strong>🔥 Oferta exclusiva pra você:</strong><br>
                  Como membro VIP, você terá acesso ao <strong>Lifetime Deal de R$ 1.497</strong> 
                  antes de qualquer outra pessoa. Apenas 50 vagas disponíveis!
                </p>
              </div>
              
              <p style="color: #334155; margin-top: 30px;">
                Em breve você receberá um email com mais novidades e acesso antecipado. 
                Fica atento na caixa de entrada!
              </p>
              
              <p style="color: #334155;">
                Abraço,<br>
                <strong>Joselito</strong><br>
                <span style="color: #64748B;">Fundador do Klipora</span>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #64748B; font-size: 14px;">
              © 2026 Klipora. Todos os direitos reservados.
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      // Se der erro no email, não quebra o fluxo
      console.error('Erro ao enviar email:', emailError);
    }

    // Retorna sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Inscrição realizada com sucesso!',
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sua inscrição' },
      { status: 500 }
    );
  }
}