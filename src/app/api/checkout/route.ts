import { NextResponse } from "next/server";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";
import { config, stripeEnabled, resolveBaseUrl } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { saveOrder, type Order } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/checkout
// Body: { email, context, personalization, orderId? }
// Returns: { url } to redirect to (Stripe Checkout, or the local /success
// page in simulation mode when Stripe is not configured).

function randId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: Request) {
  let body: {
    email?: string;
    context?: PersonalizeContext;
    personalization?: Personalization;
    orderId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const context = body.context;
  const personalization = body.personalization;
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!context || !personalization) {
    return NextResponse.json({ error: "Missing student file data." }, { status: 400 });
  }

  const base = resolveBaseUrl(req);
  const orderId = body.orderId || randId();

  // Simulation mode — no Stripe key configured.
  if (!stripeEnabled()) {
    const sessionId = `simulated:${orderId}`;
    const order: Order = {
      id: orderId,
      sessionId,
      email,
      context,
      personalization,
      amountCents: config.priceAmountCents,
      currency: config.priceCurrency,
      paid: true,
      channel: "simulated",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);
    return NextResponse.json({
      url: `${base}/success?session_id=${encodeURIComponent(sessionId)}`,
      simulated: true,
    });
  }

  // Real Stripe Checkout.
  const stripe = getStripe()!;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        config.stripePriceId
          ? { price: config.stripePriceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: config.priceCurrency,
                product_data: { name: config.productName },
                unit_amount: config.priceAmountCents,
              },
            },
      ],
      metadata: { orderId },
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/result`,
    });

    const order: Order = {
      id: orderId,
      sessionId: session.id,
      email,
      context,
      personalization,
      amountCents: config.priceAmountCents,
      currency: config.priceCurrency,
      paid: false,
      channel: "stripe",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: `Stripe error: ${String(e).slice(0, 200)}` },
      { status: 502 },
    );
  }
}
