import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Order lookup for the post-payment success page.
 *
 * GET /api/checkout/session?session_id=cs_...
 *
 * Returns a sanitized summary of the paid Checkout Session: the line items
 * with their full configuration, the money breakdown, and the Stripe
 * invoice links (hosted page + PDF) once the invoice has finalized —
 * finalization can lag the redirect by a second or two, so the success page
 * polls briefly while `paid` is true but `invoice` is still null.
 *
 * The session id itself is the access token here: it is unguessable, only
 * ever handed to the buyer by Stripe's redirect, and looking it up reveals
 * only that buyer's own order.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Payments not configured (demo flow): nothing to look up.
    return NextResponse.json({ demo: true });
  }

  const stripe = new Stripe(key);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "invoice"],
    });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const paid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";

  const lines = (session.line_items?.data ?? []).map((li) => {
    const product =
      li.price?.product && typeof li.price.product === "object"
        ? (li.price.product as Stripe.Product)
        : null;
    return {
      name: product?.name ?? li.description ?? "NFC card",
      // The configuration string built by /api/checkout
      // ("Routing: … · design · note · pre-order price").
      description: product?.description ?? null,
      quantity: li.quantity ?? 1,
      amountTotal: (li.amount_total ?? 0) / 100,
    };
  });

  const invoice =
    session.invoice && typeof session.invoice === "object"
      ? (session.invoice as Stripe.Invoice)
      : null;
  const invoiceReady = Boolean(invoice?.hosted_invoice_url);

  return NextResponse.json({
    paid,
    email: session.customer_details?.email ?? null,
    name: session.customer_details?.name ?? null,
    currency: (session.currency ?? "cad").toUpperCase(),
    amountSubtotal: (session.amount_subtotal ?? 0) / 100,
    amountDiscount: (session.total_details?.amount_discount ?? 0) / 100,
    amountShipping: (session.total_details?.amount_shipping ?? 0) / 100,
    amountTotal: (session.amount_total ?? 0) / 100,
    preorder: Boolean(session.metadata?.preorder),
    lines,
    invoice: invoiceReady
      ? {
          number: invoice?.number ?? null,
          hostedUrl: invoice?.hosted_invoice_url ?? null,
          pdfUrl: invoice?.invoice_pdf ?? null,
        }
      : null,
    // Short human reference even before the invoice number exists.
    reference: sessionId.slice(-8).toUpperCase(),
  });
}
