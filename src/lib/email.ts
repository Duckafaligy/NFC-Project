import { site } from "./site";

/**
 * Transactional email through Resend's REST API.
 *
 * Called over plain fetch rather than the SDK — it is one endpoint, and this
 * keeps the dependency out of the bundle.
 *
 * Everything is gated on RESEND_API_KEY and EMAIL_FROM. With either missing,
 * `sendEmail` reports "skipped" and callers carry on: a store that cannot
 * send email must still be able to take and ship orders. Nothing here ever
 * throws into a webhook or an admin action.
 *
 * Setup:
 *   1. resend.com -> API Keys -> create one -> RESEND_API_KEY in Vercel.
 *   2. Verify your sending domain (Resend -> Domains). Until a domain is
 *      verified Resend only delivers to your own address.
 *   3. EMAIL_FROM, e.g. "TapLink <orders@yourdomain.com>". It must be on the
 *      verified domain — a gmail.com from-address will be rejected.
 */

export const emailConfigured = Boolean(
  process.env.RESEND_API_KEY && process.env.EMAIL_FROM,
);

interface SendArgs {
  to: string;
  subject: string;
  /** Plain-text body. Wrapped into simple HTML for clients that prefer it. */
  body: string;
}

type SendResult = "sent" | "skipped" | "failed";

export async function sendEmail({
  to,
  subject,
  body,
}: SendArgs): Promise<SendResult> {
  if (!emailConfigured) return "skipped";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return "skipped";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        reply_to: site.email,
        subject,
        text: body,
        html: toHtml(body),
      }),
    });
    if (!res.ok) {
      console.error("Resend rejected the email:", res.status, await res.text());
      return "failed";
    }
    return "sent";
  } catch (e) {
    console.error("Could not reach Resend:", e);
    return "failed";
  }
}

/**
 * Minimal HTML wrapper around the plain-text body. Deliberately plain: a
 * simple message from a real address lands in inboxes far more reliably than
 * an image-heavy template from a young sending domain.
 */
function toHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;max-width:520px">
<p style="white-space:pre-wrap;margin:0">${escaped}</p>
</div>`;
}

/** Money in the store currency, for email bodies. */
export function money(amount: number): string {
  return new Intl.NumberFormat(site.currency.locale, {
    style: "currency",
    currency: site.currency.code,
  }).format(amount);
}
