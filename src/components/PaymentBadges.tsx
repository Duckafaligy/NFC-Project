/** Accepted payment methods, shown near checkout actions for trust. */
const methods = ["Visa", "Mastercard", "Amex", "Discover", "Apple Pay", "G Pay"];

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {methods.map((m) => (
        <span
          key={m}
          className="rounded-md border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold text-stone-600"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
