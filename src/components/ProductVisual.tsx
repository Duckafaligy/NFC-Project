"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { VisualKind } from "@/lib/products";

/**
 * SVG "product photos": a portrait NFC card floating on a light panel, drawn
 * to match each real card design (Google review in black/white, Instagram,
 * menu, website). Pure vector so it stays crisp at any size and needs no
 * image files. `color` picks a colourway for cards that have them (Google).
 */
interface ProductVisualProps {
  visual: VisualKind;
  name: string;
  /** Colourway id for products with variants, e.g. "black" | "white". */
  color?: string;
  className?: string;
  /** Larger, gently floating treatment for the product detail hero. */
  featured?: boolean;
}

// Card box within the 320×240 panel viewBox (portrait card, slightly rotated).
const CARD = { x: 96, y: 20, w: 128, h: 200 };
const CX = CARD.x + CARD.w / 2;

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

function NfcWaves({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d={`M${cx - 2} ${cy - 5} A 7 7 0 0 1 ${cx - 2} ${cy + 5}`} />
      <path d={`M${cx + 1} ${cy - 8} A 11 11 0 0 1 ${cx + 1} ${cy + 8}`} />
      <path d={`M${cx + 4} ${cy - 11} A 15 15 0 0 1 ${cx + 4} ${cy + 11}`} />
    </g>
  );
}

function Stars({ cy, color }: { cy: number; color: string }) {
  const size = 15;
  const gap = 3;
  const total = 5 * size + 4 * gap;
  const startX = CX - total / 2;
  return (
    <g fill={color}>
      {[0, 1, 2, 3, 4].map((i) => {
        const s = size / 24;
        return (
          <path
            key={i}
            d={STAR}
            transform={`translate(${startX + i * (size + gap)} ${cy}) scale(${s})`}
          />
        );
      })}
    </g>
  );
}

