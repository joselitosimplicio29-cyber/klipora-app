import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", { apiVersion: "2024-04-10" as any });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!endpointSecret || !sig) throw new Error("Missing secret or signature");
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;

        if (userId) {
          const user = db.getUserById(userId);
          if (user) {
            db.updateUserProStatus(user.email, true, customerId);
            console.log(`✅ Usuário ${user.email} atualizado para PRO!`);
          }
        } else if (customerEmail) {
           // Fallback
           const user = db.getUserByEmail(customerEmail);
           if (user) {
             db.updateUserProStatus(customerEmail, true, customerId);
             console.log(`✅ Usuário ${customerEmail} atualizado para PRO via fallback!`);
           }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        try {
          const usersPath = path.join(process.cwd(), 'data', 'users.json');
          const allUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
          const user = allUsers.find((u: any) => u.stripeCustomerId === customerId);
          if (user) {
             db.updateUserProStatus(user.email, false);
             console.log(`❌ Usuário ${user.email} perdeu o status PRO (Cancelado).`);
          }
        } catch(e) {}
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err: any) {
    console.error("Error processing webhook:", err);
  }

  return NextResponse.json({ received: true });
}
