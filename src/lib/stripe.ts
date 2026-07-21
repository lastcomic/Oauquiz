import Stripe from "stripe";
import { config, stripeEnabled } from "@/lib/config";

// Lazily-constructed Stripe client. Returns null when no secret key is
// configured (the app then runs the checkout flow in simulation mode).

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  if (!client) client = new Stripe(config.stripeSecret);
  return client;
}
