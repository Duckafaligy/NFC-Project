import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * ⚠️ PLACEHOLDER CONTENT. Replace with real customer quotes before running
 * paid traffic. Publishing invented testimonials as if they were real is
 * illegal under FTC rules (16 CFR Part 465). Swap `testimonials` below with
 * genuine quotes (with permission) as soon as you have them; the layout
 * stays the same.
 */
const testimonials = [
  {
    quote:
      "We used to ask maybe one customer a week. Now the card sits next to the register and every checkout gets the invitation.",
    name: "Example: barbershop owner",
    detail: "Replace with a real customer quote",
  },
  {
    quote:
      "The custom design matched our menus exactly. Guests tap the stand while they wait for their card back.",
    name: "Example: restaurant manager",
    detail: "Replace with a real customer quote",
  },
  {
    quote:
      "I keep the keychain tag on my belt loop. Job done, customer happy, tap. Review posted before I pack the van.",
    name: "Example: mobile detailer",
    detail: "Replace with a real customer quote",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Happy counters</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            From businesses like yours
          </h2>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06}>
            <figure className="card flex h-full flex-col p-7">
              <div className="flex gap-1">
                {[...Array(5)].map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-neutral-100 pt-4">
                <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                <p className="text-xs text-neutral-400">{t.detail}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
