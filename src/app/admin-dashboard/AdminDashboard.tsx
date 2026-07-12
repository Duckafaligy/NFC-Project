"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Lock,
  LogOut,
  Package,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/Button";

/**
 * /admin-dashboard — password-walled store controls.
 * Login is rate limited per IP (10 fails -> 1 min lock, escalating 5/15/60).
 * Inside: a pre-order toggle and ONE shared stock count (every product is
 * the same physical card, just programmed differently). Changes apply to
 * the storefront immediately (stock bars, buy buttons, checkout pricing).
 */

interface AdminState {
  settings: { preorder: boolean | null; cardStock: number | null };
  defaults: { preorder: boolean; cardStock: number };
  persistentStore: boolean;
  defaultPassword: boolean;
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
  const [cardStock, setCardStock] = useState(0);
  const [hasStock, setHasStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  const loadState = useCallback(async () => {
    const res = await fetch("/api/admin/state");
    if (res.status === 401) {
      setView("login");
      return;
    }
    const data = (await res.json()) as AdminState;
    setState(data);
    setPreorder(data.settings.preorder ?? data.defaults.preorder);
    const stock = data.settings.cardStock ?? data.defaults.cardStock;
    setCardStock(stock);
    setHasStock(stock > 0);
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
      await fetch("/api/admin/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preorder,
          cardStock: hasStock ? cardStock : 0,
        }),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
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
            Add the free Upstash KV integration in Vercel (Storage tab) to make
            them permanent.
          </span>
        </div>
      )}

      {/* Pre-order toggle */}
      <div className="card mt-6 flex items-center justify-between p-6">
        <div>
          <p className="font-display text-lg font-extrabold text-neutral-900">
            Pre-order window
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            While on, the whole cart is 20% off and buttons say
            &ldquo;Pre-order&rdquo;. Takes effect immediately.
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

      {/* Shared card stock */}
      <div className="card mt-4 p-6">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-neutral-500" />
          <p className="text-sm font-bold text-neutral-900">Card stock</p>
          <p className="ml-auto text-xs text-neutral-400">
            One pool: every product is the same card, programmed differently
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasStock(true)}
            className={`rounded-md border-2 p-4 text-left transition-all ${
              hasStock
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <p className="font-bold text-neutral-900">Has stock</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Cards available to ship
            </p>
          </button>
          <button
            onClick={() => setHasStock(false)}
            className={`rounded-md border-2 p-4 text-left transition-all ${
              !hasStock
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <p className="font-bold text-neutral-900">Out of stock</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Shows &ldquo;out of stock&rdquo;, buying disabled
            </p>
          </button>
        </div>

        {hasStock && (
          <label className="mt-4 block">
            <span className="text-sm font-bold text-neutral-900">
              How many cards do we have?
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100000}
                value={cardStock}
                onChange={(e) =>
                  setCardStock(
                    Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  )
                }
                className="w-32 rounded-md border border-neutral-300 px-3 py-2 text-right text-sm font-semibold text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              <span className="text-xs text-neutral-400">
                Paid Stripe orders subtract from this automatically once the
                webhook is connected.
              </span>
            </div>
          </label>
        )}
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
    </section>
  );
}
