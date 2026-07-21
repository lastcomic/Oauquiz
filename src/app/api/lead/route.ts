import { NextResponse } from "next/server";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";
import { config } from "@/lib/config";
import { saveLead, type Lead, type Order } from "@/lib/kv";
import { subscribeToBeehiiv } from "@/lib/beehiiv";
import { fulfillOrder } from "@/lib/fulfillment";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/lead  (lead-management mode — free)
// Body: { email, context, personalization, submissionId? }
// Captures the lead (KV + Beehiiv + optional notify) and emails the file.

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  let body: {
    email?: string;
    context?: PersonalizeContext;
    personalization?: Personalization;
    submissionId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const ctx = body.context;
  const personalization = body.personalization;
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!ctx || !personalization) {
    return NextResponse.json({ error: "Missing student file data." }, { status: 400 });
  }

  // 1) Beehiiv (best-effort)
  const bee = await subscribeToBeehiiv({
    email,
    customFields: {
      student_type: ctx.studentType.name,
      major: ctx.major.name,
      minor: ctx.minor.name,
      top_categories: ctx.topCategories.join(", "),
    },
  });

  // 2) Store the lead (best-effort)
  const lead: Lead = {
    id: body.submissionId || `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    email,
    name: ctx.name,
    age: ctx.age,
    studentType: ctx.studentType.name,
    major: ctx.major.name,
    minor: ctx.minor.name,
    topCategories: ctx.topCategories,
    someday: ctx.someday,
    note: ctx.note,
    delivered: false,
    beehiiv: bee.error ? "error" : bee.subscribed ? "subscribed" : bee.simulated ? "simulated" : "off",
  };

  // 3) Email the file to the lead (reuses the fulfillment pipeline)
  const order: Order = {
    id: lead.id,
    sessionId: `lead:${lead.id}`,
    email,
    context: ctx,
    personalization,
    amountCents: 0,
    currency: config.priceCurrency,
    paid: true,
    channel: "simulated",
    createdAt: lead.createdAt,
  };
  const fulfill = await fulfillOrder(order);
  lead.delivered = fulfill.delivered;
  try {
    await saveLead(lead);
  } catch {
    /* non-fatal */
  }

  // 4) Notify the operator (best-effort)
  if (config.leadNotifyEmail) {
    await sendEmail({
      to: config.leadNotifyEmail,
      subject: `New OAU lead — ${ctx.name} (${ctx.studentType.name})`,
      html: `<div style="font-family:system-ui,sans-serif">
        <h3>New placement-exam lead</h3>
        <p><b>Name:</b> ${esc(ctx.name)}${ctx.age ? ` · Age ${esc(ctx.age)}` : ""}<br>
        <b>Email:</b> ${esc(email)}<br>
        <b>Type:</b> ${esc(ctx.studentType.name)}<br>
        <b>Major/Minor:</b> ${esc(ctx.major.name)} / ${esc(ctx.minor.name)}<br>
        <b>Top signals:</b> ${esc(ctx.topCategories.join(", "))}</p>
        ${ctx.someday ? `<p><b>Their "someday":</b> ${esc(ctx.someday)}</p>` : ""}
        ${ctx.note ? `<p><b>Note:</b> ${esc(ctx.note)}</p>` : ""}
      </div>`,
    });
  }

  return NextResponse.json({
    captured: true,
    delivered: fulfill.delivered,
    simulated: fulfill.simulated,
    beehiiv: lead.beehiiv,
    email,
  });
}
