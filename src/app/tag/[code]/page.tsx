"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Check,
  ExternalLink,
  Nfc,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import { TAG_PRESETS } from "@/lib/tagPresets";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

interface TagStatus {
  code: string;
  claimed: boolean;
  owner?: boolean;
  preset?: string;
  label?: string;
  taps?: number;
  destination?: string | null;
}

type View = "loading" | "claim" | "manage" | "taken" | "error";

function TagManager() {
  const params = useParams();
  const code = Array.isArray(params.code) ? params.code[0] : (params.code ?? "");
  // Read the edit token from the URL without needing a Suspense boundary.
  const [token, setToken] = useState("");
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const [view, setView] = useState<View>("loading");
  const [taps, setTaps] = useState(0);
  const [preset, setPreset] = useState<string>("review");
  const [destination, setDestination] = useState("");
  const [label, setLabel] = useState("");
  const [editToken, setEditToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(0);
  const [justActivated, setJustActivated] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/tag/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`,
      );
      const d = (await res.json()) as TagStatus;
      if (!d.claimed) {
        setView("claim");
        return;
      }
      if (d.owner) {
        setPreset(d.preset ?? "review");
        setDestination(d.destination ?? "");
        setLabel(d.label ?? "");
        setTaps(d.taps ?? 0);
        setEditToken(token);
        setView("manage");
        return;
      }
      setView("taken");
    } catch {
      setView("error");
    }
  }, [code, token]);

  useEffect(() => {
    if (code) load();
  }, [code, load]);

  async function activate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/tag/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", preset, destination, label }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Something went wrong.");
        return;
      }
      setEditToken(d.editToken);
      setDestination(d.destination);
      setTaps(0);
      setJustActivated(true);
      // Keep edit access on refresh by putting the token in the URL.
      window.history.replaceState(
        null,
        "",
        `/tag/${encodeURIComponent(code)}?token=${d.editToken}`,
      );
      setView("manage");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/tag/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          token: editToken,
          preset,
          destination,
          label,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Something went wrong.");
        return;
      }
      setDestination(d.destination);
      setSavedAt(Date.now());
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const active = TAG_PRESETS.find((p) => p.id === preset) ?? TAG_PRESETS[0];

  const PresetPicker = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TAG_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setPreset(p.id)}
          className={`rounded-md border-2 px-3 py-2.5 text-left text-sm font-bold transition-all ${
            preset === p.id
              ? "border-neutral-900 bg-neutral-50 text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  const DestinationField = (
    <div className="mt-4">
      <label className="text-sm font-bold text-neutral-900">
        Where should a tap go?
      </label>
      <p className="mt-0.5 text-xs text-neutral-500">{active.help}</p>
      <div className="mt-2 flex items-center rounded-md border border-neutral-300 pl-2.5 focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-200">
        <LinkIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
        <input
          type="url"
          inputMode="url"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={active.placeholder}
          className="w-full rounded-md bg-transparent px-2 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-neutral-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white">
          <Nfc className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-extrabold">{site.name}</span>
      </div>

      {view === "loading" && (
        <div className="card p-8 text-center text-neutral-400">Loading…</div>
      )}

      {view === "error" && (
        <div className="card p-8 text-center">
          <p className="font-bold text-neutral-900">Couldn&apos;t load this tag</p>
          <p className="mt-1 text-sm text-neutral-500">
            Check your connection and refresh.
          </p>
        </div>
      )}

      {view === "taken" && (
        <div className="card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-extrabold text-neutral-900">
            This card is already set up
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Tap it with your phone and it&apos;ll open where its owner pointed
            it. If it&apos;s yours, open it with your edit link.
          </p>
        </div>
      )}

      {view === "claim" && (
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-neutral-900">
            Set up your card
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Pick what this card does and paste your link. You can change it
            anytime — the card never needs reprinting.
          </p>

          <div className="mt-6">
            <label className="text-sm font-bold text-neutral-900">
              What is this card for?
            </label>
            <div className="mt-2">{PresetPicker}</div>
          </div>

          {DestinationField}

          <div className="mt-4">
            <label className="text-sm font-bold text-neutral-900">
              Label <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Front counter"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <AlertTriangle className="h-4 w-4" /> {error}
            </p>
          )}

          <Button
            onClick={activate}
            size="lg"
            className="mt-6 w-full"
            disabled={busy || !destination.trim()}
          >
            {busy ? "Activating…" : "Activate card"}
          </Button>
        </div>
      )}

      {view === "manage" && (
        <div className="card p-6 sm:p-8">
          {justActivated && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Your card is live! Bookmark this page — it&apos;s your private
                link to edit where the card points.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-extrabold text-neutral-900">
              Your card
            </h1>
            <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600">
              {taps} tap{taps === 1 ? "" : "s"}
            </span>
          </div>

          {destination && (
            <a
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-neutral-500 hover:text-neutral-900"
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Opens {destination}</span>
            </a>
          )}

          <div className="mt-6">
            <label className="text-sm font-bold text-neutral-900">Type</label>
            <div className="mt-2">{PresetPicker}</div>
          </div>

          {DestinationField}

          <div className="mt-4">
            <label className="text-sm font-bold text-neutral-900">
              Label <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Front counter"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <AlertTriangle className="h-4 w-4" /> {error}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={save} size="lg" disabled={busy || !destination.trim()}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
            {savedAt > 0 && Date.now() - savedAt < 4000 && (
              <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </div>

          <p className="mt-6 border-t border-neutral-100 pt-4 text-xs text-neutral-400">
            Keep this page bookmarked — it&apos;s the only way to edit this card.
            Anyone tapping the card just gets sent to your link.
          </p>
        </div>
      )}
    </section>
  );
}

export default function TagPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
          Loading…
        </div>
      }
    >
      <TagManager />
    </Suspense>
  );
}
