"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Cumulative reviews over six months: a card on the counter (2 yeses a day,
 * 26 open days a month) vs asking when someone remembers (2 a week).
 * Illustrative arithmetic, labelled as such on the page.
 *
 * Lives on the dark results band. Series colors validated for the dark
 * surface (dataviz six checks): emerald #059669 + blue #3B82F6.
 */
const MONTHS = ["M1", "M2", "M3", "M4", "M5", "M6"];
const WITH_CARD = [52, 104, 156, 208, 260, 312]; // 2/day x 26 days, cumulative
const ASKING = [9, 18, 27, 36, 45, 54]; // ~2/week, cumulative

const GREEN = "#059669";
const BLUE = "#3B82F6";

const W = 560;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
const Y_MAX = 350;
const Y_TICKS = [0, 100, 200, 300];

const x = (i: number) =>
  PAD.left + (i * (W - PAD.left - PAD.right)) / (MONTHS.length - 1);
const y = (v: number) =>
  H - PAD.bottom - (v / Y_MAX) * (H - PAD.top - PAD.bottom);

const toPath = (data: number[]) =>
  data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

export function GrowthChart() {
  const [hover, setHover] = useState<number | null>(null);
  const [labelsRevealed, setLabelsRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setLabelsRevealed(true), 1500);
    return () => clearTimeout(t);
  }, [inView]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(
      ((px - PAD.left) / (W - PAD.left - PAD.right)) * (MONTHS.length - 1),
    );
    setHover(Math.max(0, Math.min(MONTHS.length - 1, i)));
  }

  return (
    <div
      ref={ref}
      className="flex h-full flex-col rounded-md border border-white/10 bg-white/[0.04] p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold text-white">
          Reviews after six months
        </h3>
        <p className="text-xs text-neutral-500">
          Illustrative math · 26 open days a month
        </p>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-neutral-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GREEN }} />
          Card on the counter (2 yeses/day)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BLUE }} />
          Just asking (2/week)
        </span>
      </div>

      <div className="relative mt-4 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Line chart comparing cumulative reviews: about 312 with a card on the counter after six months versus about 54 by asking occasionally"
        >
          {/* Grid + y labels */}
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="#27272a"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                className="fill-neutral-500 text-[11px]"
              >
                {t}
              </text>
            </g>
          ))}
          {/* x labels */}
          {MONTHS.map((m, i) => (
            <text
              key={m}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-neutral-500 text-[11px]"
            >
              {m}
            </text>
          ))}

          {/* Crosshair */}
          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#52525b"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Series: draw themselves in when scrolled into view */}
          <motion.path
            d={toPath(ASKING)}
            fill="none"
            stroke={BLUE}
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <motion.path
            d={toPath(WITH_CARD)}
            fill="none"
            stroke={GREEN}
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
          />

          {/* Markers on hover */}
          {hover !== null && (
            <>
              <circle cx={x(hover)} cy={y(WITH_CARD[hover])} r="5" fill={GREEN} stroke="#0a0a0a" strokeWidth="2" />
              <circle cx={x(hover)} cy={y(ASKING[hover])} r="5" fill={BLUE} stroke="#0a0a0a" strokeWidth="2" />
            </>
          )}

          {/* Direct end labels: fade in after the draw, step aside while a
              tooltip is active so the two never overlap. */}
          <g
            style={{
              opacity: labelsRevealed && hover === null ? 1 : 0,
              transition: "opacity 200ms ease-out",
            }}
          >
            <circle cx={x(5) - 1} cy={y(WITH_CARD[5])} r="3.5" fill={GREEN} />
            <text x={x(5) - 10} y={y(WITH_CARD[5]) - 9} textAnchor="end" className="fill-white text-[12px] font-bold">
              312
            </text>
            <circle cx={x(5) - 1} cy={y(ASKING[5])} r="3.5" fill={BLUE} />
            <text x={x(5) - 10} y={y(ASKING[5]) - 9} textAnchor="end" className="fill-white text-[12px] font-bold">
              54
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-md border border-white/15 bg-neutral-900 px-3 py-2 text-xs shadow-lift"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform:
                hover >= (MONTHS.length - 1) / 2
                  ? "translateX(calc(-100% - 12px))"
                  : "translateX(12px)",
            }}
          >
            <p className="font-bold text-white">Month {hover + 1}</p>
            <p className="mt-1 flex items-center gap-1.5 text-neutral-300">
              <span className="h-2 w-2 rounded-sm" style={{ background: GREEN }} />
              Card: <strong className="text-white">{WITH_CARD[hover]}</strong>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-neutral-300">
              <span className="h-2 w-2 rounded-sm" style={{ background: BLUE }} />
              Asking: <strong className="text-white">{ASKING[hover]}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Accessible table view */}
      <table className="sr-only">
        <caption>Cumulative reviews by month, illustrative</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Card on counter</th>
            <th>Just asking</th>
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((m, i) => (
            <tr key={m}>
              <td>{m}</td>
              <td>{WITH_CARD[i]}</td>
              <td>{ASKING[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
