"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Lock,
  LogOut,
  Package,
  ReceiptText,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { Button } from "@/components/Button";

/**
 * /admin-dashboard — password-walled store controls.
 * Login is rate limited per IP (10 fails -> 1 min lock, escalating 5/15/60).
 * Inside: a pre-order toggle and ONE shared stock count (every product is
 * the same physical card, just programmed differently). Changes apply to
 * the storefront immediately (stock bars, buy buttons, checkout pricing).
 */

interface ShipTo {
  name: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface OrderRecord {
  id: string;
  at: number;
  email: string | null;
  total: number;
  quantity: number;
  items: string[];
  preorder: boolean;
  refunded?: boolean;
  shipTo?: ShipTo;
  shippingPaid?: number;
  shippingMethod?: string | null;
  fulfilledAt?: number;
  trackingNumber?: string | null;
}

/**
 * Address as you'd write it on a label. Returns null when there is nothing
 * usable, so the UI can say so rather than render an empty box.
 */
function formatShipTo(s: ShipTo | undefined): string | null {
  if (!s || !s.line1) return null;
  const cityLine = [s.city, s.state, s.postalCode].filter(Boolean).join(" ");
  return [s.name, s.line1, s.line2, cityLine, s.country]
    .filter(Boolean)
    .join("\n");
}

interface AdminState {
  settings: {
    preorder: boolean | null;
    preorderEndsAt: number | null;
  };
  defaults: { preorder: boolean; cardStock: number };
  products: ProductPrice[];
  orders: OrderRecord[];
  persistentStore: boolean;
  defaultPassword: boolean;
  webhookConfigured: boolean;
  stripeConfigured: boolean;
  stripeLiveMode: boolean;
}

interface ProductPrice {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  /** null = custom option disabled for this product. */
  customUpcharge: number | null;
  defaultBasePrice: number;
  defaultCustomUpcharge: number | null;
  stock: number;
  defaultStock: number;
  preorder: boolean;
}

/** ms epoch -> value for <input type="date"> in the viewer's timezone. */
function msToDateInput(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Date input value -> end of that day (local time) in ms, or null. */
function dateInputToMs(value: string): number | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59).getTime();
}

type View = "loading" | "login" | "dashboard";

