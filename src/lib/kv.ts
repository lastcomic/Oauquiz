import { config, kvEnabled } from "@/lib/config";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";

// Minimal key/value store. Uses Upstash/Vercel KV REST when configured;
// otherwise an in-process Map (fine for local/dev and single-instance use,
// not durable across serverless invocations — the success page carries a
// client-driven fallback so fulfillment still works without KV).

export interface Order {
  id: string; // our order id (== submission id or a generated id)
  sessionId: string; // Stripe session id, or "simulated:*"
  email: string;
  context: PersonalizeContext;
  personalization: Personalization;
  amountCents: number;
  currency: string;
  paid: boolean;
  channel: "stripe" | "simulated";
  createdAt: string;
  deliveredAt?: string;
}

const mem = new Map<string, string>();

async function kvFetch(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(config.kvUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.kvToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`KV error ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const payload = JSON.stringify(value);
  if (kvEnabled()) {
    await kvFetch(["SET", key, payload]);
  } else {
    mem.set(key, payload);
  }
}

export async function kvGet<T>(key: string): Promise<T | null> {
  let raw: string | null = null;
  if (kvEnabled()) {
    raw = (await kvFetch(["GET", key])) as string | null;
  } else {
    raw = mem.get(key) ?? null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const orderKey = (sessionId: string) => `oau:order:${sessionId}`;

export async function saveOrder(order: Order): Promise<void> {
  await kvSet(orderKey(order.sessionId), order);
}

export async function getOrder(sessionId: string): Promise<Order | null> {
  return kvGet<Order>(orderKey(sessionId));
}

// ── Leads (lead-management mode) ───────────────────────────────

export interface Lead {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  age: string | null;
  studentType: string;
  major: string;
  minor: string;
  topCategories: string[];
  someday: string | null;
  note: string | null;
  delivered: boolean;
  beehiiv?: "subscribed" | "simulated" | "error" | "off";
}

const LEADS_KEY = "oau:leads";

/** Prepend a lead, de-duplicating by email (latest wins). Cap at 1000. */
export async function saveLead(lead: Lead): Promise<void> {
  const all = (await kvGet<Lead[]>(LEADS_KEY)) ?? [];
  const deduped = all.filter(
    (l) => l.email.toLowerCase() !== lead.email.toLowerCase(),
  );
  deduped.unshift(lead);
  await kvSet(LEADS_KEY, deduped.slice(0, 1000));
}

export async function getLeads(): Promise<Lead[]> {
  return (await kvGet<Lead[]>(LEADS_KEY)) ?? [];
}
