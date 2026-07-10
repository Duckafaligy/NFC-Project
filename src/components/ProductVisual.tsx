import { Nfc } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  name: string;
  accent: [string, string];
  className?: string;
  /** Larger treatment for detail contexts. */
  featured?: boolean;
}

/**
 * A CSS-rendered "product photo": a flat-color NFC card with a thick black
 * border and hard shadow, sitting on a tinted panel. Swap for real product
 * photography later without touching layouts.
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
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: `${from}22` }}
    >
      {/* The card */}
      <div
        className={cn(
          "relative aspect-[1.6/1] w-3/5 rotate-[-4deg] border-2 border-ink shadow-brutal transition-transform duration-200",
          featured && "w-2/3 group-hover:rotate-0",
        )}
        style={{ background: from }}
      >
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-ink bg-white">
          <Nfc className="h-4 w-4 text-ink" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-2 w-10 border-2 border-ink bg-white" />
          <p className="mt-2 truncate font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
