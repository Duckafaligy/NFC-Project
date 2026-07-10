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
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Let&apos;s talk
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Questions about products, custom designs, or bulk orders? We usually
          reply within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-slate-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold text-slate-900">{site.email}</p>
            </div>
          </a>
          <a
            href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-slate-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-semibold text-slate-900">{site.phone}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Bulk & custom</p>
              <p className="font-semibold text-slate-900">
                Ask about volume pricing
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
                Message sent!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Thanks for reaching out — we&apos;ll get back to you at the
                email you provided shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-700">Name</span>
                  <input
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-700">Email</span>
                  <input
                    required
                    type="email"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-slate-700">
                  Business name (optional)
                </span>
                <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Message</span>
                <textarea
                  required
                  rows={5}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
