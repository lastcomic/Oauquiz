import type { Order } from "@/lib/kv";
import { generateStudentFilePdf } from "@/lib/pdf";
import { sendEmail } from "@/lib/email";
import { UNIVERSITY_NAME, MOTTO } from "@/data/brand";

// Fulfillment: build the PDF and email the full package. Shared by the
// success-page delivery route, the Stripe webhook, and admin "resend".

export interface FulfillResult {
  delivered: boolean;
  simulated: boolean;
  error?: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml(order: Order): string {
  const { context: ctx, personalization: p } = order;
  const first = ctx.name.split(/\s+/)[0] || ctx.name;
  const electives = ctx.electives
    .map((e) => `<li>${esc(e.courseNumber)} — ${esc(e.title)}</li>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#e8dcc4;font-family:Georgia,'Times New Roman',serif;color:#2c2620">
  <div style="max-width:600px;margin:0 auto;padding:28px 22px">
    <div style="text-align:center;border-bottom:2px solid #1b2a47;padding-bottom:14px;margin-bottom:20px">
      <div style="font-size:20px;font-weight:bold;color:#1b2a47;letter-spacing:1px">${esc(UNIVERSITY_NAME)}</div>
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a63d2a;margin-top:4px">Office of Guidance &amp; Placement</div>
    </div>
    <p>Dear ${esc(ctx.name)},</p>
    <p>Welcome to the class. Your official Student File is attached as a PDF, and your placement is summarized below. This is not a beginning from zero — it is a beginning from everything you already know.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:6px 0;color:#a63d2a;font-size:11px;text-transform:uppercase;letter-spacing:1px">Student Type</td><td style="padding:6px 0;text-align:right;color:#1b2a47"><strong>${esc(ctx.studentType.name)}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#a63d2a;font-size:11px;text-transform:uppercase;letter-spacing:1px">Major</td><td style="padding:6px 0;text-align:right;color:#1b2a47">${esc(ctx.major.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#a63d2a;font-size:11px;text-transform:uppercase;letter-spacing:1px">Minor</td><td style="padding:6px 0;text-align:right;color:#1b2a47">${esc(ctx.minor.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#a63d2a;font-size:11px;text-transform:uppercase;letter-spacing:1px">Required Course</td><td style="padding:6px 0;text-align:right;color:#1b2a47">${esc(ctx.requiredCourse.courseNumber)} — ${esc(ctx.requiredCourse.title)}</td></tr>
    </table>
    <p style="margin:0 0 6px"><strong>Your electives</strong></p>
    <ul style="margin:0 0 16px">${electives}</ul>

    <p style="margin:0 0 6px"><strong>Your audio lesson</strong></p>
    <p style="margin:0 0 16px">${esc(ctx.audio.title)} (${ctx.audio.minutes} min) — ${esc(ctx.audio.description)}</p>

    <p style="margin:0 0 6px"><strong>A message from the Dean</strong></p>
    <p style="font-style:italic;margin:0 0 16px">“${esc(p.deansMessage)}”</p>

    <p style="margin:0 0 6px"><strong>Your private AI Advisor prompt</strong> — paste into ChatGPT, Claude, or Gemini:</p>
    <pre style="white-space:pre-wrap;word-break:break-word;background:#1b2a47;color:#e8dcc4;padding:12px;border-radius:4px;font-size:12px;font-family:monospace">${esc(p.advisorPrompt)}</pre>

    <p style="margin-top:20px">Your seven-day assignment is in the attached file. Begin there. It is small on purpose.</p>
    <p style="margin-top:24px">With genuine regard,<br><span style="font-style:italic;font-size:18px;color:#1b2a47">A. Counselor</span><br>
    <span style="font-size:11px;color:#a63d2a;text-transform:uppercase;letter-spacing:1px">${esc(MOTTO)}</span></p>
    <p style="font-size:11px;color:#7a746c;border-top:1px solid #c9a961;padding-top:10px;margin-top:20px">Office of Guidance and Placement · ${esc(UNIVERSITY_NAME)}. This message was sent because a Student File was purchased for this address.</p>
  </div></body></html>`;
}

export async function fulfillOrder(order: Order): Promise<FulfillResult> {
  try {
    const pdfBytes = await generateStudentFilePdf(order.context, order.personalization);
    const base64 = Buffer.from(pdfBytes).toString("base64");
    const safe =
      order.context.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "student";

    const result = await sendEmail({
      to: order.email,
      subject: `Your OAU Student File — ${order.context.studentType.name}`,
      html: buildHtml(order),
      attachments: [{ filename: `oau-student-file-${safe}.pdf`, content: base64 }],
    });

    if (result.error) {
      return { delivered: false, simulated: false, error: result.error };
    }
    return { delivered: result.sent, simulated: result.simulated };
  } catch (e) {
    return { delivered: false, simulated: false, error: String(e) };
  }
}
