"use client";

import { useState } from "react";

/**
 * Interactive projection: the visitor sets their own traffic and yes-rate,
 * we do the arithmetic in front of them. No claims, just their numbers.
 */
export function ReviewCalculator() {
  const [customers, setCustomers] = useState(40);
  const [yesRate, setYesRate] = useState(15);

  const perMonth = Math.round(customers * (yesRate / 100) * 26);
  const perSixMonths = perMonth * 6;

  return (
    <div className="card flex h-full flex-col p-6">
      <h3 className="font-display text-lg font-extrabold text-neutral-900">
        Your counter, your math
      </h3>
      <p className="mt-1 text-xs text-neutral-400">
        Drag the sliders. 26 open days a month assumed.
      </p>

      <div className="mt-6 space-y-6">
        <label className="block">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-neutral-700">
              Customers per day
            </span>
            <span className="font-display text-xl font-extrabold text-neutral-900">
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
            className="mt-2 w-full accent-neutral-900"
          />
        </label>

        <label className="block">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-neutral-700">
              Tap the card when asked
            </span>
            <span className="font-display text-xl font-extrabold text-neutral-900">
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
            className="mt-2 w-full accent-neutral-900"
          />
        </label>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <div className="rounded-md bg-neutral-900 p-4">
          <p className="font-display text-3xl font-extrabold text-white">
            {perMonth}
          </p>
          <p className="mt-1 text-xs text-neutral-300">new reviews a month</p>
        </div>
        <div className="rounded-md bg-emerald-100 p-4">
          <p className="font-display text-3xl font-extrabold text-emerald-700">
            {perSixMonths.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-neutral-700">in six months</p>
        </div>
      </div>
    </div>
  );
}
