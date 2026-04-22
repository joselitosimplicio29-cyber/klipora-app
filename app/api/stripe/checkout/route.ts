import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-04-10" as any });

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("klipora_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Faça login para assinar." }, { status: 401 });
    }

    const user = db.getUserById(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: "Stripe não está configurado." }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
