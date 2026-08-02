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
  googleWhite: { src: "/images/products/google-white.webp", w: 685, h: 1100 },
  googleBlack: { src: "/images/products/google-black.webp", w: 636, h: 1100 },
  instagram: { src: "/images/products/instagram.webp", w: 688, h: 1100 },
  acrylic: { src: "/images/products/acrylic-stand.webp", w: 800, h: 1100 },
} as const;

export function ProductVisual({
  visual,
  name,
  className,
  featured = false,
}: ProductVisualProps) {
  let body: React.ReactNode = null;

  if (visual === "google") {
    // Both faces: the card ships white on one side and black on the other, so
    // showing one alone misrepresents what arrives.
    const faces = [
      { tag: "Front", art: ART.googleWhite },
      { tag: "Back", art: ART.googleBlack },
    ];
    body = (
      <div className="flex h-full w-full items-center justify-center gap-[6%] px-[5%]">
        {faces.map((f) => (
          <figure
            key={f.tag}
            className="flex h-full flex-col items-center justify-center"
          >
            <figcaption className="mb-[3%] font-display text-[11px] font-bold italic text-neutral-400">
              {f.tag}
            </figcaption>
            <Image
              src={f.art.src}
              alt={`${name} — ${f.tag.toLowerCase()} face`}
              width={f.art.w}
              height={f.art.h}
              sizes="(max-width: 640px) 40vw, 260px"
              className="h-[70%] w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
            />
          </figure>
        ))}
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
    // Acrylic stand. Unlike the cards this keeps its background: clear
    // acrylic has almost no edge against a pale counter, and a cut-out would
    // hack lumps out of the panel.
    body = (
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src={ART.acrylic.src}
          alt={name}
          width={ART.acrylic.w}
          height={ART.acrylic.h}
          sizes="(max-width: 640px) 55vw, 320px"
          className="h-[88%] w-auto rounded-lg object-contain shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
        />
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
