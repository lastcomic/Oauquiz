import { config, emailEnabled } from "@/lib/config";

// Email via Resend REST API. When RESEND_API_KEY is absent, sending is
// simulated (logged) so the flow is testable without a provider.

export interface Attachment {
  filename: string;
  /** base64-encoded content. */
  content: string;
}

export interface SendResult {
  sent: boolean;
  simulated: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  if (!emailEnabled()) {
    // eslint-disable-next-line no-console
    console.log(
      `[email:simulated] to=${opts.to} subject="${opts.subject}" attachments=${opts.attachments?.length ?? 0}`,
    );
    return { sent: false, simulated: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        attachments: opts.attachments,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { sent: false, simulated: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { sent: true, simulated: false, id: data.id };
  } catch (e) {
    return { sent: false, simulated: false, error: String(e) };
  }
}
