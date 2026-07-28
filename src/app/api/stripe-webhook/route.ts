import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  claimStripeEvent,
  decrementStock,
  incrementStock,
  logOrder,
  markOrderRefunded,
} from "@/lib/adminStore";
import { LOW_STOCK, products } from "@/lib/products";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

/**
 * Keeps the store in sync with Stripe.
 *
 * - checkout.session.completed: subtracts the order's quantity from the
 *   shared card pool (stock bars/buy buttons update immediately), logs the
 *   order for the dashboard, and emails a low-stock alert when the pool
 *   crosses the LOW_STOCK threshold (needs RESEND_API_KEY +
 *   LOW_STOCK_ALERT_EMAIL, otherwise skipped silently).
 * - charge.refunded (full refunds only): adds the quantity back to the pool
 *   and flags the order refunded in the log. Partial refunds are left for a
 *   manual stock adjustment in the dashboard.
 *
 * Every event id is claimed in the store first, so Stripe's retries and
 * duplicate deliveries can never subtract stock twice.
 *
 * Setup (one time, in the Stripe dashboard):
 *   Developers > Webhooks > Add endpoint
 *   URL:    https://<your-domain>/api/stripe-webhook
 *   Events: checkout.session.completed, charge.refunded
 * Then copy the endpoint's signing secret into the STRIPE_WEBHOOK_SECRET
 * environment variable in Vercel and redeploy.
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(key);
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature ?? "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Exactly-once: retried/duplicate deliveries are acknowledged but ignored.
  if (!(await claimStripeEvent(event.id))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handlePaidOrder(stripe, event.data.object);
    } else if (event.type === "charge.refunded") {
      await handleRefund(stripe, event.data.object);
    }
  } catch (e) {
    // Log and acknowledge: Stripe retries on non-2xx, and a sync hiccup
    // should not make Stripe flag the endpoint as failing forever.
    console.error(`Webhook handling failed for ${event.type}:`, e);
  }

  return NextResponse.json({ received: true });
}

/** Parse the compact "id:qty,id:qty" metadata into a {id: qty} map. */
function parseProductQtys(raw: string | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const part of raw.split(",")) {
    const [id, q] = part.split(":");
    const n = Math.max(0, Math.round(Number(q)));
    if (id && Number.isFinite(n) && n > 0) out[id] = (out[id] ?? 0) + n;
  }
  return out;
}

async function handlePaidOrder(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const quantity = lineItems.data.reduce(
    (sum, li) => sum + (li.quantity ?? 0),
    0,
  );

  // Decrement each product's own stock from the compact metadata map.
  const qtys = parseProductQtys(session.metadata?.product_qtys);
  for (const [pid, q] of Object.entries(qtys)) {
    const { previous, next } = await decrementStock(pid, q);
    // Alert exactly once, on the crossing into low territory.
    if (previous > LOW_STOCK && next <= LOW_STOCK) {
      await sendLowStockAlert(pid, next);
    }
  }

  await logOrder({
    id: session.id,
    at: Date.now(),
    email: session.customer_details?.email ?? null,
    total: (session.amount_total ?? 0) / 100,
    quantity,
    items: lineItems.data.map(
      (li) => `${li.description ?? "Card"} ×${li.quantity ?? 1}`,
    ),
    preorder: Boolean(session.metadata?.preorder),
  });

  // Branded order confirmation with the invoice links. Fails soft: the
  // customer still gets Stripe's own invoice email if this one can't send.
  try {
    await sendOrderInvoiceEmail(stripe, session, lineItems.data);
  } catch (e) {
    console.error("Order invoice email failed:", e);
  }
}

/**
 * Emails the customer a branded order confirmation with their line items,
 * totals, and links to the Stripe-hosted invoice page + PDF. Sent via
 * Resend; a no-op until RESEND_API_KEY is configured. ORDER_FROM_EMAIL
 * (falling back to ALERT_FROM_EMAIL) sets a verified sender.
 */
