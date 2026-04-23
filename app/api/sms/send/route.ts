import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, clipUrl } = await req.json();

    if (!phone || !clipUrl) {
      return NextResponse.json({ error: "Telefone e URL são obrigatórios" }, { status: 400 });
    }

    // LOGICA DE ENVIO DE SMS (Exemplo com Twilio ou Provedor Local)
    console.log(`[SMS MOCK] Enviando para ${phone}: Seu clipe está pronto! Acesse: ${clipUrl}`);

    // Para colocar em produção real, você precisaria de uma conta no Twilio ou Z-API
    // const res = await fetch('https://api.twilio.com/...', { ... });

    return NextResponse.json({ success: true, message: "SMS enviado com sucesso (Simulado)" });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao enviar SMS" }, { status: 500 });
  }
}
