import { NextResponse } from "next/server";
import {
  config,
  stripeEnabled,
  emailEnabled,
  beehiivEnabled,
  chargingEnabled,
  priceLabel,
} from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/config — public flags the client uses to render the capture UI.
export async function GET() {
  return NextResponse.json({
    leadMode: !chargingEnabled(),
    charging: chargingEnabled(),
    stripeEnabled: stripeEnabled(),
    emailEnabled: emailEnabled(),
    beehiivEnabled: beehiivEnabled(),
    priceLabel: priceLabel(),
    productName: config.productName,
  });
}
