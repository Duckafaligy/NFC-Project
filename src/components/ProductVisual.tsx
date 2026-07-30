"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { VisualKind } from "@/lib/products";

/**
 * SVG renditions of the real products, drawn from the actual card artwork in
 * public/images/products/ref-*.png:
 *
 *  - Google review card — "Review Us On / Google", the four-colour G, the
 *    NFC hand-and-phone mark, then five stars along the bottom. Shipped
 *    double-sided, so both faces are shown.
 *  - Instagram card — "TAP TO FOLLOW US ON", the outlined camera glyph and
 *    the script wordmark on the orange-to-purple gradient.
 *  - Acrylic review stand — the white Google face on a frosted panel.
 *
 * Vector rather than photographs, so the artwork stays sharp at any size.
 */
interface ProductVisualProps {
  visual: VisualKind;
  name: string;
  className?: string;
  /** Larger, gently floating treatment for the product detail hero. */
  featured?: boolean;
}

const VB = { w: 320, h: 240 };

/** Card proportions taken from the reference art (167 x 251). */
const CARD = { w: 100, h: 150 };

// --- geometry helpers. Angles are clock-style: 0 = top, clockwise. ---
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}
function arc(cx: number, cy: number, r: number, start: number, end: number) {
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const STAR =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SCRIPT =
  "'Segoe Script', 'Bradley Hand', 'Brush Script MT', 'Snell Roundhand', cursive";

/**
 * The four-colour Google "G". The ring is broken by a notch on the right,
 * where the blue crossbar runs back to the centre — that gap is what makes
 * the mark read as a G rather than an O.
 */
function GoogleG({ cx, cy, r, w }: { cx: number; cy: number; r: number; w: number }) {
  // The bar's top edge meets the ring at this angle, so the blue arc starts
  // flush with it and the notch above stays clean.
  const half = (Math.asin(Math.min(1, w / 2 / r)) * 180) / Math.PI;
  const barTop = 90 - half;
  return (
    <g>
      <g fill="none" strokeWidth={w}>
        {/* Red runs from the upper left, over the top, and stops short of the
            bar — that white gap is what makes it a G. */}
        <path d={arc(cx, cy, r, 295, 360 + 60)} stroke="#EA4335" />
        <path d={arc(cx, cy, r, barTop, 145)} stroke="#4285F4" />
        <path d={arc(cx, cy, r, 145, 225)} stroke="#34A853" />
        <path d={arc(cx, cy, r, 225, 295)} stroke="#FBBC05" />
      </g>
      {/* Crossbar, running from the centre out to the ring. */}
      <rect x={cx - w * 0.1} y={cy - w / 2} width={r + w * 0.6} height={w} fill="#4285F4" />
    </g>
  );
}

/**
 * Signal arcs, used by both NFC marks. `dir` 1 bulges right (arcs radiating
 * away from something on the left), -1 bulges left.
 */
function Waves({
  x,
  cy,
  color,
  s,
  dir = 1,
}: {
  x: number;
  cy: number;
  color: string;
  s: number;
  dir?: 1 | -1;
}) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.15 * s} strokeLinecap="round">
      {[
        [3.2, 2.6],
        [5.8, 4.6],
        [8.4, 6.6],
      ].map(([r, h], i) => {
        const px = x + dir * (8.4 - r) * s;
        return (
          <path
            key={i}
            d={`M${px} ${cy - h * s} A ${r * s} ${r * s} 0 0 ${dir === 1 ? 1 : 0} ${px} ${cy + h * s}`}
          />
        );
      })}
    </g>
  );
}

/**
 * The contactless marks printed on the cards. The Google cards use a phone
 * with signal arcs and "NFC" set above it; the Instagram card sets "NFC"
 * beside the arcs instead.
 */
function NfcMark({
  cx,
  cy,
  color,
  s = 1,
  variant = "phone",
}: {
  cx: number;
  cy: number;
  color: string;
  s?: number;
  variant?: "phone" | "inline";
}) {
  if (variant === "inline") {
    return (
      <g>
        <text
          x={cx - 1 * s}
          y={cy + 2.4 * s}
          textAnchor="end"
          fontFamily={FONT}
          fontSize={7 * s}
          fontWeight={700}
          fill={color}
          letterSpacing={0.3 * s}
        >
          NFC
        </text>
        <Waves x={cx + 1.5 * s} cy={cy} color={color} s={s} />
      </g>
    );
  }
  return (
    <g>
      <text
        x={cx + 8.5 * s}
        y={cy + 0.5 * s}
        textAnchor="start"
        fontFamily={FONT}
        fontSize={5.5 * s}
        fontWeight={700}
        fill={color}
        letterSpacing={0.2 * s}
      >
        NFC
      </text>
      {/* Phone */}
      <rect
        x={cx - 0.5 * s}
        y={cy - 2.5 * s}
        width={7.5 * s}
        height={11.5 * s}
        rx={1.4 * s}
        fill="none"
        stroke={color}
        strokeWidth={1.15 * s}
      />
      <g transform={`translate(0 ${1.6 * s})`}>
        <Waves x={cx - 2.5 * s} cy={cy} color={color} s={s} dir={-1} />
      </g>
    </g>
  );
}

