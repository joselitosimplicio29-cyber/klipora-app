// API do Waitlist — salva email no Supabase + envia email de boas-vindas
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert([{ email: email.toLowerCase().trim(), name: name || null, phone: phone || null, source: 'landing' }])
      .select()
      .single();

    if (error?.code === '23505') {
      return NextResponse.json({ success: true, message: 'Você já está na lista!' }, { status: 200 });
    }

    if (error) {
      console.error('Erro ao salvar:', error);
      return NextResponse.json({ error: 'Erro ao processar sua inscrição' }, { status: 500 });
    }

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
                que transforma seus vídeos longos em 20 conteúdos prontos pra publicar.
              </p>
              <h3 style="color: #0F172A; margin-top: 30px;">O que você vai receber:</h3>
              <ul style="color: #334155; line-height: 2;">
                <li>🎬 <strong>Clips verticais 9:16</strong> (TikTok, Reels, Shorts)</li>
                <li>📐 <strong>Clips quadrados 1:1</strong> (LinkedIn, Facebook, IG)</li>
                <li>📝 <strong>Posts prontos</strong> para todas as redes</li>
                <li>🎯 <strong>Acesso antecipado</strong> ao MVP</li>
              </ul>
              <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #0F172A; margin: 0; font-size: 16px;">
                  <strong>🔥 Oferta exclusiva VIP:</strong><br>
                  Lifetime Deal de <strong>R$ 1.497</strong> — apenas 50 vagas!
                </p>
              </div>
              <p style="color: #334155; margin-top: 30px;">
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
      console.error('Erro ao enviar email:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Inscrição realizada com sucesso!', data }, { status: 200 });
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json({ error: 'Erro ao processar sua inscrição' }, { status: 500 });
  }
}