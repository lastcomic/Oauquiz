import { NextResponse } from "next/server";
import { config, stripeEnabled } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { getOrder, saveOrder } from "@/lib/kv";
import { fulfillOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/stripe/webhook
// Belt-and-suspenders fulfillment: when Stripe posts checkout.session.completed
// we email the package (idempotent with the /success page delivery). Requires
// STRIPE_WEBHOOK_SECRET and a KV store to hold the pending order.

export async function POST(req: Request) {
  if (!stripeEnabled() || !config.stripeWebhookSecret) {
    return NextResponse.json({ received: true, skipped: "not configured" });
  }
  const stripe = getStripe()!;
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, config.stripeWebhookSecret);
  } catch (e) {
    return NextResponse.json({ error: `Signature verification failed: ${String(e).slice(0, 120)}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    const order = await getOrder(session.id);
    if (order && !order.deliveredAt) {
      const result = await fulfillOrder(order);
      if (!result.error) {
        order.paid = true;
        order.deliveredAt = new Date().toISOString();
        await saveOrder(order);
      }
    }
  }

  return NextResponse.json({ received: true });
}
