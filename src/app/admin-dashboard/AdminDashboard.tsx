"use client";

import { useEffect, useState } from "react";
import { Lock, LogOut, Package, Tag, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Owner dashboard behind /admin-dashboard. Password wall with Apple-style
 * escalating IP lockout (enforced server-side); inside: the shared card
 * stock (all products are the same card) and the pre-order toggle. Saving
 * commits src/data/store-state.json, which redeploys the site.
 */

type Phase = "loading" | "login" | "dashboard";

export function AdminDashboard() {
  const [phase, setPhase] = useState<Phase>("loading");

  // Login state
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  // Dashboard state
  const [hasStock, setHasStock] = useState(true);
  const [cardStock, setCardStock] = useState(0);
  const [preorderEnabled, setPreorderEnabled] = useState(true);
  const [persistence, setPersistence] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [saveError, setSaveError] = useState("");

  const lockedSecs = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  useEffect(() => {
    fetch("/api/admin/state")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        applyState(data);
        setPhase("dashboard");
      })
      .catch(() => setPhase("login"));
  }, []);

  function applyState(data: {
    cardStock: number;
    preorderEnabled: boolean;
    persistence: string;
  }) {
    setCardStock(data.cardStock);
    setHasStock(data.cardStock > 0);
    setPreorderEnabled(data.preorderEnabled);
    setPersistence(data.persistence);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || lockedSecs > 0) return;
    setSubmitting(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPassword("");
        const state = await fetch("/api/admin/state").then((r) => r.json());
        applyState(state);
        setPhase("dashboard");
      } else if (res.status === 429 && data.remainingMs) {
        setLockUntil(Date.now() + data.remainingMs);
        setLoginError("Too many wrong attempts.");
      } else if (res.status === 401) {
        setLoginError(
          typeof data.attemptsLeft === "number" && data.attemptsLeft <= 5
            ? `Wrong password. ${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? "" : "s"} left before lockout.`
            : "Wrong password.",
        );
      } else {
        setLoginError(data.error ?? "Login failed. Try again.");
      }
    } catch {
      setLoginError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveNote("");
    setSaveError("");
    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preorderEnabled,
          cardStock: hasStock ? cardStock : 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaveNote(data.note ?? "Saved.");
      } else {
        setSaveError(data.error ?? "Save failed.");
      }
    } catch {
      setSaveError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setPhase("login");
  }

  if (phase === "loading") {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <p className="text-sm text-neutral-400">Loading…</p>
      </section>
    );
  }

  if (phase === "login") {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
        <form onSubmit={handleLogin} className="card w-full p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-900">
            <Lock className="h-5 w-5 text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-neutral-900">
            Admin access
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter the admin password to manage the store.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            disabled={lockedSecs > 0}
            className="mt-5 w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
          />

          {lockedSecs > 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Locked. Try again in {Math.floor(lockedSecs / 60)}:
              {String(lockedSecs % 60).padStart(2, "0")}
            </p>
          ) : loginError ? (
            <p className="mt-3 text-sm font-semibold text-amber-600">
              {loginError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || lockedSecs > 0 || !password}
            className="mt-5 w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-neutral-900">
            Store admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Stock and pre-order controls. Saving publishes the change to the
            live site.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>

      {/* Stock */}
      <div className="card mt-8 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
            <Package className="h-5 w-5 text-neutral-900" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-neutral-900">
              Card stock
            </h2>
            <p className="text-xs text-neutral-500">
              One shared pool. Every product is the same card, just programmed
              differently.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasStock(true)}
            className={cn(
              "rounded-md border-2 p-4 text-left transition-all",
              hasStock
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            <p className="font-bold text-neutral-900">Has stock</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Cards available to ship
            </p>
          </button>
          <button
            onClick={() => setHasStock(false)}
            className={cn(
              "rounded-md border-2 p-4 text-left transition-all",
              !hasStock
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            <p className="font-bold text-neutral-900">Out of stock</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Shows &ldquo;out of stock&rdquo; on every product
            </p>
          </button>
        </div>

        {hasStock && (
          <label className="mt-4 block">
            <span className="text-sm font-bold text-neutral-900">
              How many cards do we have?
            </span>
            <input
              type="number"
              min={0}
              max={9999}
              value={cardStock}
              onChange={(e) =>
                setCardStock(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              className="mt-2 w-40 rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
            <span className="ml-3 text-xs text-neutral-400">
              Paid Stripe orders subtract from this automatically once the
              webhook is set up.
            </span>
          </label>
        )}
      </div>

      {/* Pre-order */}
      <div className="card mt-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
              <Tag className="h-5 w-5 text-violet-600" />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold text-neutral-900">
                Pre-order window
              </h2>
              <p className="text-xs text-neutral-500">
                While on, 20% comes off every cart and pre-order labels show
                site-wide.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPreorderEnabled((v) => !v)}
            role="switch"
            aria-checked={preorderEnabled}
            className={cn(
              "relative h-7 w-12 flex-shrink-0 rounded-md transition-colors",
              preorderEnabled ? "bg-violet-600" : "bg-neutral-300",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-sm bg-white shadow transition-all",
                preorderEnabled ? "left-6" : "left-1",
              )}
            />
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-neutral-700">
          Pre-order is{" "}
          <span className={preorderEnabled ? "text-violet-600" : "text-neutral-500"}>
            {preorderEnabled ? "ON" : "OFF"}
          </span>
        </p>
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Publishing…" : "Save & publish"}
        </button>
        {saveNote && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <Check className="h-4 w-4" /> {saveNote}
          </p>
        )}
        {saveError && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <AlertTriangle className="h-4 w-4" /> {saveError}
          </p>
        )}
      </div>

      {persistence === "none" && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
          Heads up: GITHUB_TOKEN is not configured, so saving will fail. Add a
          fine-grained GitHub token (contents read/write on this repo) in
          Vercel&apos;s environment variables.
        </p>
      )}
    </section>
  );
}
