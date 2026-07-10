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
 * A CSS-rendered "product photo": a colored NFC card on a soft pastel panel.
 * Swap for real product photography later without touching layouts.
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
      style={{ background: `${from}1a` }}
    >
      <div
        className={cn(
          "relative aspect-[1.6/1] w-3/5 rotate-[-5deg] rounded-2xl shadow-lift",
          featured && "w-2/3 animate-float",
        )}
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/25 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
          <Nfc className="h-4 w-4 text-stone-800" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1.5 w-10 rounded-full bg-white/80" />
          <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-widest text-white">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