function Stars({
  cx,
  cy,
  color,
  size,
}: {
  cx: number;
  cy: number;
  color: string;
  size: number;
}) {
  const gap = size * 0.16;
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
    font?: string;
  },
) {
  return (
    <text
      x={cx}
      y={y}
      textAnchor="middle"
      fontFamily={opts.font ?? FONT}
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

/**
 * The printed Google face. `top` is the card's top edge and `s` scales the
 * 100 x 150 reference layout.
 */
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
  const fg = dark ? "#ffffff" : "#111111";
  return (
    <>
      {label("Review Us  On", cx, top + 27 * s, {
        size: 11.5 * s,
        color: fg,
        weight: 700,
      })}
      {label("Google", cx, top + 51 * s, {
        size: 25 * s,
        color: fg,
        weight: 500,
      })}
      <GoogleG cx={cx} cy={top + 82 * s} r={21.5 * s} w={11 * s} />
      <NfcMark cx={cx} cy={top + 118 * s} color={fg} s={s} />
      <Stars cx={cx} cy={top + 132 * s} color="#F5A623" size={13 * s} />
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
    // Both faces side by side — the card ships white on one side, black on
    // the other, so showing one face alone misrepresents it.
    const s = 1;
    const w = CARD.w * s;
    const h = CARD.h * s;
    const gap = 24;
    const y = 50;
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
              rx={9}
              fill={f.dark ? "#0a0a0a" : "#ffffff"}
              // The white card carries a fine rose keyline; the black one
              // needs a neutral edge to separate it from a dark backdrop.
              stroke={f.dark ? "#2a2a2a" : "#E9A8A8"}
              strokeWidth={1}
              filter={`url(#${shadowId})`}
            />
            <GoogleFace cx={f.cx} top={y} s={s} dark={f.dark} />
          </g>
        ))}
      </>
    );
  } else if (visual === "instagram") {
    const s = 1.28;
    const w = CARD.w * s;
    const h = CARD.h * s;
    const x = (VB.w - w) / 2;
    const y = (VB.h - h) / 2;
    const cx = VB.w / 2;
    const gs = 44 * s; // glyph box
    body = (
      <>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={10 * s}
          fill={`url(#${gradId})`}
          filter={`url(#${shadowId})`}
        />
        {label("TAP TO FOLLOW US ON", cx, y + 23 * s, {
          size: 6.3 * s,
          color: "#ffffff",
          weight: 700,
          spacing: 0.45 * s,
        })}
        {/* Outlined camera glyph */}
        <g fill="none" stroke="#ffffff" strokeWidth={4.2 * s}>
          <rect
            x={cx - gs / 2}
            y={y + 38 * s}
            width={gs}
            height={gs}
            rx={13 * s}
            ry={13 * s}
          />
          <circle cx={cx} cy={y + 38 * s + gs / 2} r={10.5 * s} />
          <circle
            cx={cx + 13 * s}
            cy={y + 49 * s}
            r={2.4 * s}
            fill="#ffffff"
            stroke="none"
          />
        </g>
        {label("Instagram", cx, y + 111 * s, {
          size: 23 * s,
          color: "#ffffff",
          weight: 600,
          italic: true,
          font: SCRIPT,
        })}
        <NfcMark
          cx={cx}
          cy={y + 130 * s}
          color="#ffffff"
          s={s * 0.95}
          variant="inline"
        />
      </>
    );
  } else {
    // Acrylic review stand: the printed white face behind cast acrylic,
    // standing on a weighted base.
    const s = 0.95;
    const w = CARD.w * s + 20;
    const h = CARD.h * s + 14;
    const cx = VB.w / 2;
    const y = 26;
    body = (
      <>
        {/* Base */}
        <ellipse cx={cx} cy={y + h + 26} rx={76} ry={9} fill="#000000" opacity={0.25} />
        <rect
          x={cx - 60}
          y={y + h + 8}
          width={120}
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
        <GoogleFace cx={cx} top={y + 7} s={s} dark={false} />
        {/* Inner keyline, so it reads as acrylic rather than paper */}
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
            {/* Orange at the bottom-left running to purple at the top-right,
                matching the printed gradient. */}
            <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#F4693C" />
              <stop offset="26%" stopColor="#E93E62" />
              <stop offset="56%" stopColor="#DD2A7B" />
              <stop offset="80%" stopColor="#C13584" />
              <stop offset="100%" stopColor="#9B3FB0" />
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