/** Fork / knife / spoon row, for the menu card. */
function Utensils({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 40;
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const gap = 15;
  const fx = cx - gap;
  const kx = cx;
  const sx = cx + gap;
  return (
    <g strokeLinecap="round">
      {/* Fork */}
      <g stroke={color} strokeWidth={2.3} fill="none">
        <line x1={fx - 4} y1={top} x2={fx - 4} y2={top + 11} />
        <line x1={fx} y1={top} x2={fx} y2={top + 11} />
        <line x1={fx + 4} y1={top} x2={fx + 4} y2={top + 11} />
        <line x1={fx} y1={top + 11} x2={fx} y2={bot} />
      </g>
      {/* Knife */}
      <path
        d={`M${kx - 3} ${top} L${kx + 1.5} ${top} L${kx} ${top + 16} Z`}
        fill={color}
      />
      <line
        x1={kx}
        y1={top + 14}
        x2={kx}
        y2={bot}
        stroke={color}
        strokeWidth={2.3}
      />
      {/* Spoon */}
      <ellipse
        cx={sx}
        cy={top + 7}
        rx={4.5}
        ry={7}
        fill="none"
        stroke={color}
        strokeWidth={2.1}
      />
      <line
        x1={sx}
        y1={top + 13}
        x2={sx}
        y2={bot}
        stroke={color}
        strokeWidth={2.3}
      />
    </g>
  );
}

const FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function text(
  content: string,
  y: number,
  opts: { size: number; color: string; weight?: number; spacing?: number; italic?: boolean },
) {
  return (
    <text
      x={CX}
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

export function ProductVisual({
  visual,
  name,
  color,
  className,
  featured = false,
}: ProductVisualProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `pv-ig-${uid}`;
  const shadowId = `pv-sh-${uid}`;

  const t = CARD.y; // top of card content

  let bg = "#0d0d0d";
  let border: string | undefined;
  let face: React.ReactNode = null;

  if (visual === "google") {
    const white = color === "white";
    bg = white ? "#ffffff" : "#0d0d0d";
    border = white ? "#e5e5e5" : undefined;
    const fg = white ? "#202124" : "#ffffff";
    face = (
      <>
        {text("Review Us On", t + 34, { size: 11, color: fg, weight: 600 })}
        {text("Google", t + 56, { size: 21, color: fg, weight: 700 })}
        <GoogleG cx={CX} cy={t + 108} r={26} w={10} />
        <NfcWaves cx={CX} cy={t + 150} color={fg} />
        <Stars cy={t + 168} color="#FBBF24" />
      </>
    );
  } else if (visual === "instagram") {
    face = (
      <>
        {text("TAP TO FOLLOW US ON", t + 32, {
          size: 8,
          color: "#ffffff",
          weight: 700,
          spacing: 1,
        })}
        {/* camera glyph */}
        <g fill="none" stroke="#ffffff" strokeWidth={5.5}>
          <rect
            x={CX - 27}
            y={t + 52}
            width={54}
            height={54}
            rx={16}
            ry={16}
          />
          <circle cx={CX} cy={t + 79} r={13} />
          <circle cx={CX + 15} cy={t + 66} r={2.6} fill="#ffffff" stroke="none" />
        </g>
        {text("Instagram", t + 140, {
          size: 21,
          color: "#ffffff",
          weight: 700,
          italic: true,
        })}
        <NfcWaves cx={CX} cy={t + 172} color="#ffffff" />
      </>
    );
  } else if (visual === "menu") {
    bg = "#0d0d0d";
    face = (
      <>
        <Utensils cx={CX} cy={t + 50} color="#ffffff" />
        {text("TAP TO VIEW OUR", t + 120, {
          size: 8.5,
          color: "#ffffff",
          weight: 700,
          spacing: 1.5,
        })}
        {text("MENU", t + 152, {
          size: 30,
          color: "#ffffff",
          weight: 800,
          spacing: 1,
        })}
        <NfcWaves cx={CARD.x + CARD.w - 26} cy={t + 178} color="#ffffff" />
      </>
    );
  } else {
    // website
    bg = "#0d0d0d";
    face = (
      <>
        {text("TAP FOR OUR", t + 32, { size: 9, color: "#bae6fd", weight: 700, spacing: 1 })}
        {text("Website", t + 58, { size: 22, color: "#ffffff", weight: 800 })}
        {/* browser window glyph */}
        <g transform={`translate(${CX - 34} ${t + 82})`}>
          <rect x={0} y={0} width={68} height={50} rx={7} fill="none" stroke="#ffffff" strokeWidth={4} />
          <line x1={0} y1={14} x2={68} y2={14} stroke="#ffffff" strokeWidth={4} />
          <circle cx={8} cy={7} r={2} fill="#38bdf8" />
          <circle cx={16} cy={7} r={2} fill="#ffffff" opacity={0.6} />
          <circle cx={24} cy={7} r={2} fill="#ffffff" opacity={0.6} />
          <rect x={10} y={24} width={30} height={4} rx={2} fill="#38bdf8" />
          <rect x={10} y={33} width={48} height={3} rx={1.5} fill="#ffffff" opacity={0.4} />
        </g>
        <NfcWaves cx={CX} cy={t + 172} color="#ffffff" />
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
      aria-label={`${name} card`}
    >
      <div className={cn("h-full w-full", featured && "animate-float")}>
        <svg viewBox="0 0 320 240" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F58529" />
              <stop offset="35%" stopColor="#DD2A7B" />
              <stop offset="70%" stopColor="#8134AF" />
              <stop offset="100%" stopColor="#515BD4" />
            </linearGradient>
            <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000000" floodOpacity="0.18" />
            </filter>
          </defs>

          <g transform={`rotate(-4 ${CX} ${CARD.y + CARD.h / 2})`}>
            <rect
              x={CARD.x}
              y={CARD.y}
              width={CARD.w}
              height={CARD.h}
              rx={14}
              fill={visual === "instagram" ? `url(#${gradId})` : bg}
              stroke={border}
              strokeWidth={border ? 1 : 0}
              filter={`url(#${shadowId})`}
            />
            {face}
          </g>
        </svg>
      </div>
    </div>
  );
}
