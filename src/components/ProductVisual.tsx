import { Nfc } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  name: string;
  accent: [string, string];
  className?: string;
  /** Larger, animated treatment for hero / detail contexts. */
  featured?: boolean;
}

/**
 * A CSS-rendered "product photo" — a stylised NFC card / tag with the
 * product's accent gradient and a tap ripple. Keeps the site image-free and
 * fast while still looking premium. Swap for real photography later.
 */
export function ProductVisual({
  name,
  accent,
  className,
  featured = false,
}: ProductVisualProps) {
  const [from, to] = accent;
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        background: `radial-gradient(120% 120% at 20% 0%, ${from}22 0%, rgba(5,6,10,0) 55%), radial-gradient(120% 120% at 100% 100%, ${to}22 0%, rgba(5,6,10,0) 55%)`,
      }}
    >
      <div className="absolute inset-0 grid-texture opacity-40" />

      {/* The card */}
      <div
        className={cn(
          "relative aspect-[1.6/1] w-3/5 rotate-[-8deg] rounded-xl shadow-card ring-1 ring-white/20",
          featured && "animate-float",
        )}
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        {/* Glossy sheen */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-40" />
        {/* NFC glyph + tap ring */}
        <div className="absolute right-3 top-3 text-white/90">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-pulse-ring" />
            <Nfc className="relative h-5 w-5" strokeWidth={2.2} />
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1.5 w-10 rounded-full bg-white/70" />
          <p className="mt-2 truncate text-[11px] font-semibold uppercase tracking-widest text-white/90">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
