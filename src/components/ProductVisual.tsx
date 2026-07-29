"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { VisualKind } from "@/lib/products";

/**
 * SVG "product photos" drawn to match the real products: the Google review
 * card (shown as its two faces — white on one side, black on the other, since
 * that is how it actually ships), the Instagram gradient card, and the acrylic
 * review stand. All portrait, matching the physical cards. Pure vector, so it
 * stays crisp at any size with no image files.
 */
interface ProductVisualProps {
  visual: VisualKind;
  name: string;
  className?: string;
  /** Larger, gently floating treatment for the product detail hero. */
  featured?: boolean;
}

const VB = { w: 320, h: 240 };

// --- geometry helpers ---
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}
function arc(cx: number, cy: number, r: number, start: number, end: number) {
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(
    2,
  )} ${y2.toFixed(2)}`;
}

const STAR =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** The four-colour Google "G" mark (a simplified, recognizable rendition). */
function GoogleG({ cx, cy, r, w }: { cx: number; cy: number; r: number; w: number }) {
  return (
    <g fill="none" strokeWidth={w}>
      <path d={arc(cx, cy, r, -2, 58)} stroke="#EA4335" />
      <path d={arc(cx, cy, r, 92, 178)} stroke="#4285F4" />
      <path d={arc(cx, cy, r, 178, 262)} stroke="#34A853" />
      <path d={arc(cx, cy, r, 262, 358)} stroke="#FBBC05" />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#4285F4" strokeWidth={w} />
    </g>
  );
}

function NfcWaves({
  cx,
  cy,
  color,
  s = 1,
}: {
  cx: number;
  cy: number;
  color: string;
  s?: number;
}) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.6 * s} strokeLinecap="round">
      <path d={`M${cx - 2 * s} ${cy - 5 * s} A ${7 * s} ${7 * s} 0 0 1 ${cx - 2 * s} ${cy + 5 * s}`} />
      <path d={`M${cx + 1 * s} ${cy - 8 * s} A ${11 * s} ${11 * s} 0 0 1 ${cx + 1 * s} ${cy + 8 * s}`} />
      <path d={`M${cx + 4 * s} ${cy - 11 * s} A ${15 * s} ${15 * s} 0 0 1 ${cx + 4 * s} ${cy + 11 * s}`} />
    </g>
  );
}

function Stars({ cx, cy, color, s = 1 }: { cx: number; cy: number; color: string; s?: number }) {
  const size = 15 * s;
  const gap = 3 * s;
  const total = 5 * size + 4 * gap;
  const startX = cx - total / 2;
  return (
    <g fill={color}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={STAR}
          transform={`translate(${startX + i * (size + gap)} ${cy}) scale(${size / 24})`}
        />
      ))}
    </g>
  );
}

function label(
  content: string,
  cx: number,
  y: number,
  opts: {
    size: number;
    color: string;
    weight?: number;
    spacing?: number;
    italic?: boolean;
  },
) {
  return (
    <text
      x={cx}
      y={y}
      textAnchor="middle"
      fontFamily={FONT}
      fontSize={opts.size}
      fontWeight={opts.weight ?? 700}
      fill={opts.color}
      letterSpacing={opts.spacing ?? 0}
      fontStyle={opts.italic ? "italic" : "normal"}
    >
      {content}
    </text>
  );
}

/** The Google review face, drawn at any position/scale. */
function GoogleFace({
  cx,
  top,
  s,
  dark,
}: {
  cx: number;
  top: number;
  s: number;
  dark: boolean;
}) {
  const fg = dark ? "#ffffff" : "#202124";
  return (
    <>
      {label("Review Us On", cx, top + 30 * s, { size: 11 * s, color: fg, weight: 600 })}
      {label("Google", cx, top + 52 * s, { size: 21 * s, color: fg, weight: 700 })}
      <GoogleG cx={cx} cy={top + 104 * s} r={26 * s} w={10 * s} />
      <NfcWaves cx={cx} cy={top + 146 * s} color={fg} s={s} />
      <Stars cx={cx} cy={top + 164 * s} color="#FBBF24" s={s} />
    </>
  );
}

export function ProductVisual({
  visual,
  name,
  className,
  featured = false,
}: ProductVisualProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `pv-ig-${uid}`;
  const shadowId = `pv-sh-${uid}`;
  const acrylicId = `pv-ac-${uid}`;

  let body: React.ReactNode = null;

  if (visual === "google") {
    // Both faces, side by side: white on one side, black on the other.
    const w = 100;
    const h = 156;
    const gap = 22;
    const y = 46;
    const s = w / 128; // scale relative to the single-card reference
    const leftCx = VB.w / 2 - gap / 2 - w / 2;
    const rightCx = VB.w / 2 + gap / 2 + w / 2;
    const faces: { cx: number; dark: boolean; tag: string }[] = [
      { cx: leftCx, dark: false, tag: "Front" },
      { cx: rightCx, dark: true, tag: "Back" },
    ];
    body = (
      <>
        {faces.map((f) => (
          <g key={f.tag}>
            {label(f.tag, f.cx, y - 12, {
              size: 11,
              color: "#9ca3af",
              weight: 700,
              italic: true,
            })}
            <rect
              x={f.cx - w / 2}
              y={y}
              width={w}
              height={h}
              rx={11}
              fill={f.dark ? "#0d0d0d" : "#ffffff"}
              stroke={f.dark ? "#2a2a2a" : "#e5e5e5"}
              strokeWidth={1}
              filter={`url(#${shadowId})`}
            />
            <GoogleFace cx={f.cx} top={y} s={s} dark={f.dark} />
          </g>
        ))}
      </>
    );
  } else if (visual === "instagram") {
    const w = 128;
    const h = 200;
    const x = (VB.w - w) / 2;
    const y = 20;
    const cx = VB.w / 2;
    body = (
      <g transform={`rotate(-4 ${cx} ${y + h / 2})`}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={14}
          fill={`url(#${gradId})`}
          filter={`url(#${shadowId})`}
        />
        {label("TAP TO FOLLOW US ON", cx, y + 32, {
          size: 8,
          color: "#ffffff",
          weight: 700,
          spacing: 1,
        })}
        <g fill="none" stroke="#ffffff" strokeWidth={5.5}>
          <rect x={cx - 27} y={y + 52} width={54} height={54} rx={16} ry={16} />
          <circle cx={cx} cy={y + 79} r={13} />
          <circle cx={cx + 15} cy={y + 66} r={2.6} fill="#ffffff" stroke="none" />
        </g>
        {label("Instagram", cx, y + 140, {
          size: 21,
          color: "#ffffff",
          weight: 700,
          italic: true,
        })}
        <NfcWaves cx={cx} cy={y + 172} color="#ffffff" />
      </g>
    );
  } else {
    // Acrylic review stand: a frosted panel angled on a weighted base.
    const w = 132;
    const h = 152;
    const cx = VB.w / 2;
    const y = 34;
    const s = w / 128;
    body = (
      <>
        {/* Base */}
        <ellipse cx={cx} cy={y + h + 26} rx={78} ry={9} fill="#000000" opacity={0.28} />
        <rect
          x={cx - 62}
          y={y + h + 8}
          width={124}
          height={16}
          rx={5}
          fill="#1c1c1f"
          stroke="#3a3a40"
          strokeWidth={1}
        />
        {/* Acrylic panel */}
        <rect
          x={cx - w / 2}
          y={y}
          width={w}
          height={h}
          rx={9}
          fill={`url(#${acrylicId})`}
          stroke="#cfe9f5"
          strokeWidth={1.5}
          filter={`url(#${shadowId})`}
        />
        {/* Printed face, inset so the star row clears the panel edge */}
        <GoogleFace cx={cx} top={y + 4} s={s * 0.78} dark={false} />
        {/* Edge highlight so it reads as acrylic, not paper */}
        <rect
          x={cx - w / 2 + 3}
          y={y + 3}
          width={w - 6}
          height={h - 6}
          rx={7}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          opacity={0.55}
        />
      </>
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
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F58529" />
              <stop offset="35%" stopColor="#DD2A7B" />
              <stop offset="70%" stopColor="#8134AF" />
              <stop offset="100%" stopColor="#515BD4" />
            </linearGradient>
            <linearGradient id={acrylicId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.97" />
              <stop offset="55%" stopColor="#eef8fd" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#d7eef8" stopOpacity="0.97" />
            </linearGradient>
            <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="7"
                floodColor="#000000"
                floodOpacity="0.18"
              />
            </filter>
          </defs>
          {body}
        </svg>
      </div>
    </div>
  );
}
