import Image from "next/image";
import { cn } from "@/lib/utils";
import type { VisualKind } from "@/lib/products";

/**
 * Product imagery. These are the real card artworks (public/images/products/,
 * built from the supplier files by the prep step documented in the repo), not
 * drawings of them — the Google review card is shown as both faces because it
 * ships white on one side and black on the other, the Instagram card as the
 * printed gradient, and the stand as the printed face behind cast acrylic.
 */
interface ProductVisualProps {
  visual: VisualKind;
  name: string;
  className?: string;
  /** Larger, gently floating treatment for the product detail hero. */
  featured?: boolean;
}

const ART = {
  googleWhite: { src: "/images/products/google-white.webp", w: 688, h: 1100 },
  instagram: { src: "/images/products/instagram.webp", w: 688, h: 1100 },
} as const;

export function ProductVisual({
  visual,
  name,
  className,
  featured = false,
}: ProductVisualProps) {
  let body: React.ReactNode = null;

  if (visual === "google") {
    // Only the printed face is photographed. The reverse is shown once there
    // is a real shot of it — pairing a photograph with drawn artwork looked
    // obviously mismatched.
    body = (
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src={ART.googleWhite.src}
          alt={name}
          width={ART.googleWhite.w}
          height={ART.googleWhite.h}
          sizes="(max-width: 640px) 55vw, 320px"
          className="h-[84%] w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
        />
      </div>
    );
  } else if (visual === "instagram") {
    body = (
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src={ART.instagram.src}
          alt={name}
          width={ART.instagram.w}
          height={ART.instagram.h}
          sizes="(max-width: 640px) 55vw, 320px"
          className="h-[84%] w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
        />
      </div>
    );
  } else {
    // Acrylic stand: the printed white face behind a frosted panel, standing
    // on a weighted base.
    body = (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div
          className="relative flex h-[76%] items-center justify-center rounded-lg border border-white/70 p-[4%] shadow-[0_8px_20px_rgba(0,0,0,0.16)] ring-1 ring-inset ring-white/60"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(238,248,253,0.94) 55%, rgba(215,238,248,0.97) 100%)",
          }}
        >
          <Image
            src={ART.googleWhite.src}
            alt={name}
            width={ART.googleWhite.w}
            height={ART.googleWhite.h}
            sizes="(max-width: 640px) 45vw, 260px"
            className="h-full w-auto object-contain"
          />
        </div>
        {/* Weighted base */}
        <div className="h-[5%] w-[46%] rounded-b-md rounded-t-sm border border-neutral-700 bg-neutral-900" />
        <div className="h-[2%] w-[56%] rounded-[50%] bg-black/20 blur-[2px]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100",
        className,
      )}
      role="img"
      aria-label={name}
    >
      <div className={cn("h-full w-full", featured && "animate-float")}>
        {body}
      </div>
    </div>
  );
}
