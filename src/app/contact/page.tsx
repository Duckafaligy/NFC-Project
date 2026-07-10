"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

const inputStyles =
  "mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No email backend yet. This simulates a successful send.
    // Wire this to an email service / form endpoint later.
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
          Talk to us
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Products, custom designs, bulk orders. We usually reply within one
          business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <a
            href={`mailto:${site.email}`}
            className="card card-hover flex items-center gap-4 p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100">
              <Mail className="h-5 w-5 text-orange-600" />
            </span>
            <div>
              <p className="text-sm text-stone-400">Email</p>
              <p className="font-bold text-stone-900">{site.email}</p>
            </div>
          </a>
          <a
            href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
            className="card card-hover flex items-center gap-4 p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
              <Phone className="h-5 w-5 text-sky-600" />
            </span>
            <div>
              <p className="text-sm text-stone-400">Phone</p>
              <p className="font-bold text-stone-900">{site.phone}</p>
            </div>
          </a>
          <div className="card flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </span>
            <div>
              <p className="text-sm text-stone-400">Bulk and custom</p>
              <p className="font-bold text-stone-900">
                Ask about volume pricing
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </span>
              <h2 className="mt-4 font-display text-xl font-extrabold text-stone-900">
                Message sent!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-stone-500">
                Thanks for reaching out. We&apos;ll get back to you at the email
                you provided.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-stone-700">
                    Name
                  </span>
                  <input required className={inputStyles} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-stone-700">
                    Email
                  </span>
                  <input required type="email" className={inputStyles} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-stone-700">
                  Business name (optional)
                </span>
                <input className={inputStyles} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-stone-700">
                  Message
                </span>
                <textarea
                  required
                  rows={5}
                  className={inputStyles}
                  placeholder="Tell us what you're looking for..."
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
