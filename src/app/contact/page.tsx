"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

const inputStyles =
  "mt-1.5 w-full border-2 border-ink bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:bg-yolk/10 focus:outline-none";

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
        <p className="tag text-ink/50">Contact</p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">
          Talk to us
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          Products, custom designs, bulk orders. We usually reply within one
          business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <a
            href={`mailto:${site.email}`}
            className="box box-hover flex items-center gap-4 p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-yolk">
              <Mail className="h-5 w-5 text-ink" />
            </span>
            <div>
              <p className="tag text-ink/50">Email</p>
              <p className="font-bold text-ink">{site.email}</p>
            </div>
          </a>
          <a
            href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
            className="box box-hover flex items-center gap-4 p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-bubble">
              <Phone className="h-5 w-5 text-ink" />
            </span>
            <div>
              <p className="tag text-ink/50">Phone</p>
              <p className="font-bold text-ink">{site.phone}</p>
            </div>
          </a>
          <div className="box flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-mint">
              <MessageSquare className="h-5 w-5 text-ink" />
            </span>
            <div>
              <p className="tag text-ink/50">Bulk and custom</p>
              <p className="font-bold text-ink">Ask about volume pricing</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="box p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="box flex h-14 w-14 items-center justify-center bg-mint">
                <CheckCircle2 className="h-8 w-8 text-ink" />
              </div>
              <h2 className="mt-4 font-display text-xl uppercase text-ink">
                Message sent
              </h2>
              <p className="mt-2 max-w-sm text-sm text-ink/60">
                Thanks for reaching out. We&apos;ll get back to you at the email
                you provided.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink">Name</span>
                  <input required className={inputStyles} />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink">Email</span>
                  <input required type="email" className={inputStyles} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-ink">
                  Business name (optional)
                </span>
                <input className={inputStyles} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">Message</span>
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
