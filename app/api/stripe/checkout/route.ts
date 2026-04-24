import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Erro: Chave STRIPE_SECRET_KEY não encontrada no painel do Railway." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27-preview", // Usando a versão mais estável/recente
    });
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("klipora_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Faça login para assinar." }, { status: 401 });
    }

    const user = db.getUserById(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Erro: Chave STRIPE_SECRET_KEY não encontrada no servidor." }, { status: 500 });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: "Erro: ID do plano STRIPE_PRICE_ID não encontrado no servidor." }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      payment_method_options: {
        pix: {
          expires_after_seconds: 1800, // 30 minutos para pagar
        },
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id, // VITAL: pra sabermos quem pagou no webhook
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app?success=pro_activated`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app?error=payment_cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
