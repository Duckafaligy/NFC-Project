import Link from "next/link";

/**
 * Continuous ticker band below the hero. Scrolls on its own, pauses on
 * hover, and every item links somewhere. Dot colors follow the semantic
 * palette (violet = pre-order, emerald = money, blue = info, amber = star).
 */
const items = [
  { label: "Pre-order open: 20% off everything", href: "/products", dot: "bg-violet-500" },
  { label: "312 reviews in 6 months at 2 yeses a day", href: "/products/google-review-card", dot: "bg-emerald-500" },
  { label: "Free shipping over $50", href: "/products", dot: "bg-blue-500" },
  { label: "Tap to review in about 20 seconds", href: "/#how-it-works", dot: "bg-amber-400" },
  { label: "30-day money-back guarantee", href: "/legal/returns", dot: "bg-emerald-500" },
  { label: "No monthly fees, ever", href: "/products", dot: "bg-violet-500" },
  { label: "Works with iPhone and Android", href: "/#how-it-works", dot: "bg-blue-500" },
];

export function Ticker() {
  const row = [...items, ...items];
  return (
    <div className="group overflow-hidden border-y border-neutral-200 bg-neutral-950 py-3">
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
          >
            <span className={`h-2 w-2 rounded-sm ${item.dot}`} aria-hidden />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
