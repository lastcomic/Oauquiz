import { NextResponse } from "next/server";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";
import { stripeEnabled } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { getOrder, saveOrder, type Order } from "@/lib/kv";
import { fulfillOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/deliver
// Called by the /success page. Verifies payment, then emails the package.
// Body: { session_id, email?, context?, personalization? }
// The context/personalization are used as a fallback when no KV record
// exists (client-driven fulfillment), so delivery works without a datastore.

export async function POST(req: Request) {
  let body: {
    session_id?: string;
    email?: string;
    context?: PersonalizeContext;
    personalization?: Personalization;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = (body.session_id || "").trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const simulated = sessionId.startsWith("simulated:");

  // Verify payment for real Stripe sessions.
  if (!simulated && stripeEnabled()) {
    try {
      const stripe = getStripe()!;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ paid: false, error: "Payment not completed." }, { status: 402 });
      }
    } catch {
      return NextResponse.json({ error: "Could not verify payment." }, { status: 400 });
    }
  }

  // Load the stored order, or reconstruct it from the request (no-KV fallback).
  let order = await getOrder(sessionId);
  if (!order) {
    if (!body.email || !body.context || !body.personalization) {
      return NextResponse.json(
        { error: "Order not found and no fallback data provided." },
        { status: 404 },
      );
    }
    order = {
      id: sessionId,
      sessionId,
      email: body.email,
      context: body.context,
      personalization: body.personalization,
      amountCents: 0,
      currency: "usd",
      paid: true,
      channel: simulated ? "simulated" : "stripe",
      createdAt: new Date().toISOString(),
    };
  }

  // Idempotent: already delivered.
  if (order.deliveredAt) {
    return NextResponse.json({ delivered: true, already: true, email: order.email });
  }

  const result = await fulfillOrder(order);
  if (result.error) {
    return NextResponse.json({ delivered: false, error: result.error }, { status: 502 });
  }

  order.paid = true;
  order.deliveredAt = new Date().toISOString();
  await saveOrder(order);

  return NextResponse.json({
    delivered: result.delivered,
    simulated: result.simulated,
    email: order.email,
  });
}
