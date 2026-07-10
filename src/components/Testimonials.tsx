import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * ⚠️ PLACEHOLDER CONTENT — replace with real customer quotes before running
 * paid traffic. Publishing invented testimonials as if they were real is
 * illegal under FTC rules (16 CFR Part 465). Swap `testimonials` below with
 * genuine quotes (with permission) as soon as you have them; the layout
 * stays the same.
 */
const testimonials = [
  {
    quote:
      "We went from asking maybe one customer a week to tapping every single checkout. The card lives next to the register and does the work for us.",
    name: "Example: barbershop owner",
    detail: "Replace with a real customer quote",
  },
  {
    quote:
      "The custom design matched our menus exactly. Guests tap the stand while they wait for their card back — it's the easiest ask we've ever done.",
    name: "Example: restaurant manager",
    detail: "Replace with a real customer quote",
  },
  {
    quote:
      "I keep the keychain tag on my belt loop. Finish a job, customer's happy, tap — review done before I've packed the van.",
    name: "Example: mobile detailer",
    detail: "Replace with a real customer quote",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            From counters like yours
          </h2>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
              <div className="flex gap-1">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">{t.detail}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
