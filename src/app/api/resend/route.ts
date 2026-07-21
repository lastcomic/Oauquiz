import { NextResponse } from "next/server";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";
import { config } from "@/lib/config";
import type { Order } from "@/lib/kv";
import { fulfillOrder } from "@/lib/fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/resend  (admin action — resend the package email)
// Body: { email, context, personalization }
// No payment check: this is an authenticated admin operation triggered from
// the local dashboard for a record that was already purchased.

export async function POST(req: Request) {
  let body: {
    email?: string;
    context?: PersonalizeContext;
    personalization?: Personalization;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email || "").trim();
  if (!email || !body.context || !body.personalization) {
    return NextResponse.json({ error: "email, context and personalization are required." }, { status: 400 });
  }

  const order: Order = {
    id: `resend:${Date.now()}`,
    sessionId: `resend:${Date.now()}`,
    email,
    context: body.context,
    personalization: body.personalization,
    amountCents: config.priceAmountCents,
    currency: config.priceCurrency,
    paid: true,
    channel: "simulated",
    createdAt: new Date().toISOString(),
  };

  const result = await fulfillOrder(order);
  if (result.error) {
    return NextResponse.json({ delivered: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ delivered: result.delivered, simulated: result.simulated, email });
}
