"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Number of slides/steps to cycle through. */
  count: number;
  /** How long each one stays on screen. */
  durationMs: number;
  /** Hold the current slide and freeze its progress bar where it is. */
  paused?: boolean;
  /** Off for reduced motion — nothing advances and bars read as complete. */
  enabled?: boolean;
}

/**
 * Timer state for the homepage's self-playing sections.
 *
 * Progress is written straight to the DOM via `bindBar` rather than kept in
 * React state, so the fill runs at frame rate without re-rendering the slide
 * behind it. A CSS keyframe animation cannot do this job: pausing has to freeze
 * the fill exactly where it is and resuming has to carry on from there, and
 * re-keying an animation to restart it made the old bars jump.
 */
export function useAutoAdvance({
  count,
  durationMs,
  paused = false,
  enabled = true,
}: Options) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const elapsed = useRef(0);
  const bars = useRef<(HTMLElement | null)[]>([]);

  // Paint every bar: the active one to `p`, the rest empty.
  const paint = useCallback((p: number) => {
    bars.current.forEach((el, n) => {
      if (el) el.style.transform = `scaleX(${n === indexRef.current ? p : 0})`;
    });
  }, []);

  const go = useCallback(
    (n: number) => {
      const next = ((n % count) + count) % count;
      indexRef.current = next;
      elapsed.current = 0;
      setIndex(next);
      paint(enabled ? 0 : 1);
    },
    [count, paint, enabled],
  );

  const select = useCallback((n: number) => go(n), [go]);
  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);

  useEffect(() => {
    if (!enabled) {
      paint(1);
      return;
    }
    if (paused) return;

    let raf = 0;
    let last: number | null = null;
    const tick = (t: number) => {
      if (last !== null) elapsed.current += t - last;
      last = t;
      if (elapsed.current >= durationMs) {
        elapsed.current = 0;
        indexRef.current = (indexRef.current + 1) % count;
        setIndex(indexRef.current);
        paint(0);
      } else {
        paint(elapsed.current / durationMs);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, enabled, count, durationMs, paint]);

  /** Attach to each bar's fill element: `ref={bindBar(n)}`. */
  const bindBar = useCallback(
    (n: number) => (el: HTMLElement | null) => {
      bars.current[n] = el;
    },
    [],
  );

  return { index, select, next, prev, bindBar };
}
