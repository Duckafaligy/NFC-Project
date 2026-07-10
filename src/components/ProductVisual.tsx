import { Nfc } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  name: string;
  accent: [string, string];
  className?: string;
  /** Larger, animated treatment for detail contexts. */
  featured?: boolean;
}

/**
 * A CSS-rendered "product photo": a black NFC card on a light neutral panel,
 * with a single small accent chip for product differentiation. Swap for real
 * product photography later without touching layouts.
 */
export function ProductVisual({
  name,
  accent,
  className,
  featured = false,
}: ProductVisualProps) {
  const [from] = accent;
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-neutral-100",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-[1.6/1] w-3/5 rotate-[-4deg] rounded-md bg-neutral-900 shadow-lift",
          featured && "w-2/3 animate-float",
        )}
      >
        {/* Subtle sheen */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        {/* Accent chip: the one spot of color */}
        <div
          className="absolute left-3 top-3 h-3 w-3 rounded-sm"
          style={{ background: from }}
        />
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
          <Nfc className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1.5 w-10 rounded-sm bg-white/70" />
          <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-widest text-white/90">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
