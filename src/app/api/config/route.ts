import { NextResponse } from "next/server";
import { config, stripeEnabled, emailEnabled, priceLabel } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/config — public flags the client uses to render the purchase UI.
export async function GET() {
  return NextResponse.json({
    stripeEnabled: stripeEnabled(),
    emailEnabled: emailEnabled(),
    priceLabel: priceLabel(),
    productName: config.productName,
  });
}
