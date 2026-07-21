// Server-side configuration + feature flags (Phase 2B).
// Everything degrades gracefully: when a key is absent, the related
// feature runs in "simulation" mode so the flow is still testable and
// the app still deploys. Add the real keys in Vercel env to activate.

export const config = {
  // Stripe
  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripePriceId: process.env.STRIPE_PRICE_ID || "",
  priceAmountCents: Number(process.env.PRICE_AMOUNT_CENTS || "2900"),
  priceCurrency: (process.env.PRICE_CURRENCY || "usd").toLowerCase(),
  productName: process.env.PRODUCT_NAME || "OAU Official Student File",

  // Email (Resend)
  resendKey: process.env.RESEND_API_KEY || "",
  emailFrom:
    process.env.EMAIL_FROM || "OAU Office of Guidance <onboarding@resend.dev>",

  // Optional KV (Upstash / Vercel KV REST)
  kvUrl: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  kvToken:
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",

  // Public base URL (for Stripe redirect URLs). Falls back to request origin.
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
} as const;

export const stripeEnabled = () => !!config.stripeSecret;
export const emailEnabled = () => !!config.resendKey;
export const kvEnabled = () => !!config.kvUrl && !!config.kvToken;

/** Formatted price, e.g. "$29.00". */
export function priceLabel(): string {
  const amount = config.priceAmountCents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.priceCurrency.toUpperCase(),
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/** Resolve the site origin for redirect/callback URLs. */
export function resolveBaseUrl(req: Request): string {
  if (config.baseUrl) return config.baseUrl.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}
