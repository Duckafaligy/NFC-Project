const items = [
  "More Google reviews",
  "No app needed",
  "Works with iPhone & Android",
  "Reprogram any time",
  "No monthly fees",
  "Ships in 1-2 days",
];

/** Scrolling text strip. A staple of brutalist storefronts. */
export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-yolk py-3">
      <div className="flex w-max animate-marquee gap-8">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap font-display text-sm uppercase tracking-wide text-ink"
          >
            {item} <span aria-hidden>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
