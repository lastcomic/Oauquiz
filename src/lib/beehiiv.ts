import { config, beehiivEnabled } from "@/lib/config";

// Beehiiv subscribe. No-op (simulated) when not configured. Adds the lead to
// the publication and stores their placement as custom fields for segmenting.

export interface BeehiivResult {
  subscribed: boolean;
  simulated: boolean;
  error?: string;
}

export async function subscribeToBeehiiv(opts: {
  email: string;
  customFields?: Record<string, string>;
}): Promise<BeehiivResult> {
  if (!beehiivEnabled()) {
    return { subscribed: false, simulated: true };
  }
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${config.beehiivPublicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.beehiivKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: opts.email,
          reactivate_existing: true,
          send_welcome_email: false,
          utm_source: "oau-placement-exam",
          custom_fields: opts.customFields
            ? Object.entries(opts.customFields).map(([name, value]) => ({
                name,
                value,
              }))
            : undefined,
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return { subscribed: false, simulated: false, error: `Beehiiv ${res.status}: ${text.slice(0, 160)}` };
    }
    return { subscribed: true, simulated: false };
  } catch (e) {
    return { subscribed: false, simulated: false, error: String(e) };
  }
}
