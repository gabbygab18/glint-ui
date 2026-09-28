"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface FlipFlowProps {
  /** Items to cycle through; each fills the whole tile. */
  items: ReactNode[];
  /** Ms between flips. */
  interval?: number;
  /** Ms one flip takes. */
  duration?: number;
  /** Ms before the first flip. Stagger this across tiles to make them flip one after another. */
  delay?: number;
  /** Tile width in px. */
  width?: number;
  /** Tile height in px. */
  height?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Stop cycling. */
  paused?: boolean;
  className?: string;
}

const css = `
@keyframes ff-top { from { transform: rotateX(0deg); } to { transform: rotateX(-90deg); } }
@keyframes ff-bot { from { transform: rotateX(90deg); } 70% { transform: rotateX(-7deg); } to { transform: rotateX(0deg); } }
@keyframes ff-shade-in { from { opacity: 0; } to { opacity: .55; } }
@keyframes ff-shade-out { from { opacity: .45; } to { opacity: 0; } }
`;

type Part = "top" | "bottom";

function Half({ part, children, style, shade }: { part: Part; children: ReactNode; style?: CSSProperties; shade?: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden rounded-[inherit] bg-card [backface-visibility:hidden]"
      style={{
        clipPath: part === "top" ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)",
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
      {/* Light falloff towards the hinge, like a real split-flap. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            part === "top"
              ? "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.28) 50%)"
              : "linear-gradient(to bottom, rgba(0,0,0,.18) 50%, transparent 62%)",
        }}
      />
      {shade && <div className="pointer-events-none absolute inset-0 bg-black" style={{ animation: shade }} />}
    </div>
  );
}

/**
 * A split-flap tile that flips through its items like a flip clock: the top half falls
 * over the hinge and the next item's bottom half lands under it. Put several side by side
 * with increasing `delay` to get a stream of tiles flipping one after another.
 */
export function FlipFlow({
  items,
  interval = 2600,
  duration = 800,
  delay = 0,
  width = 180,
  height = 240,
  radius = 16,
  paused = false,
  className,
}: FlipFlowProps) {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<{ from: number; to: number; n: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cur = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const n = items.length;
    if (!visible || paused || n < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let next: ReturnType<typeof setTimeout>;
    let land: ReturnType<typeof setTimeout> | undefined;
    let pending: number | null = null;
    let count = 0;

    const settle = (to: number) => {
      cur.current = to;
      pending = null;
      setIndex(to);
      setFlip(null);
    };
    const step = () => {
      const from = cur.current % n;
      const to = (from + 1) % n;
      if (reduce) settle(to);
      else {
        pending = to;
        setFlip({ from, to, n: count++ });
        land = setTimeout(() => settle(to), duration);
      }
      next = setTimeout(step, interval);
    };
    next = setTimeout(step, delay + Math.min(interval, 1200));

    return () => {
      clearTimeout(next);
      clearTimeout(land);
      // Never leave a tile frozen half-flipped.
      if (pending !== null) settle(pending);
    };
  }, [visible, paused, items.length, interval, duration, delay]);

  const n = Math.max(items.length, 1);
  const shown = index % n;
  const half = duration / 2;

  return (
    <div
      ref={root}
      className={`relative shrink-0 rounded-2xl shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] ${className ?? ""}`}
      style={{ width, height, borderRadius: radius, perspective: height * 3.5 }}
    >
      <style href="flip-flow" precedence="default">
        {css}
      </style>
      <Half part="top">{items[flip ? flip.to : shown]}</Half>
      <Half part="bottom">{items[shown]}</Half>
      {flip && (
        <>
          <Half
            key={`t${flip.n}`}
            part="top"
            shade={`ff-shade-in ${half}ms ease-in both`}
            style={{ animation: `ff-top ${half}ms cubic-bezier(.55,.05,.8,.4) both`, zIndex: 2 }}
          >
            {items[flip.from]}
          </Half>
          <Half
            key={`b${flip.n}`}
            part="bottom"
            shade={`ff-shade-out ${half}ms ease-out ${half}ms both`}
            style={{ animation: `ff-bot ${half}ms cubic-bezier(.25,.8,.4,1) ${half}ms both`, zIndex: 2 }}
          >
            {items[flip.to]}
          </Half>
        </>
      )}
      {/* Hinge. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-black/60" />
      <div aria-live="off" className="sr-only">
        {items[shown]}
      </div>
    </div>
  );
}
