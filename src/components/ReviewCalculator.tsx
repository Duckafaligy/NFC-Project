"use client";

import { useState } from "react";

/**
 * Interactive projection on the dark results band: the visitor sets their
 * own traffic and yes-rate, we do the arithmetic in front of them.
 */
/** Emerald fill up to the thumb, faint track after it. */
function fill(value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100;
  return {
    background: `linear-gradient(to right, #10b981 ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
  };
}

export function ReviewCalculator() {
  const [customers, setCustomers] = useState(40);
  const [yesRate, setYesRate] = useState(15);

  const perMonth = Math.round(customers * (yesRate / 100) * 26);
  const perSixMonths = perMonth * 6;

  return (
    <div className="flex h-full flex-col rounded-md border border-white/10 bg-white/[0.04] p-6">
      <h3 className="font-display text-lg font-extrabold text-white">
        Your counter, your math
      </h3>
      <p className="mt-1 text-xs text-neutral-500">
        Drag the sliders. 26 open days a month assumed.
      </p>

      <div className="mt-6 space-y-6">
        <label className="block">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-neutral-300">
              Customers per day
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              {customers}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={customers}
            onChange={(e) => setCustomers(Number(e.target.value))}
            className="slider mt-3"
            style={fill(customers, 10, 200)}
          />
        </label>

        <label className="block">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-neutral-300">
              Tap the card when asked
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              {yesRate}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={yesRate}
            onChange={(e) => setYesRate(Number(e.target.value))}
            className="slider mt-3"
            style={fill(yesRate, 5, 40)}
          />
        </label>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <div className="rounded-md bg-white p-4">
          <p className="font-display text-3xl font-extrabold text-neutral-900">
            {perMonth}
          </p>
          <p className="mt-1 text-xs text-neutral-500">new reviews a month</p>
        </div>
        <div className="rounded-md bg-emerald-600 p-4">
          <p className="font-display text-3xl font-extrabold text-white">
            {perSixMonths.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-100">in six months</p>
        </div>
      </div>
    </div>
  );
}