export function AdminDashboard() {
  const [view, setView] = useState<View>("loading");
  const [state, setState] = useState<AdminState | null>(null);

  // Login state
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Dashboard state
  const [preorder, setPreorder] = useState(true);
  const [preorderEnds, setPreorderEnds] = useState("");
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [preorderEdits, setPreorderEdits] = useState<Record<string, boolean>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState(false);
  // Per-product price editor: standard = base price, custom = price with the
  // customer's own branding (base + upcharge). Both entered in dollars.
  const [priceEdits, setPriceEdits] = useState<
    Record<string, { standard: number; custom: number | null }>
  >({});

  const loadState = useCallback(async () => {
    const res = await fetch("/api/admin/state");
    if (res.status === 401) {
      setView("login");
      return;
    }
    const data = (await res.json()) as AdminState;
    setState(data);
    setPreorder(data.settings.preorder ?? data.defaults.preorder);
    setPreorderEnds(msToDateInput(data.settings.preorderEndsAt));
    const edits: Record<string, { standard: number; custom: number | null }> =
      {};
    const stocks: Record<string, number> = {};
    const preorders: Record<string, boolean> = {};
    for (const p of data.products) {
      edits[p.id] = {
        standard: p.basePrice,
        custom:
          p.customUpcharge == null
            ? null
            : Math.round((p.basePrice + p.customUpcharge) * 100) / 100,
      };
      stocks[p.id] = p.stock;
      preorders[p.id] = p.preorder;
    }
    setPriceEdits(edits);
    setStockEdits(stocks);
    setPreorderEdits(preorders);
    setView("dashboard");
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Lockout countdown ticker.
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const id = setInterval(
      () => setLockSeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [lockSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (lockSeconds > 0) return;
    setSubmitting(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassword("");
        await loadState();
        return;
      }
      if (res.status === 429) {
        setLockSeconds(Number(data.retryAfter) || 60);
        setLoginError("");
      } else {
        setAttemptsLeft(data.attemptsLeft ?? null);
        setLoginError("Wrong password.");
      }
    } catch {
      setLoginError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Convert the editor's standard/custom dollars into base + upcharge.
      const prices: Record<
        string,
        { basePrice: number; customUpcharge: number | null }
      > = {};
      for (const p of state?.products ?? []) {
        const e = priceEdits[p.id];
        if (!e) continue;
        prices[p.id] = {
          basePrice: e.standard,
          // Empty custom price = custom option disabled.
          customUpcharge:
            e.custom == null
              ? null
              : Math.max(0, Math.round((e.custom - e.standard) * 100) / 100),
        };
      }
      await fetch("/api/admin/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preorder,
          stock: stockEdits,
          productPreorder: preorderEdits,
          preorderEndsAt: preorder ? dateInputToMs(preorderEnds) : null,
          prices,
        }),
      });
      setSavedAt(Date.now());
      await loadState();
    } finally {
      setSaving(false);
    }
  }

  async function handleStripeSync() {
    setSyncing(true);
    setSyncMessage("");
    setSyncError(false);
    try {
      const res = await fetch("/api/admin/stripe-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed.");

      // Report every kind of change, so it's clear what the button did.
      const parts: string[] = [];
      if (data.productsCreated) parts.push(`${data.productsCreated} product(s) created`);
      if (data.productsUpdated) parts.push(`${data.productsUpdated} updated`);
      if (data.pricesCreated) parts.push(`${data.pricesCreated} price(s) created`);
      if (data.pricesArchived) parts.push(`${data.pricesArchived} old price(s) archived`);
      if (data.shippingRatesCreated)
        parts.push(`${data.shippingRatesCreated} shipping rate(s) created`);
      const mode = data.liveMode ? "LIVE" : "test";
      setSyncMessage(
        parts.length > 0
          ? `Synced to ${mode} mode (${data.currency}): ${parts.join(", ")}.`
          : `Already in sync — ${mode} mode catalog, prices and shipping rates all match.`,
      );
    } catch (err) {
      setSyncError(true);
      setSyncMessage(
        err instanceof Error ? err.message : "Sync failed. Try again.",
      );
    } finally {
      setSyncing(false);
    }
  }

  /** Mark an order dispatched (or undo), then refresh the log. */
  async function markShipped(id: string, fulfilled: boolean) {
    setFulfilling(id);
    try {
      await fetch("/api/admin/fulfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          fulfilled,
          tracking: fulfilled ? (trackingDraft[id] ?? "") : "",
        }),
      });
      await loadState();
    } finally {
      setFulfilling(null);
    }
  }

  async function copyAddress(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // Clipboard blocked (insecure context) — the address is on screen.
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setView("login");
  }

  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (view === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-400">
        Loading…
      </div>
    );
  }

  /* ---------- LOGIN WALL ---------- */
  if (view === "login") {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <div className="card p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-neutral-900">
            <Lock className="h-6 w-6 text-white" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-neutral-900">
            Admin access
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            This area is for the store owner.
          </p>

          {lockSeconds > 0 ? (
            <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <Clock className="h-4 w-4" /> Too many attempts
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Try again in{" "}
                <span className="font-mono font-bold tabular-nums">
                  {mmss(lockSeconds)}
                </span>
                . Repeated failures extend the lock.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              {loginError && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {loginError}
                  {attemptsLeft !== null && attemptsLeft <= 5 && (
                    <span className="text-neutral-500">
                      ({attemptsLeft} attempts before lockout)
                    </span>
                  )}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Checking…" : "Unlock"}
              </Button>
            </form>
          )}
        </div>
      </section>
    );
  }

  /* ---------- DASHBOARD ---------- */
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Store controls</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-neutral-900">
            Admin dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 hover:border-neutral-500 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {state?.defaultPassword && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            You are using the default password. Set{" "}
            <code className="rounded bg-amber-100 px-1 font-mono">
              ADMIN_PASSWORD
            </code>{" "}
            in Vercel → Settings → Environment Variables, then redeploy.
          </span>
        </div>
      )}
      {state && !state.persistentStore && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            No KV storage connected: changes reset on redeploy or cold start.
            Add &ldquo;Upstash for Redis&rdquo; in Vercel (Storage tab) to make
            them permanent.
          </span>
        </div>
      )}

      {/* Connections: what the server can actually see right now */}
      {state && (
        <div className="card mt-6 p-6">
          <p className="text-sm font-bold text-neutral-900">Connections</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            What this deployment can see. If something you configured shows
            red, check the env var is in the Production environment and
            redeploy.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              {
                ok: state.stripeConfigured,
                label: state.stripeConfigured
                  ? `Stripe payments (${state.stripeLiveMode ? "LIVE mode" : "test mode"})`
                  : "Stripe payments",
                hint: state.stripeConfigured
                  ? "Checkout opens Stripe's payment page."
                  : "STRIPE_SECRET_KEY not detected — checkout uses the test-order fallback.",
              },
              {
                ok: state.webhookConfigured,
                label: "Stripe webhook (stock sync)",
                hint: state.webhookConfigured
                  ? "Paid orders subtract stock; refunds restock."
                  : "STRIPE_WEBHOOK_SECRET not detected — stock won't move on orders.",
              },
              {
                ok: state.persistentStore,
                label: "KV storage",
                hint: state.persistentStore
                  ? "Settings and orders survive redeploys."
                  : "Not connected — settings reset on redeploy.",
              },
            ].map((c) => (
              <li
                key={c.label}
                className="flex items-start gap-2 rounded-md bg-neutral-50 p-3"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm ${
                    c.ok ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  {c.ok ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : (
                    <AlertTriangle className="h-2.5 w-2.5 text-white" />
                  )}
                </span>
                <span>
                  <span className="block text-xs font-bold text-neutral-900">
                    {c.label}
                  </span>
                  <span className="block text-[11px] text-neutral-500">
                    {c.hint}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pre-order toggle */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-extrabold text-neutral-900">
              Pre-order window
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              The default pre-order state and 20% discount. Override any product
              individually in Stock &amp; pre-order below. The auto-end date
              still switches every pre-order product off.
            </p>
          </div>
          <button
            onClick={() => setPreorder((v) => !v)}
            className={`relative h-8 w-14 flex-shrink-0 rounded-md transition-colors ${
              preorder ? "bg-violet-600" : "bg-neutral-300"
            }`}
            aria-pressed={preorder}
            aria-label="Toggle pre-order"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-sm bg-white shadow-soft transition-all ${
                preorder ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        {preorder && (
          <label className="mt-4 block border-t border-neutral-100 pt-4">
            <span className="text-sm font-bold text-neutral-900">
              Auto-end date (optional)
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={preorderEnds}
                onChange={(e) => setPreorderEnds(e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              {preorderEnds && (
                <button
                  onClick={() => setPreorderEnds("")}
                  className="text-xs font-bold text-neutral-500 underline hover:text-neutral-900"
                >
                  Clear
                </button>
              )}
              <span className="text-xs text-neutral-400">
                Pre-order switches off by itself at the end of that day. Leave
                empty to keep it on until you flip the toggle.
              </span>
            </div>
          </label>
        )}
      </div>

      {/* Per-product stock */}
      {state && state.products.length > 0 && (
        <div className="card mt-4 p-6">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-neutral-500" />
            <p className="text-sm font-bold text-neutral-900">
              Stock &amp; pre-order
            </p>
            <p className="ml-auto text-xs text-neutral-400">
              Quantity · pre-order per product · 0 = out of stock
            </p>
          </div>
          <div className="mt-4 space-y-2.5">
            {state.products.map((p) => {
              const qty = stockEdits[p.id] ?? p.stock;
              const po = preorderEdits[p.id] ?? p.preorder;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {qty <= 0
                        ? "Out of stock"
                        : qty <= 10
                          ? `Low — ${qty} left`
                          : `${qty} in stock`}
                      {po ? " · pre-order" : ""}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreorderEdits((prev) => ({ ...prev, [p.id]: !po }))
                      }
                      aria-pressed={po}
                      className={`flex items-center gap-1 rounded-md border px-2.5 py-2 text-xs font-bold transition-colors ${
                        po
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-neutral-300 bg-white text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" /> Pre-order
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      value={qty}
                      onChange={(e) =>
                        setStockEdits((prev) => ({
                          ...prev,
                          [p.id]: Math.max(
                            0,
                            Math.floor(Number(e.target.value) || 0),
                          ),
                        }))
                      }
                      className="w-20 rounded-md border border-neutral-300 px-3 py-2 text-right text-sm font-semibold text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            Pre-order applies the discount and a &ldquo;Pre-order&rdquo; badge to
            that product only.{" "}
            {state?.webhookConfigured
              ? "Paid orders subtract from each product automatically; full refunds add back."
              : "Connect the Stripe webhook (STRIPE_WEBHOOK_SECRET) so paid orders subtract automatically."}
          </p>
        </div>
      )}

      {/* Product prices */}
      {state && state.products.length > 0 && (
        <div className="card mt-4 p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-neutral-500" />
            <p className="text-sm font-bold text-neutral-900">Product prices</p>
            <p className="ml-auto text-xs text-neutral-400">
              In CAD · applies live to the storefront
            </p>
          </div>
          <div className="mt-4 hidden grid-cols-[1fr_6.5rem_6.5rem] gap-3 px-1 text-xs font-semibold text-neutral-400 sm:grid">
            <span>Product</span>
            <span className="text-right">Standard</span>
            <span className="text-right">Custom</span>
          </div>
          <div className="mt-2 space-y-3">
            {state.products.map((p) => {
              const e = priceEdits[p.id] ?? {
                standard: p.basePrice,
                custom:
                  p.customUpcharge == null
                    ? null
                    : p.basePrice + p.customUpcharge,
              };
              const effUpcharge =
                e.custom == null
                  ? null
                  : Math.round((e.custom - e.standard) * 100) / 100;
              const edited =
                e.standard !== p.defaultBasePrice ||
                effUpcharge !== p.defaultCustomUpcharge;
              const setField = (
                field: "standard" | "custom",
                value: number | null,
              ) =>
                setPriceEdits((prev) => ({
                  ...prev,
                  [p.id]: { ...e, [field]: value },
                }));
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-2 items-center gap-3 border-t border-neutral-100 pt-3 sm:grid-cols-[1fr_6.5rem_6.5rem] sm:border-0 sm:pt-0"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {p.category}
                      {e.custom == null ? " · not customizable" : ""}
                      {edited ? " · edited" : ""}
                    </p>
                  </div>
                  {(["standard", "custom"] as const).map((field) => (
                    <label key={field} className="block">
                      <span className="mb-1 block text-xs text-neutral-400 sm:hidden">
                        {field === "standard" ? "Standard" : "Custom (blank = off)"}
                      </span>
                      <div className="flex items-center rounded-md border border-neutral-300 pl-2 focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-200">
                        <span className="text-xs text-neutral-400">$</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={e[field] ?? ""}
                          placeholder={field === "custom" ? "Off" : undefined}
                          onChange={(ev) => {
                            const raw = ev.target.value;
                            if (field === "custom" && raw === "") {
                              setField("custom", null);
                            } else {
                              setField(field, Math.max(0, Number(raw) || 0));
                            }
                          }}
                          className="w-full rounded-md bg-transparent px-1.5 py-2 text-right text-sm font-semibold text-neutral-900 focus:outline-none"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            &ldquo;Standard&rdquo; is the base price; &ldquo;Custom&rdquo; is the
            price with the customer&apos;s own branding. Leave a product&apos;s
            Custom price blank to remove the custom option entirely (it sells as
            standard only). The &ldquo;we design it&rdquo; fee is added on top of
            custom automatically. Changes go live on Save.
          </p>
        </div>
      )}

      {/* Stripe catalog sync */}
      <div className="card mt-4 p-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-neutral-500" />
          <p className="text-sm font-bold text-neutral-900">Stripe catalog</p>
          <p className="ml-auto text-xs text-neutral-400">
            {state?.stripeConfigured
              ? "Payments connected"
              : "STRIPE_SECRET_KEY not set"}
          </p>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Pushes everything Stripe needs into your account: each product with
          its artwork and the prices you set above, plus every shipping bracket
          for Canada and the US. Prices for options you have switched off get
          archived. Safe to run again any time — it only changes what&apos;s out
          of date, and it tells you whether it hit test or live mode.
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Run this after changing any price above, otherwise your Stripe
          dashboard reports the old numbers. Checkout always charges the prices
          set here regardless.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleStripeSync}
            variant="secondary"
            disabled={syncing || !state?.stripeConfigured}
          >
            {syncing ? "Syncing…" : "Sync products to Stripe"}
          </Button>
          {syncMessage && (
            <span
              className={`text-sm font-semibold ${
                syncError ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {syncMessage}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {savedAt > 0 && Date.now() - savedAt < 4000 && (
          <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <Check className="h-4 w-4" /> Saved, live now
          </span>
        )}
      </div>

      {/* Recent orders (logged by the Stripe webhook) */}
      <div className="card mt-8 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-6 py-3">
          <ReceiptText className="h-4 w-4 text-neutral-500" />
          <p className="text-sm font-bold text-neutral-900">Recent orders</p>
          <p className="ml-auto text-xs text-neutral-400">
            Last {state?.orders.length ?? 0} · logged automatically from Stripe
          </p>
        </div>
        {state && state.orders.length > 0 ? (
          <ul className="max-h-[32rem] divide-y divide-neutral-100 overflow-y-auto">
            {state.orders.map((o) => {
              const addr = formatShipTo(o.shipTo);
              return (
                <li key={o.id} className="px-6 py-3.5">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {o.items.join(", ") ||
                          `${o.quantity} card${o.quantity === 1 ? "" : "s"}`}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {new Date(o.at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {o.email ? ` · ${o.email}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {o.preorder && (
                        <span className="rounded-sm bg-violet-100 px-1.5 py-0.5 text-[11px] font-bold text-violet-700">
                          Pre-order
                        </span>
                      )}
                      {o.refunded && (
                        <span className="rounded-sm bg-neutral-200 px-1.5 py-0.5 text-[11px] font-bold text-neutral-600">
                          Refunded
                        </span>
                      )}
                      {o.fulfilledAt && !o.refunded && (
                        <span className="rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          Shipped
                        </span>
                      )}
                      <span
                        className={`text-sm font-bold ${o.refunded ? "text-neutral-400 line-through" : "text-neutral-900"}`}
                      >
                        ${o.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Ship-to block: everything needed to address the parcel. */}
                  {addr ? (
                    <div className="mt-2.5 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex items-start gap-2">
                        <Truck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-line text-xs leading-relaxed text-neutral-700">
                            {addr}
                          </p>
                          <p className="mt-1 text-[11px] text-neutral-400">
                            {o.shipTo?.phone ? `${o.shipTo.phone} · ` : ""}
                            {o.shippingMethod ?? "Shipping"}
                            {typeof o.shippingPaid === "number"
                              ? ` · $${o.shippingPaid.toFixed(2)} collected`
                              : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => copyAddress(o.id, addr)}
                          className="flex-shrink-0 rounded-sm border border-neutral-300 bg-white px-2 py-1 text-[11px] font-bold text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                        >
                          {copiedId === o.id ? "Copied" : "Copy"}
                        </button>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-2.5">
                        {o.fulfilledAt ? (
                          <>
                            <span className="text-[11px] text-neutral-500">
                              Shipped{" "}
                              {new Date(o.fulfilledAt).toLocaleDateString()}
                              {o.trackingNumber
                                ? ` · ${o.trackingNumber}`
                                : ""}
                            </span>
                            <button
                              onClick={() => markShipped(o.id, false)}
                              className="ml-auto text-[11px] font-semibold text-neutral-400 underline hover:text-neutral-700"
                            >
                              Undo
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              value={trackingDraft[o.id] ?? ""}
                              onChange={(e) =>
                                setTrackingDraft((t) => ({
                                  ...t,
                                  [o.id]: e.target.value,
                                }))
                              }
                              placeholder="Tracking number (optional)"
                              className="min-w-0 flex-1 rounded-sm border border-neutral-300 px-2 py-1 text-[11px] focus:border-neutral-500 focus:outline-none"
                            />
                            <button
                              onClick={() => markShipped(o.id, true)}
                              disabled={fulfilling === o.id}
                              className="rounded-sm bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                            >
                              {fulfilling === o.id ? "Saving…" : "Mark shipped"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-neutral-400">
                      No delivery address on this order — it was placed before
                      addresses were logged. Open it in Stripe to ship it.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-sm text-neutral-400">
            No orders logged yet. They appear here automatically once the
            Stripe webhook is connected and the first order comes in.
          </p>
        )}
      </div>
    </section>
  );
}
