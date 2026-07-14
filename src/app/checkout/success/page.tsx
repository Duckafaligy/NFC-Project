"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  ReceiptText,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ButtonLink } from "@/components/Button";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

/**
 * Landing page after a successful Stripe payment.
 * Stripe redirects here with ?session_id=..., which we use to fetch the
 * order from /api/checkout/session and render a full on-page invoice:
 * every line with its configuration, the money breakdown, and links to
 * Stripe's hosted invoice page and PDF. The invoice finalizes a moment
 * after payment, so we poll briefly until the links are ready.
 */

interface OrderLine {
  name: string;
  description: string | null;
  quantity: number;
  amountTotal: number;
}

interface OrderSummary {
  paid: boolean;
  email: string | null;
  name: string | null;
  currency: string;
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTotal: number;
  preorder: boolean;
  lines: OrderLine[];
  invoice: {
    number: string | null;
    hostedUrl: string | null;
    pdfUrl: string | null;
  } | null;
  reference: string;
  demo?: boolean;
}

const INVOICE_POLL_MS = 2500;
const INVOICE_POLL_MAX = 6;

function SuccessContent() {
  const { clear } = useCart();
  const sessionId = useSearchParams().get("session_id");

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const polls = useRef(0);

  // The order is paid (or this is the demo flow). Empty the local cart.
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId!)}`,
        );
        if (!res.ok) throw new Error("lookup failed");
        const data = (await res.json()) as OrderSummary;
        if (cancelled) return;
        setOrder(data);
        // Paid but the invoice hasn't finalized yet: check again shortly.
        if (data.paid && !data.invoice && polls.current < INVOICE_POLL_MAX) {
          polls.current += 1;
          timer = setTimeout(load, INVOICE_POLL_MS);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const showInvoice = Boolean(sessionId) && !failed && !order?.demo;
  const loading = showInvoice && !order;

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-neutral-900">
          Payment received, you&apos;re all set
        </h1>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          {order?.email ? (
            <>
              Your invoice is on its way to{" "}
              <strong className="text-neutral-900">{order.email}</strong>.
            </>
          ) : (
            "A receipt is on its way to your email."
          )}{" "}
          {order?.preorder
            ? `${site.preorder.shipNote}.`
            : `Standard orders ship within ${site.shipping.handlingDays}.`}{" "}
          If you ordered a custom design, we&apos;ll email you a proof to
          approve before anything gets printed.
        </p>
      </div>

      {/* On-page invoice */}
      {showInvoice && (
        <div className="card mt-10 overflow-hidden p-0 text-left">
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-6 py-3">
            <ReceiptText className="h-4 w-4 text-neutral-500" />
            <p className="text-sm font-bold text-neutral-900">
              {order?.invoice?.number
                ? `Invoice ${order.invoice.number}`
                : `Order ${order?.reference ?? ""}`}
            </p>
            {order?.preorder && (
              <span className="rounded-sm bg-violet-100 px-1.5 py-0.5 text-[11px] font-bold text-violet-700">
                Pre-order
              </span>
            )}
            {order?.email && (
              <span className="ml-auto hidden items-center gap-1 text-xs text-neutral-400 sm:flex">
                <Mail className="h-3.5 w-3.5" /> {order.email}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3 px-6 py-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-neutral-100"
                  style={{ width: `${80 - i * 15}%` }}
                />
              ))}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-neutral-100">
                {order?.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-4 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-900">
                        {line.name}
                        {line.quantity > 1 && (
                          <span className="ml-1.5 font-semibold text-neutral-400">
                            ×{line.quantity}
                          </span>
                        )}
                      </p>
                      {line.description && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {line.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
                      {formatPrice(line.amountTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-2 border-t border-neutral-200 px-6 py-4 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(order?.amountSubtotal ?? 0)}</dd>
                </div>
                {(order?.amountDiscount ?? 0) > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <dt>Discount</dt>
                    <dd>-{formatPrice(order?.amountDiscount ?? 0)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <dt>Shipping</dt>
                  <dd>
                    {(order?.amountShipping ?? 0) === 0
                      ? "Free"
                      : formatPrice(order?.amountShipping ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-extrabold text-neutral-900">
                  <dt>Total paid</dt>
                  {/* formatPrice already renders the currency (e.g. "CA$42.98"). */}
                  <dd>{formatPrice(order?.amountTotal ?? 0)}</dd>
                </div>
              </dl>

              <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                {order?.invoice ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {order.invoice.hostedUrl && (
                      <a
                        href={order.invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-700"
                      >
                        <ExternalLink className="h-4 w-4" /> View invoice
                      </a>
                    )}
                    {order.invoice.pdfUrl && (
                      <a
                        href={order.invoice.pdfUrl}
                        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-500"
                      >
                        <Download className="h-4 w-4" /> Download PDF
                      </a>
                    )}
                    <span className="text-xs text-neutral-400">
                      Also sent to your email.
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">
                    Your invoice is being generated — it will arrive by email
                    in a moment{order?.email ? ` at ${order.email}` : ""}.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <ButtonLink href="/products">Keep shopping</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        {site.guaranteeDays} days of free maintenance on every order. Questions?{" "}
        <a href={`mailto:${site.email}`} className="underline">
          {site.email}
        </a>
      </p>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  // useSearchParams needs a Suspense boundary for prerendering.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
          Loading your order…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
