"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No email backend yet — this simulates a successful send.
    // Wire this to an email service / form endpoint later.
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Let&apos;s <span className="text-gradient">talk</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Questions about products, custom designs, or bulk orders? We usually
          reply within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900 p-5 transition-colors hover:border-white/20"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-semibold text-white">{site.email}</p>
            </div>
          </a>
          <a
            href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900 p-5 transition-colors hover:border-white/20"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="font-semibold text-white">{site.phone}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Bulk & custom</p>
              <p className="font-semibold text-white">
                Ask about volume pricing
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-ink-900 p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <h2 className="mt-4 font-display text-xl font-bold text-white">
                Message sent!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Thanks for reaching out — we&apos;ll get back to you at the email
                you provided shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Name</span>
                  <input
                    required
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Email</span>
                  <input
                    required
                    type="email"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-slate-300">
                  Business name (optional)
                </span>
                <input className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Message</span>
                <textarea
                  required
                  rows={5}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none"
                  placeholder="Tell us what you're looking for…"
                />
              </label>
              <Button type="submit" size="lg" className="w-full">
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
