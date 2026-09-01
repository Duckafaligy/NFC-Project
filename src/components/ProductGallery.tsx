"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  alt: string;
  w: number;
  h: number;
  /** Frame background to match the card's own colour. Defaults to "light". */
  tone?: "light" | "dark";
}

/**
 * One big frame with a thumbnail rail underneath — click a thumbnail to
 * swap the big image. Studio shots and real "in use" photos share the same
 * rail, so a buyer can flip between them without two separate blocks.
 */
export function ProductGallery({
  images,
  aspect,
}: {
  images: GalleryImage[];
  /** Tailwind aspect-ratio class for the big frame, e.g. "aspect-[4/3.2]". */
  aspect: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="card overflow-hidden p-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-md transition-colors",
          current.tone === "dark" ? "bg-neutral-900" : "bg-neutral-100",
          aspect,
        )}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-contain p-4"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md ring-1 transition-colors sm:w-20",
                img.tone === "dark" ? "bg-neutral-900" : "bg-neutral-100",
                i === active
                  ? "ring-2 ring-[#C1592E]"
                  : "ring-neutral-200 hover:ring-neutral-400",
              )}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-500">
        The actual product — photographed, not a render.
      </p>
    </div>
  );
}