async function sendOrderInvoiceEmail(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = session.customer_details?.email;
  if (!apiKey || !to) return;

  // The invoice finalizes right after payment; fetch its links if it exists.
  let invoiceUrl: string | null = null;
  let invoicePdf: string | null = null;
  let invoiceNumber: string | null = null;
  if (session.invoice) {
    const invoice =
      typeof session.invoice === "string"
        ? await stripe.invoices.retrieve(session.invoice)
        : session.invoice;
    invoiceUrl = invoice.hosted_invoice_url ?? null;
    invoicePdf = invoice.invoice_pdf ?? null;
    invoiceNumber = invoice.number ?? null;
  }

  // Format in the store currency (e.g. "CA$34.99") to match the site.
  const money = (cents: number) => formatPrice(cents / 100);
  const preorder = Boolean(session.metadata?.preorder);
  const reference = invoiceNumber ?? session.id.slice(-8).toUpperCase();

  const rows = lineItems
    .map(
      (li) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#171717;">
            ${escapeHtml(li.description ?? "NFC card")}
            ${li.quantity && li.quantity > 1 ? ` <span style="color:#a3a3a3;">×${li.quantity}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#171717;text-align:right;white-space:nowrap;">
            ${money(li.amount_total ?? 0)}
          </td>
        </tr>`,
    )
    .join("");

  const discount = session.total_details?.amount_discount ?? 0;
  const shippingCents = session.total_details?.amount_shipping ?? 0;

  const html = `
  <div style="background:#f5f5f5;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#171717;padding:20px 28px;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:800;">${escapeHtml(site.name)}</p>
      </div>
      <div style="padding:28px;">
        <p style="margin:0;font-size:20px;font-weight:800;color:#171717;">Thanks for your order!</p>
        <p style="margin:8px 0 0;font-size:14px;color:#525252;">
          Invoice ${escapeHtml(reference)}${preorder ? " · Pre-order (ships in 2-3 weeks, in order placed)" : ""}
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">${rows}
          <tr>
            <td style="padding:10px 0 2px;font-size:13px;color:#525252;">Subtotal</td>
            <td style="padding:10px 0 2px;font-size:13px;color:#525252;text-align:right;">${money(session.amount_subtotal ?? 0)}</td>
          </tr>
          ${
            discount > 0
              ? `<tr><td style="padding:2px 0;font-size:13px;color:#059669;">Discount</td><td style="padding:2px 0;font-size:13px;color:#059669;text-align:right;">-${money(discount)}</td></tr>`
              : ""
          }
          <tr>
            <td style="padding:2px 0;font-size:13px;color:#525252;">Shipping</td>
            <td style="padding:2px 0;font-size:13px;color:#525252;text-align:right;">${shippingCents === 0 ? "Free" : money(shippingCents)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:16px;font-weight:800;color:#171717;border-top:1px solid #e5e5e5;">Total paid</td>
            <td style="padding:10px 0;font-size:16px;font-weight:800;color:#171717;text-align:right;border-top:1px solid #e5e5e5;">${money(session.amount_total ?? 0)}</td>
          </tr>
        </table>
        ${
          invoiceUrl || invoicePdf
            ? `<div style="margin-top:20px;">
                ${invoiceUrl ? `<a href="${invoiceUrl}" style="display:inline-block;background:#171717;color:#ffffff;font-size:14px;font-weight:700;padding:10px 18px;border-radius:6px;text-decoration:none;">View invoice</a>` : ""}
                ${invoicePdf ? `<a href="${invoicePdf}" style="display:inline-block;margin-left:8px;color:#171717;font-size:14px;font-weight:700;padding:10px 18px;border:1px solid #d4d4d4;border-radius:6px;text-decoration:none;">Download PDF</a>` : ""}
              </div>`
            : ""
        }
        <p style="margin:24px 0 0;font-size:12px;color:#a3a3a3;">
          ${site.guaranteeDays} days of free maintenance on every order — if anything is wrong, we correct it free.
          Questions? Reply to this email or write to ${escapeHtml(site.email)}.
        </p>
      </div>
    </div>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.ORDER_FROM_EMAIL ??
        process.env.ALERT_FROM_EMAIL ??
        "TapLink Orders <onboarding@resend.dev>",
      to: [to],
      reply_to: site.email,
      subject: `Your ${site.name} order is confirmed (${reference})`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Order invoice email failed:", res.status);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function handleRefund(stripe: Stripe, charge: Stripe.Charge) {
  // Only fully-refunded charges restock automatically; partial refunds are
  // a judgement call best made by hand in the dashboard.
  if (!charge.refunded || !charge.payment_intent) return;

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: String(charge.payment_intent),
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session) return;

  // Restock each product from the order's per-product quantity metadata.
  const qtys = parseProductQtys(session.metadata?.product_qtys);
  for (const [pid, q] of Object.entries(qtys)) {
    await incrementStock(pid, q);
  }
  await markOrderRefunded(session.id);
}

/**
 * Low-stock email via Resend's REST API. No-op until RESEND_API_KEY and
 * LOW_STOCK_ALERT_EMAIL are configured. ALERT_FROM_EMAIL optionally sets a
 * verified sender; Resend's onboarding sender works for testing.
 */
async function sendLowStockAlert(productId: string, stock: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LOW_STOCK_ALERT_EMAIL;
  if (!apiKey || !to) return;

  const name = products.find((p) => p.id === productId)?.name ?? productId;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL ?? "TapLink Stock <onboarding@resend.dev>",
      to: [to],
      subject: `Low stock: ${name} — ${stock} left`,
      text:
        `${name} is down to ${stock}. ` +
        `Time to reorder.\n\n` +
        `Update stock: ${site.url}/admin-dashboard`,
    }),
  });
  if (!res.ok) {
    console.error("Low-stock alert email failed:", res.status);
  }
}
