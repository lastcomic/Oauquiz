import { config, smtpEnabled, resendEnabled } from "@/lib/config";

// Email delivery. Prefers SMTP (nodemailer) when configured, then Resend,
// otherwise simulates (logs) so the flow is testable without a provider.

export interface Attachment {
  filename: string;
  /** base64-encoded content. */
  content: string;
}

export interface SendResult {
  sent: boolean;
  simulated: boolean;
  channel?: "smtp" | "resend";
  id?: string;
  error?: string;
}

async function sendViaSmtp(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  // Imported lazily so the dependency never loads on the client/edge.
  const nodemailer = (await import("nodemailer")).default;
  const transport = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
  });
  const info = await transport.sendMail({
    from: config.emailFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      encoding: "base64",
    })),
  });
  return { sent: true, simulated: false, channel: "smtp", id: info.messageId };
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
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
    return { sent: false, simulated: false, channel: "resend", error: `Resend ${res.status}: ${text.slice(0, 200)}` };
  }
  const data = (await res.json()) as { id?: string };
  return { sent: true, simulated: false, channel: "resend", id: data.id };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  try {
    if (smtpEnabled()) return await sendViaSmtp(opts);
    if (resendEnabled()) return await sendViaResend(opts);
  } catch (e) {
    return { sent: false, simulated: false, error: String(e) };
  }
  // eslint-disable-next-line no-console
  console.log(
    `[email:simulated] to=${opts.to} subject="${opts.subject}" attachments=${opts.attachments?.length ?? 0}`,
  );
  return { sent: false, simulated: true };
}
